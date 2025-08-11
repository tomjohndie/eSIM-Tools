// 主入口文件
import '../styles/design-system.css';
import '../styles/animations.css';
import '../styles/mobile-responsive.css';

// 初始化性能优化
import './performance.js';
// 入口脚本：避免冗余控制台输出

// 通过构建时注入的环境变量设置访问密钥（仅用于本站 Netlify Functions）
window.ESIM_ACCESS_KEY = (typeof process !== 'undefined' && process.env && process.env.ESIM_ACCESS_KEY) ? process.env.ESIM_ACCESS_KEY : '';