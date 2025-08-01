/**
 * 本地开发服务器
 * 提供静态文件服务和API代理功能
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件配置
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https:", "http:"],
            connectSrc: ["'self'", "https://api.qrserver.com", "https://appapi.simyo.nl", "https://api.giffgaff.com", "https://id.giffgaff.com", "https://publicapi.giffgaff.com"],
            fontSrc: ["'self'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"]
        }
    }
}));

app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use(express.static('.'));

// API路由 - 模拟Netlify Functions
const giffgaffMfaChallenge = require('./netlify/functions/giffgaff-mfa-challenge');
const giffgaffMfaValidation = require('./netlify/functions/giffgaff-mfa-validation');
const verifyCookie = require('./netlify/functions/verify-cookie');

// 包装Netlify Functions为Express路由
function wrapNetlifyFunction(handler) {
    return async (req, res) => {
        try {
            const event = {
                httpMethod: req.method,
                headers: req.headers,
                body: JSON.stringify(req.body),
                queryStringParameters: req.query
            };

            const context = {};
            const result = await handler.handler(event, context);

            res.status(result.statusCode);
            
            if (result.headers) {
                Object.entries(result.headers).forEach(([key, value]) => {
                    res.set(key, value);
                });
            }

            if (result.body) {
                const body = typeof result.body === 'string' ? result.body : JSON.stringify(result.body);
                res.send(body);
            } else {
                res.end();
            }
        } catch (error) {
            console.error('API Error:', error);
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message
            });
        }
    };
}

// API端点
app.use('/.netlify/functions/giffgaff-mfa-challenge', wrapNetlifyFunction(giffgaffMfaChallenge));
app.use('/.netlify/functions/giffgaff-mfa-validation', wrapNetlifyFunction(giffgaffMfaValidation));
app.use('/.netlify/functions/verify-cookie', wrapNetlifyFunction(verifyCookie));

// 路由配置
app.get('/giffgaff', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/giffgaff/giffgaff_complete_esim.html'));
});

app.get('/simyo', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/simyo/simyo_complete_esim.html'));
});

app.get('/simyo-static', (req, res) => {
    res.sendFile(path.join(__dirname, 'src/simyo/simyo_static.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 错误处理
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : '服务器内部错误'
    });
});

// 404处理
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: '请求的资源不存在'
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 eSIM工具服务器已启动`);
    console.log(`📍 本地地址: http://localhost:${PORT}`);
    console.log(`🔧 Giffgaff工具: http://localhost:${PORT}/giffgaff`);
    console.log(`📱 Simyo工具: http://localhost:${PORT}/simyo`);
    console.log(`🌐 环境: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;