/**
 * Netlify Function: Giffgaff MFA Challenge
 * 处理MFA邮件验证码发送请求，解决CORS和403问题
 */

const axios = require('axios');

exports.handler = async (event, context) => {
    // 设置CORS头
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // 处理预检请求
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }
    // 不限制来源

    // 只允许POST请求
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({
                error: 'Method Not Allowed',
                message: '只允许POST请求'
            })
        };
    }

    try {
        // 解析请求体
        const requestBody = JSON.parse(event.body || '{}');
        const { source = "esim", preferredChannels = ["EMAIL"], cookie } = requestBody;

        // 从请求体或 Authorization 头提取 accessToken（兼容两种方式）
        const lowerCaseHeaders = Object.fromEntries(
            Object.entries(event.headers || {}).map(([k, v]) => [String(k).toLowerCase(), v])
        );
        const authHeader = lowerCaseHeaders['authorization'] || '';
        let accessToken = requestBody.accessToken;
        if (!accessToken && authHeader.startsWith('Bearer ')) {
            accessToken = authHeader.slice(7);
        }

        if (!accessToken && !cookie) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Bad Request',
                    message: 'accessToken 或 cookie 至少提供一个'
                })
            };
        }
        
    // 站点URL用于内部调用 verify-cookie（避免硬编码域名）
    const lowerCaseHeadersForUrl = Object.fromEntries(
        Object.entries(event.headers || {}).map(([k, v]) => [String(k).toLowerCase(), v])
    );
    const hostHeader = lowerCaseHeadersForUrl['x-forwarded-host'] || lowerCaseHeadersForUrl['host'] || '';
    const protoHeader = lowerCaseHeadersForUrl['x-forwarded-proto'] || 'https';
    const verifyCookieUrl = hostHeader ? `${protoHeader}://${hostHeader}/.netlify/functions/verify-cookie` : ((process.env.URL || '').replace(/\/$/, '') + '/.netlify/functions/verify-cookie');

    // 如果提供cookie但没有accessToken，先尝试使用cookie获取accessToken
        let mergedCookie = cookie || '';
        if (cookie) {
            // 预热：访问 dashboard 刷新并合并 Set-Cookie，提高 id.giffgaff.com 接口成功率
            try {
                const session = axios.create({ maxRedirects: 5, timeout: 30000, validateStatus: () => true });
                const dashResp = await session.get('https://www.giffgaff.com/dashboard', {
                    headers: {
                        'Cookie': mergedCookie,
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                        'Accept-Language': 'zh-CN,zh;q=0.9',
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 Edg/139.0.0.0',
                        'Referer': 'https://www.giffgaff.com/auth/login/challenge?redirect=%2Fdashboard',
                        'Upgrade-Insecure-Requests': '1',
                        'DNT': '1'
                    }
                });
                const setCookies = ([]).concat(dashResp.headers['set-cookie'] || []);
                if (setCookies.length) {
                    mergedCookie = mergeSetCookies(mergedCookie, setCookies);
                }
            } catch (e) {
                console.warn('Dashboard warm-up failed:', e.message);
            }
            // 若还没有 access token，则尝试一次 verify-cookie
            if (!accessToken) {
                try {
                    const cookieVerifyResponse = await axios.post(verifyCookieUrl, { cookie: mergedCookie }, {
                        headers: { 'Content-Type': 'application/json' },
                        timeout: 30000
                    });
                    if (cookieVerifyResponse.data?.success && cookieVerifyResponse.data?.accessToken) {
                        accessToken = cookieVerifyResponse.data.accessToken;
                        console.log('Successfully obtained access token from merged cookie');
                    }
                } catch (cookieError) {
                    console.error('Failed to verify merged cookie:', cookieError.message);
                }
            }
        }

        console.log('MFA Challenge Request:', {
            source,
            preferredChannels,
            tokenLength: accessToken ? accessToken.length : 0,
            hasCookie: !!cookie,
            timestamp: new Date().toISOString()
        });

        // 调用Giffgaff MFA API，失败且令牌过期时，尝试用cookie刷新一次
        // 获取 CSRF（可提升 /v4/mfa/challenge/me 的通过率）
        let csrfToken = null;
        if (mergedCookie) {
            try {
                const csrfResp = await axios.get('https://id.giffgaff.com/auth/csrf', {
                    headers: {
                        'Accept': 'application/json',
                        'Cookie': mergedCookie,
                        'User-Agent': 'giffgaff/1321 CFNetwork/1568.300.101 Darwin/24.2.0'
                    },
                    timeout: 15000
                });
                csrfToken = csrfResp.data?.token || null;
            } catch (e) {
                console.warn('Fetch CSRF failed:', e.message);
            }
        }

        const sendChallenge = async (token) => axios.post(
            'https://id.giffgaff.com/v4/mfa/challenge/me',
            { source, preferredChannels },
            {
                headers: (() => {
                    const h = {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 Edg/139.0.0.0',
                        'Origin': 'https://www.giffgaff.com',
                        'Referer': 'https://www.giffgaff.com/',
                        'Accept-Language': 'zh-CN,zh;q=0.9',
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    };
                    if (csrfToken) h['x-csrf-token'] = csrfToken;
                    if (token) h['Authorization'] = `Bearer ${token}`;
                    if (mergedCookie) h['Cookie'] = mergedCookie;
                    return h;
                })(),
                timeout: 30000
            }
        );

        let response;
        try {
            response = await sendChallenge(accessToken);
        } catch (err) {
            const status = err.response?.status;
            const data = err.response?.data || {};
            const isExpired = status === 401 && (data.error === 'invalid_token' || /expired/i.test(String(data.error_description || '')));
            if (isExpired && mergedCookie) {
                try {
                    const cookieVerifyResponse = await axios.post(verifyCookieUrl, { cookie: mergedCookie }, {
                        headers: { 'Content-Type': 'application/json' },
                        timeout: 30000
                    });
                    if (cookieVerifyResponse.data?.success && cookieVerifyResponse.data?.accessToken) {
                        let refreshed = cookieVerifyResponse.data.accessToken;
                        // 非JWT样式（无点号或长度过短）时，强制使用cookie通道
                        const looksLikeJwt = typeof refreshed === 'string' && refreshed.includes('.') && refreshed.length > 200;
                        if (!looksLikeJwt) {
                            refreshed = null;
                        }
                        console.log('Refreshed access token via cookie, retrying MFA challenge');
                        response = await sendChallenge(refreshed);
                    } else {
                        throw err;
                    }
                } catch (reErr) {
                    // 多次失败提示客户端需要刷新登录/重新获取Cookie
                    return {
                        statusCode: 401,
                        headers,
                        body: JSON.stringify({
                            error: 'MFA Challenge Failed',
                            message: 'Access token expired. Please re-login with cookie.',
                            details: data,
                            needReLogin: true
                        })
                    };
                }
            } else {
                throw err;
            }
        }

        console.log('MFA Challenge Success:', {
            status: response.status,
            hasRef: !!response.data.ref,
            timestamp: new Date().toISOString()
        });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(response.data)
        };

    } catch (error) {
        console.error('MFA Challenge Error:', {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            timestamp: new Date().toISOString()
        });

        const status = error.response?.status || 500;
        const errorMessage = error.response?.data?.message || error.message || '未知错误';

        return {
            statusCode: status,
            headers,
            body: JSON.stringify({
                error: 'MFA Challenge Failed',
                message: errorMessage,
                details: error.response?.data || null
            })
        };
    }
};

// 合并原始 Cookie 与 Set-Cookie 数组
function mergeSetCookies(originalCookieHeader, setCookieArray) {
    const jar = new Map();
    // 先装入原始 cookie
    String(originalCookieHeader || '')
        .split(';')
        .map(s => s.trim())
        .filter(Boolean)
        .forEach(kv => {
            const eq = kv.indexOf('=');
            if (eq > 0) {
                const k = kv.slice(0, eq).trim();
                const v = kv.slice(eq + 1).trim();
                if (k) jar.set(k, v);
            }
        });
    // 处理 set-cookie 覆盖
    for (const sc of setCookieArray) {
        const pair = String(sc).split(';')[0];
        const eq = pair.indexOf('=');
        if (eq > 0) {
            const k = pair.slice(0, eq).trim();
            const v = pair.slice(eq + 1).trim();
            if (k) jar.set(k, v);
        }
    }
    return Array.from(jar.entries()).map(([k, v]) => `${k}=${v}`).join('; ');
}