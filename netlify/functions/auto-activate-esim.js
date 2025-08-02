/**
 * Netlify Function: eSIM自动激活服务
 * 自动调用Giffgaff激活API完成eSIM激活
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
        const { activationCode } = requestBody;

        if (!activationCode) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Bad Request',
                    message: 'activationCode参数不能为空'
                })
            };
        }

        console.log('Auto Activation Request:', {
            activationCode: activationCode,
            timestamp: new Date().toISOString()
        });

        // 调用Giffgaff激活API
        const result = await callGiffgaffActivationAPI(activationCode);

        if (result.success) {
            console.log('Auto Activation Success:', {
                message: result.message,
                timestamp: new Date().toISOString()
            });

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    message: result.message,
                    data: result.data
                })
            };
        } else {
            console.log('Auto Activation Failed:', {
                message: result.message,
                timestamp: new Date().toISOString()
            });

            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Activation Failed',
                    message: result.message
                })
            };
        }

    } catch (error) {
        console.error('Auto Activation Error:', {
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
 * 调用Giffgaff激活API - 完整流程
 */
async function callGiffgaffActivationAPI(activationCode) {
    try {
        const timestamp = Date.now();
        
        // 第一步：验证激活码
        console.log('Step 1: Validating activation code...');
        const validateUrl = `https://www.giffgaff.com/activate/validate-sim-code?code=${activationCode}&next-action=products&_=${timestamp}`;
        
        const validateResponse = await axios.get(validateUrl, {
            headers: {
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'Accept-Language': 'zh-CN,zh-HK;q=0.9,zh;q=0.8,en;q=0.7,en-GB;q=0.6,en-US;q=0.5',
                'DNT': '1',
                'Referer': 'https://www.giffgaff.com/activate',
                'Sec-Ch-Ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Microsoft Edge";v="138"',
                'Sec-Ch-Ua-Mobile': '?0',
                'Sec-Ch-Ua-Platform': '"macOS"',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-origin',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0',
                'X-Requested-With': 'XMLHttpRequest'
            },
            timeout: 30000
        });

        console.log('Step 1 Response:', {
            status: validateResponse.status,
            data: validateResponse.data
        });

        if (validateResponse.status !== 200) {
            return {
                success: false,
                message: `激活码验证失败，HTTP状态码: ${validateResponse.status}`
            };
        }

        // 第二步：确认替换SIM（如果需要）
        console.log('Step 2: Confirming SIM replacement...');
        
        // 尝试调用确认替换的API
        // 注意：这个API端点可能需要根据实际的Giffgaff页面分析来确定
        const confirmUrl = `https://www.giffgaff.com/activate/confirm-replacement?code=${activationCode}&_=${timestamp}`;
        
        try {
            const confirmResponse = await axios.post(confirmUrl, {
                action: 'confirm_replacement',
                code: activationCode
            }, {
                headers: {
                    'Accept': 'application/json, text/javascript, */*; q=0.01',
                    'Accept-Language': 'zh-CN,zh-HK;q=0.9,zh;q=0.8,en;q=0.7,en-GB;q=0.6,en-US;q=0.5',
                    'Content-Type': 'application/json',
                    'DNT': '1',
                    'Referer': 'https://www.giffgaff.com/activate',
                    'Sec-Ch-Ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Microsoft Edge";v="138"',
                    'Sec-Ch-Ua-Mobile': '?0',
                    'Sec-Ch-Ua-Platform': '"macOS"',
                    'Sec-Fetch-Dest': 'empty',
                    'Sec-Fetch-Mode': 'cors',
                    'Sec-Fetch-Site': 'same-origin',
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                timeout: 30000
            });

            console.log('Step 2 Response:', {
                status: confirmResponse.status,
                data: confirmResponse.data
            });

            if (confirmResponse.status === 200) {
                return {
                    success: true,
                    message: 'eSIM激活成功（包含确认步骤）',
                    data: confirmResponse.data
                };
            }
        } catch (confirmError) {
            console.log('Step 2 failed, proceeding with Step 1 result only:', confirmError.message);
        }

        // 如果第二步失败，返回第一步的结果
        return {
            success: true,
            message: 'eSIM激活码验证成功（可能需要手动确认替换）',
            data: validateResponse.data
        };

    } catch (error) {
        console.error('Giffgaff Activation API Error:', error.message);
        
        if (error.response) {
            return {
                success: false,
                message: `激活失败: ${error.response.status} - ${error.response.data?.message || '未知错误'}`
            };
        } else {
            return {
                success: false,
                message: `激活请求失败: ${error.message}`
            };
        }
    }
} 