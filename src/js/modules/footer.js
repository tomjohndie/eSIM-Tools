// 统一页脚组件：自动注入到页面底部
import './config.js';

function getCopyrightText() {
  try {
    const cfg = window.__APP_CONFIG__ || {};
    const brand = cfg.brand || 'eSIM Tools';
    const since = Number(cfg.since) || new Date().getFullYear();
    const current = new Date().getFullYear();
    const yearText = since && since < current ? `${since}–${current}` : `${current}`;
    return `© ${yearText} ${brand}. 保留所有权利。`;
  } catch (_) {
    const current = new Date().getFullYear();
    return `© ${current} eSIM Tools. 保留所有权利。`;
  }
}

export function injectFooter(options = {}) {
  if (document.querySelector('footer[data-component="app-footer"]')) return;

  // 优先落位策略：
  // 1) 主页已有的 .footer（免责声明）内追加一行版权
  // 2) 落到 .main-container / .container / main 的末尾
  // 3) 最后退回到 body（避免因 body 为 flex row 导致横排：因此仅最后兜底）

  const createCopyrightNode = () => {
    const p = document.createElement('p');
    p.textContent = options.text || getCopyrightText();
    p.style.marginTop = '8px';
    return p;
  };

  // 情形 1：已有站内 footer（如首页免责声明区）
  const existingFooter = document.querySelector('.main-container .footer, .container .footer');
  if (existingFooter) {
    existingFooter.appendChild(createCopyrightNode());
    return;
  }

  // 情形 2 / 3：新建组件化 footer
  const container = document.createElement('footer');
  container.setAttribute('role', 'contentinfo');
  container.setAttribute('aria-label', '版权与声明');
  container.setAttribute('data-component', 'app-footer');
  container.style.cssText = [
    'margin-top:40px',
    'padding:16px 0',
    'border-top:1px solid #e5e7eb',
    'color:#6b7280',
    'text-align:center',
    'font-size:14px'
  ].join(';');
  container.appendChild(createCopyrightNode());

  const pickTarget = () => {
    return (
      document.querySelector('.main-container') ||
      document.querySelector('.container') ||
      document.querySelector('main') ||
      document.body
    );
  };

  const target = pickTarget();
  target.appendChild(container);
}

// DOM 就绪后自动注入（可按需在页面脚本中覆盖）
export function autoInjectFooter() {
  const run = () => injectFooter();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run, { once: true });
  } else {
    run();
  }
}


