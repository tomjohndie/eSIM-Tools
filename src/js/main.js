// 主入口文件
import '../styles/design-system.css';
import '../styles/animations.css';
import '../styles/mobile-responsive.css';

// 初始化性能优化
import './performance.js';
import './modules/footer.js';
import { autoInjectFooter } from './modules/footer.js';
// 入口脚本：避免冗余控制台输出

// 通过构建时注入的环境变量设置访问密钥（仅用于本站 Netlify Functions）
window.ESIM_ACCESS_KEY = (typeof process !== 'undefined' && process.env && process.env.ESIM_ACCESS_KEY) ? process.env.ESIM_ACCESS_KEY : '';

// 注入 Turnstile site key（若存在则在页面加载后自动挂载 Turnstile）
// 优先使用构建环境变量；未配置则使用提供的站点密钥
window.TURNSTILE_SITE_KEY = (typeof process !== 'undefined' && process.env && process.env.TURNSTILE_SITE_KEY)
  ? process.env.TURNSTILE_SITE_KEY
  : '0x4AAAAAABqjeVscZAiqB11B';

if (window.TURNSTILE_SITE_KEY) {
  const s = document.createElement('script');
  s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
  s.async = true;
  s.defer = true;
  document.head.appendChild(s);

  // 定义回调，保存 token 供 /bff/* 请求使用
  window.onTurnstileDone = (token) => {
    window.__cfTurnstileToken = token;
  };

  // 初始化不可见 Turnstile 并立即执行获取 token
  const initTurnstile = () => {
    if (!window.turnstile) {
      setTimeout(initTurnstile, 300);
      return;
    }
    const container = document.createElement('div');
    document.body.appendChild(container);
    const widgetId = window.turnstile.render(container, {
      sitekey: window.TURNSTILE_SITE_KEY,
      size: 'invisible',
      callback: (token) => {
        window.__cfTurnstileToken = token;
      }
    });
    // 主动执行以获取 token（并定期刷新）
    const exec = () => { try { window.turnstile.execute(widgetId); } catch (_) {} };
    exec();
    setInterval(exec, 110000); // 约每110秒刷新一次
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTurnstile);
  } else {
    initTurnstile();
  }
}

// 统一注入版权页脚
try { autoInjectFooter(); } catch (_) {}