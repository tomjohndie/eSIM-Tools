/**
 * Netlify Function: Cookie验证服务
 * 将Giffgaff Cookie转换为Access Token
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
        const { cookie } = requestBody;

        if (!cookie) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Bad Request',
                    message: 'Cookie参数不能为空'
                })
            };
        }

        console.log('Cookie Validation Request:', {
            cookieLength: cookie.length,
            timestamp: new Date().toISOString()
        });

        // 验证Cookie并获取Access Token
        const result = await validateCookieAndGetToken(cookie);

        if (result.success) {
            console.log('Cookie Validation Success:', {
                hasAccessToken: !!result.accessToken,
                timestamp: new Date().toISOString()
            });

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    accessToken: result.accessToken,
                    message: 'Cookie验证成功'
                })
            };
        } else {
            console.log('Cookie Validation Failed:', {
                message: result.message,
                timestamp: new Date().toISOString()
            });

            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Unauthorized',
                    message: result.message || 'Cookie验证失败'
                })
            };
        }

    } catch (error) {
        console.error('Cookie Validation Error:', {
            message: error.message,
            timestamp: new Date().toISOString()
        });

        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: 'Internal Server Error',
                message: '服务器内部错误'
            })
        };
    }
};

/**
 * 验证Cookie并获取Access Token
 */
async function validateCookieAndGetToken(cookieString) {
    try {
        // 解析Cookie
        const cookies = parseCookie(cookieString);
        
        if (Object.keys(cookies).length === 0) {
            return {
                success: false,
                message: 'Cookie格式无效'
            };
        }

        // 检查必要的Cookie字段
        const requiredCookies = ['session_token', 'user_id', 'auth_token'];
        const foundCookies = {};
        
        for (const required of requiredCookies) {
            if (cookies[required]) {
                foundCookies[required] = cookies[required];
            }
        }

        // 如果找不到关键Cookie，尝试其他可能的认证Cookie
        if (Object.keys(foundCookies).length === 0) {
            for (const [name, value] of Object.entries(cookies)) {
                const lowerName = name.toLowerCase();
                if (lowerName.includes('token') || 
                    lowerName.includes('session') || 
                    lowerName.includes('auth')) {
                    foundCookies[name] = value;
                }
            }
        }

        if (Object.keys(foundCookies).length === 0) {
            return {
                success: false,
                message: '未找到有效的认证Cookie'
            };
        }

        // 尝试使用Cookie调用Giffgaff API验证
        const accessToken = await callGiffgaffAPI(cookies);
        
        if (accessToken) {
            return {
                success: true,
                accessToken
            };
        } else {
            return {
                success: false,
                message: 'Cookie已过期或无效'
            };
        }

    } catch (error) {
        console.error('Cookie validation error:', error);
        return {
            success: false,
            message: '验证过程中发生错误'
        };
    }
}

/**
 * 解析Cookie字符串
 */
function parseCookie(cookieString) {
    const cookies = {};
    const pairs = cookieString.split(';');
    
    for (const pair of pairs) {
        const trimmedPair = pair.trim();
        if (!trimmedPair) continue;
        
        const parts = trimmedPair.split('=');
        if (parts.length === 2) {
            const name = parts[0].trim();
            const value = parts[1].trim();
            cookies[name] = value;
        }
    }
    
    return cookies;
}

/**
 * 使用Cookie调用Giffgaff API获取Access Token
 */
async function callGiffgaffAPI(cookies) {
    try {
        // 构建Cookie头
        const cookieHeader = Object.entries(cookies)
            .map(([name, value]) => `${name}=${value}`)
            .join('; ');

        // 尝试调用Giffgaff Dashboard验证Cookie
        const response = await axios.get(
            'https://www.giffgaff.com/dashboard',
            {
                headers: {
                    'Cookie': cookieHeader,
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                    'Accept-Language': 'zh-CN,zh-HK;q=0.9,zh;q=0.8,en;q=0.7,en-GB;q=0.6,en-US;q=0.5',
                    'Referer': 'https://www.giffgaff.com/auth/login/challenge',
                    'Cache-Control': 'max-age=0',
                    'DNT': '1',
                    'Sec-Ch-Ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Microsoft Edge";v="138"',
                    'Sec-Ch-Ua-Mobile': '?0',
                    'Sec-Ch-Ua-Platform': '"macOS"',
                    'Sec-Fetch-Dest': 'document',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-Site': 'same-origin',
                    'Sec-Fetch-User': '?1',
                    'Upgrade-Insecure-Requests': '1'
                },
                timeout: 30000,
                maxRedirects: 5
            }
        );

        if (response.status === 200 && response.data) {
            const htmlContent = response.data;
            
            // 检查页面是否包含登录成功的标识
            // 如果是登录页面，通常包含login/auth相关内容
            // 如果是dashboard，应该包含用户相关内容
            const isLoggedIn = htmlContent.includes('dashboard') || 
                              htmlContent.includes('account') ||
                              htmlContent.includes('profile') ||
                              htmlContent.includes('logout') ||
                              !htmlContent.includes('login');
            
            if (isLoggedIn) {
                // Cookie有效，检查是否有关键的认证Cookie
                console.log('Cookie validation: Dashboard access successful');
                
                // 查找关键的认证Cookie
                const authCookies = ['GGUID', 'giffgaff', 'JSESSIONID', 'XSRF-TOKEN'];
                let foundAuthCookie = null;
                
                for (const cookieName of authCookies) {
                    if (cookies[cookieName]) {
                        foundAuthCookie = cookies[cookieName];
                        console.log(`Found auth cookie: ${cookieName}`);
                        break;
                    }
                }
                
                // 如果找到认证Cookie，使用它作为token
                if (foundAuthCookie && foundAuthCookie.length > 20) {
                    return foundAuthCookie;
                }
                
                // 使用任何包含token的Cookie
                for (const [name, value] of Object.entries(cookies)) {
                    if (name.toLowerCase().includes('token') && value.length > 20) {
                        return value;
                    }
                }
                
                // 生成基于Cookie的临时token
                const tokenData = {
                    cookies_hash: require('crypto').createHash('md5').update(JSON.stringify(cookies)).digest('hex'),
                    timestamp: Date.now(),
                    source: 'cookie_validation'
                };
                
                return Buffer.from(JSON.stringify(tokenData)).toString('base64');
            } else {
                console.log('Cookie validation: Dashboard access failed - redirected to login');
            }
        }

        return null;

    } catch (error) {
        console.error('Giffgaff API call error:', error.message);
        return null;
    }
}