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

    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const form = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri || defaultRedirectUri,
      code_verifier: codeVerifier
    });

    const response = await axios.post(tokenUrl, form, {
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      timeout: 30000
    });

    return { statusCode: 200, headers, body: JSON.stringify(response.data) };
  } catch (error) {
    const status = error.response?.status || 500;
    const data = error.response?.data || { message: error.message };
    return {
      statusCode: status,
      headers,
      body: JSON.stringify({ error: 'Token Exchange Failed', details: data })
    };
  }
};