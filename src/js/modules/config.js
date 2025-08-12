// 全局配置：可在部署前按需覆盖 window.__APP_CONFIG__
(() => {
  const defaultConfig = {
    brand: 'eSIM Tools',
    // 若希望显示区间年份，如 2023–2025，请将 since 设置为起始年份
    since: 2025
  };
  if (!window.__APP_CONFIG__ || typeof window.__APP_CONFIG__ !== 'object') {
    window.__APP_CONFIG__ = { ...defaultConfig };
  } else {
    window.__APP_CONFIG__ = { ...defaultConfig, ...window.__APP_CONFIG__ };
  }
})();


