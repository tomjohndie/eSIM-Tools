/**
 * Giffgaff API 交互模块
 */

class APIManager {
  constructor() {
    // 统一通过无服务器函数代理，避免环境分歧与CORS问题
    this.endpoints = {
      mfaChallenge: "/.netlify/functions/giffgaff-mfa-challenge",
      mfaValidation: "/.netlify/functions/giffgaff-mfa-validation",
      graphql: "/.netlify/functions/giffgaff-graphql",
      tokenExchange: "/.netlify/functions/giffgaff-token-exchange",
      cookieVerify: "/.netlify/functions/verify-cookie",
      autoActivate: "/.netlify/functions/auto-activate-esim"
    };
  }

  /**
   * 发送 MFA 挑战（发送邮件验证码）
   * @param {string} accessToken - 访问令牌
   * @returns {Promise<Object>} MFA Challenge Response
   */
  async sendMFAChallenge(accessToken) {
    const response = await fetch(this.endpoints.mfaChallenge, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        accessToken,
        source: 'esim',
        preferredChannels: ['EMAIL']
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`MFA Challenge failed: ${response.status} - ${errorText}`);
    }

    return await response.json();
  }

  /**
   * 验证 MFA 代码
   * @param {string} accessToken - 访问令牌
   * @param {string} ref - MFA Reference
   * @param {string} code - 验证码
   * @returns {Promise<Object>} MFA Validation Response
   */
  async validateMFACode(accessToken, ref, code) {
    const response = await fetch(this.endpoints.mfaValidation, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        accessToken,
        ref: ref,
        code: code
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`MFA Validation failed: ${response.status} - ${errorText}`);
    }

    return await response.json();
  }

  /**
   * 执行 GraphQL 查询
   * @param {string} accessToken - 访问令牌
   * @param {string} query - GraphQL 查询
   * @param {Object} variables - GraphQL 变量
   * @param {string} mfaSignature - MFA 签名（可选）
   * @returns {Promise<Object>} GraphQL Response
   */
  async graphqlQuery(accessToken, query, variables = {}, mfaSignature = null) {
    const response = await fetch(this.endpoints.graphql, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
      body: JSON.stringify({
        accessToken,
        mfaSignature: mfaSignature || undefined,
        query,
        variables
      })
    });

    if (!response.ok) {
      const text = await response.text();
      if (response.status === 429) {
        throw new Error('请求过于频繁，请稍后重试（429）。建议在服务窗口内操作。');
      }
      if (response.status === 403) {
        throw new Error('权限不足或登录过期（403）。请重新登录或稍后再试。');
      }
      if (response.status === 408 || response.status === 504) {
        throw new Error('请求超时，请检查网络后重试。');
      }
      throw new Error(`GraphQL request failed: ${response.status} - ${text}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    return data;
  }

  /**
   * 服务端代办 Token 交换
   * @param {string} code
   * @param {string} codeVerifier
   * @param {string} redirectUri 可选
   */
  async exchangeTokenServerSide(code, codeVerifier, redirectUri) {
    const response = await fetch(this.endpoints.tokenExchange, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, code_verifier: codeVerifier, redirect_uri: redirectUri })
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server token exchange failed: ${response.status} - ${errorText}`);
    }
    return await response.json();
  }

  /**
   * 获取会员信息
   * @param {string} accessToken - 访问令牌
   * @returns {Promise<Object>} Member Profile
   */
  async getMemberProfile(accessToken) {
    const query = `
      query getMemberProfileAndSim {
        memberProfile {
          id
          memberName
          __typename
        }
        sim {
          phoneNumber
          status
          __typename
        }
      }
    `;

    return await this.graphqlQuery(accessToken, query);
  }

  /**
   * 预订 eSIM
   * @param {string} accessToken - 访问令牌
   * @param {string} memberId - 会员 ID
   * @param {string} mfaSignature - MFA 签名
   * @returns {Promise<Object>} Reserve eSIM Response
   */
  async reserveESIM(accessToken, memberId, mfaSignature) {
    const query = `
      mutation reserveESim($input: ESimReservationInput!) {
        reserveESim: reserveESim(input: $input) {
          id
          memberId
          reservationStartDate
          reservationEndDate
          status
          esim {
            ssn
            activationCode
            deliveryStatus
            associatedMemberId
            __typename
          }
          __typename
        }
      }
    `;

    const variables = {
      input: {
        memberId: memberId,
        userIntent: "SWITCH"
      }
    };

    return await this.graphqlQuery(accessToken, query, variables, mfaSignature);
  }

  /**
   * 获取 eSIM 下载令牌
   * @param {string} accessToken - 访问令牌
   * @param {string} ssn - eSIM SSN
   * @returns {Promise<Object>} eSIM Token Response
   */
  async getESIMToken(accessToken, ssn) {
    const query = `
      query eSimDownloadToken($ssn: String!) {
        eSimDownloadToken(ssn: $ssn) {
          id
          host
          matchingId
          lpaString
          __typename
        }
      }
    `;

    const variables = {
      ssn: ssn
    };

    return await this.graphqlQuery(accessToken, query, variables);
  }

  /**
   * 验证 Cookie
   * @param {string} cookie - Cookie 字符串
   * @returns {Promise<Object>} Cookie Verification Response
   */
  async verifyCookie(cookie) {
    const response = await fetch(this.endpoints.cookieVerify, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cookie: cookie
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cookie verification failed: ${response.status} - ${errorText}`);
    }

    return await response.json();
  }

  /**
   * 自动激活 eSIM
   * @param {string} activationCode - 激活码
   * @returns {Promise<Object>} Auto Activation Response
   */
  async autoActivateESIM(activationCode) {
    const response = await fetch(this.endpoints.autoActivate, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        activationCode: activationCode
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Auto activation failed: ${response.status} - ${errorText}`);
    }

    return await response.json();
  }
}

export default new APIManager();