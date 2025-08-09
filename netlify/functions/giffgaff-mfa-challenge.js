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

        console.log('MFA Challenge Request:', {
            source,
            preferredChannels,
            tokenLength: accessToken.length,
            timestamp: new Date().toISOString()
        });

        // 调用Giffgaff MFA API
        const response = await axios.post(
            'https://id.giffgaff.com/v4/mfa/challenge/me',
            {
                source,
                preferredChannels
            },
            {
                headers: (() => {
                    const h = {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Origin': 'https://www.giffgaff.com',
                        'Referer': 'https://www.giffgaff.com/',
                        'Accept-Language': 'en-US,en;q=0.9',
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    };
                    if (accessToken) h['Authorization'] = `Bearer ${accessToken}`;
                    if (!accessToken && cookie) h['Cookie'] = cookie;
                    return h;
                })(),
                timeout: 30000
            }
        );

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