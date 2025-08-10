/**
 * Netlify Function: Giffgaff OAuth Token Exchange
 * 将前端回调得到的 authorization code 与 code_verifier 交换为 access_token
 * 机密信息只存在于服务端环境变量中，避免前端泄露
 */

const axios = require('axios');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed', message: '只允许POST请求' })
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { code, code_verifier: codeVerifier, redirect_uri: redirectUri } = body;

    if (!code || !codeVerifier) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Bad Request', message: 'code 与 code_verifier 均为必需参数' })
      };
    }

    const clientId = process.env.GIFFGAFF_CLIENT_ID;
    const clientSecret = process.env.GIFFGAFF_CLIENT_SECRET;
    const tokenUrl = process.env.GIFFGAFF_TOKEN_URL || 'https://id.giffgaff.com/auth/oauth/token';
    const defaultRedirectUri = process.env.GIFFGAFF_REDIRECT_URI || 'giffgaff://auth/callback/';

    if (!clientId || !clientSecret) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Server Misconfiguration',
          message: '缺少 GIFFGAFF_CLIENT_ID 或 GIFFGAFF_CLIENT_SECRET 环境变量'
        })
      };
    }

    // 尝试清理客户端密钥中可能存在的问题
    let cleanedSecret = clientSecret;
    // 如果密钥末尾有百分号，尝试去除
    if (clientSecret.endsWith('%')) {
      cleanedSecret = clientSecret.slice(0, -1);
      console.log('检测到客户端密钥末尾有百分号，已去除');
    }
    
    console.log(`使用客户端ID: ${clientId.substring(0, 5)}*****`);
    console.log(`客户端密钥长度: ${cleanedSecret.length}`);
    const authHeader = Buffer.from(`${clientId}:${cleanedSecret}`).toString('base64');

    const form = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri || defaultRedirectUri,
      code_verifier: codeVerifier
    });

    // 添加调试日志
console.log(`请求令牌端点: ${tokenUrl}`);
console.log(`请求参数: ${form.toString()}`);
// 不打印敏感信息
console.log(`请求头部: Authorization: Basic ******, Content-Type: application/x-www-form-urlencoded`);

// 尝试使用表单参数方式发送客户端凭据，而不是通过Authorization头
const formWithCredentials = new URLSearchParams({
  grant_type: 'authorization_code',
  code,
  redirect_uri: redirectUri || defaultRedirectUri,
  code_verifier: codeVerifier,
  client_id: clientId,
  client_secret: cleanedSecret
});

console.log(`请求参数(包含凭据): ${formWithCredentials.toString().replace(cleanedSecret, '******')}`);

// 确保授权码没有被额外编码
// 如果授权码中包含了URL编码字符，尝试解码一次
let decodedCode = code;
try {
  if (code.includes('%')) {
    const possiblyDecodedCode = decodeURIComponent(code);
    if (possiblyDecodedCode !== code) {
      decodedCode = possiblyDecodedCode;
      console.log('检测到授权码可能被多次编码，已解码');
      
      // 更新表单参数
      formWithCredentials.set('code', decodedCode);
    }
  }
} catch (e) {
  console.log('授权码解码失败，使用原始码');
}

const response = await axios.post(tokenUrl, formWithCredentials, {
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'application/json'
  },
  timeout: 30000
});

    return { statusCode: 200, headers, body: JSON.stringify(response.data) };
  } catch (error) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { message: error.message };
    
    // 添加详细错误日志
    console.error('Token exchange error:', {
      status,
      data,
      message: error.message,
      stack: error.stack
    });
    
    return {
      statusCode: status,
      headers,
      body: JSON.stringify({ error: 'Token Exchange Failed', details: data })
    };
  }
};