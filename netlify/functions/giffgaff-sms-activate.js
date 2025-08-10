/**
 * Netlify Function: Giffgaff SMS Activate (end-to-end)
 * 输入短信验证码后，后台自动完成：MFA校验 → 预订eSIM（如需）→ 网页激活 → 轮询获取LPA
 */

const axios = require('axios');

exports.handler = async (event, context) => {
  const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'https://esim.cosr.eu.org';
  const lower = Object.fromEntries(Object.entries(event.headers || {}).map(([k, v]) => [String(k).toLowerCase(), v]));
  const requestOrigin = lower['origin'];
  const ACCESS_KEY = process.env.ACCESS_KEY || process.env.ESIM_ACCESS_KEY || '';
  const getProvidedKey = () => {
    const fromHeader = lower['x-esim-key'] || lower['x-app-key'] || '';
    if (fromHeader) return fromHeader;
    try {
      const bodyObj = JSON.parse(event.body || '{}');
      if (bodyObj && typeof bodyObj.authKey === 'string') return bodyObj.authKey;
    } catch {}
    const q = event.queryStringParameters || {};
    if (q.authKey) return q.authKey;
    return '';
  };
  const headers = {
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    if (requestOrigin && requestOrigin !== ALLOWED_ORIGIN) {
      return { statusCode: 403, headers, body: JSON.stringify({ error: 'Forbidden', message: 'Origin not allowed' }) };
    }
    return { statusCode: 200, headers, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed', message: '只允许POST请求' }) };
  }

  if (requestOrigin && requestOrigin !== ALLOWED_ORIGIN) {
    return { statusCode: 403, headers, body: JSON.stringify({ error: 'Forbidden', message: 'Origin not allowed' }) };
  }

  // 鉴权参数校验
  if (ACCESS_KEY) {
    const provided = getProvidedKey();
    if (!provided || provided !== ACCESS_KEY) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized', message: 'Missing or invalid auth key' }) };
    }
  }

  try {
    const req = JSON.parse(event.body || '{}');
    const {
      ref,              // MFA ref（由 simSwapMfaChallenge 返回）
      code,             // 用户输入的短信验证码
      accessToken,      // OAuth Bearer Token（推荐提供）
      cookie,           // giffgaff 登录 Cookie（用于网页激活流程与token刷新）
      memberId,         // 可选：若前端已获取
      ssn,              // 可选：已有预订的 eSIM SSN
      activationCode    // 可选：已有预订的 eSIM Activation Code
    } = req;

    if (!ref || !code) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Bad Request', message: 'ref 与 code 必须提供' }) };
    }

    // 站点URL用于内部调用其他函数（避免硬编码域名）
    const lower = Object.fromEntries(Object.entries(event.headers || {}).map(([k, v]) => [String(k).toLowerCase(), v]));
    const host = lower['x-forwarded-host'] || lower['host'] || '';
    const proto = lower['x-forwarded-proto'] || 'https';
    const baseUrl = host ? `${proto}://${host}` : String(process.env.URL || '').replace(/\/$/, '');

    // 统一创建 GraphQL 客户端
    const createGraphql = (token, extraHeaders = {}) => (body) => axios.post(
      'https://publicapi.giffgaff.com/gateway/graphql',
      body,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': token ? `Bearer ${token}` : undefined,
          'Origin': 'https://www.giffgaff.com',
          'Referer': 'https://www.giffgaff.com/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          // 模拟App头，提升通过率
          'x-gg-app-os': process.env.GG_APP_OS || 'iOS',
          'x-gg-app-os-version': process.env.GG_APP_OS_VERSION || '18.2',
          'x-gg-app-build-number': process.env.GG_APP_BUILD_NUMBER || '1321',
          'x-gg-app-device-manufacturer': process.env.GG_APP_DEVICE_MANUFACTURER || 'Apple',
          'x-gg-app-device-model': process.env.GG_APP_DEVICE_MODEL || 'iPhone SE',
          ...extraHeaders
        },
        timeout: 30000
      }
    );

    // 1) 获取 CSRF Token（用于 /v4/mfa/validation）
    let csrfToken = null;
    if (cookie) {
      try {
        const csrfResp = await axios.get('https://id.giffgaff.com/auth/csrf', {
          headers: {
            'Accept': 'application/json',
            'Cookie': cookie,
            'User-Agent': 'giffgaff/1321 CFNetwork/1568.300.101 Darwin/24.2.0'
          },
          timeout: 15000
        });
        csrfToken = csrfResp.data?.token || null;
      } catch (e) {
        // 不中断流程；若缺失仍尝试验证
        console.warn('Fetch CSRF failed:', e.message);
      }
    }

    // 2) 校验短信验证码，获取签名
    const validationHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'giffgaff/1321 CFNetwork/1568.300.101 Darwin/24.2.0',
      'Origin': 'https://www.giffgaff.com',
      'Referer': 'https://www.giffgaff.com/'
    };
    if (accessToken) validationHeaders['Authorization'] = `Bearer ${accessToken}`;
    if (cookie) validationHeaders['Cookie'] = cookie;
    if (csrfToken) validationHeaders['x-csrf-token'] = csrfToken;

    let validationResp;
    try {
      validationResp = await axios.post(
        'https://id.giffgaff.com/v4/mfa/validation',
        { ref, code },
        { headers: validationHeaders, timeout: 30000 }
      );
    } catch (err) {
      const status = err.response?.status || 500;
      const detail = err.response?.data;
      return { statusCode: status, headers, body: JSON.stringify({ error: 'MFA Validation Failed', details: detail }) };
    }

    const mfaSignature = validationResp.data?.signature;
    if (!mfaSignature) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'SignatureMissing', message: '未获取到MFA签名' }) };
    }

    // 3) 若无 ssn/activationCode，则：获取 memberId → 预订 eSIM（SWITCH）
    let currentMemberId = memberId || null;
    let currentSSN = ssn || null;
    let currentActivationCode = activationCode || null;

    const gql = createGraphql(accessToken);

    if (!currentMemberId) {
      const q = {
        query: `query getMemberProfileAndSim { memberProfile { id } sim { status } }`,
        variables: {},
        operationName: 'getMemberProfileAndSim'
      };
      const r = await gql(q);
      currentMemberId = r.data?.data?.memberProfile?.id || null;
      if (!currentMemberId) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'MemberIdMissing', message: '无法获取会员ID' }) };
      }
    }

    if (!currentSSN || !currentActivationCode) {
      const reserveBody = {
        query: `mutation reserveESim($input: ESimReservationInput!) { reserveESim: reserveESim(input: $input) { id memberId status esim { ssn activationCode deliveryStatus __typename } __typename } }`,
        variables: { input: { memberId: currentMemberId, userIntent: 'SWITCH' } },
        operationName: 'reserveESim'
      };

      const r = await createGraphql(accessToken, { 'X-MFA-Signature': mfaSignature })(reserveBody);
      const reservation = r.data?.data?.reserveESim;
      if (!reservation?.esim) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: 'ReserveFailed', details: r.data }) };
      }
      currentSSN = reservation.esim.ssn;
      currentActivationCode = reservation.esim.activationCode;
    }

    // 4) 通过已有的本项目函数执行网页激活（等价手工确认）
    if (!currentActivationCode) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'ActivationCodeMissing', message: '缺少激活码' }) };
    }

    const autoActivateUrl = `${baseUrl}/.netlify/functions/auto-activate-esim`;
    const autoResp = await axios.post(autoActivateUrl, { activationCode: currentActivationCode, cookie, accessToken }, { headers: { 'Content-Type': 'application/json' }, timeout: 60000 });
    if (!(autoResp.data && (autoResp.data.success || autoResp.status === 200))) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'AutoActivateFailed', details: autoResp.data }) };
    }

    // 5) 轮询获取 LPA（最长 ~120秒）
    const downloadQuery = {
      query: `query eSimDownloadToken($ssn: String!) { eSimDownloadToken(ssn: $ssn) { id host matchingId lpaString __typename } }`,
      variables: { ssn: currentSSN },
      operationName: 'eSimDownloadToken'
    };

    const deadline = Date.now() + 120000;
    let lastData = null;
    while (Date.now() < deadline) {
      try {
        const r = await gql(downloadQuery);
        lastData = r.data?.data?.eSimDownloadToken || null;
        if (lastData?.lpaString) {
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              lpaString: lastData.lpaString,
              token: lastData,
              ssn: currentSSN,
              activationCode: currentActivationCode
            })
          };
        }
      } catch (e) {
        // 忽略短暂错误，继续轮询
      }
      await new Promise(r => setTimeout(r, 4000));
    }

    return { statusCode: 202, headers, body: JSON.stringify({ success: false, message: '激活已提交，但暂未获取到LPA，请稍后在“获取eSIM Token”重试。' }) };

  } catch (error) {
    console.error('SMS Activate Error:', { message: error.message });
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal Server Error', message: error.message }) };
  }
};


