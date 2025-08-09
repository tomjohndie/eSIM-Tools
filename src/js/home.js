// 首页脚本：无内联，配合严格 CSP 使用

// 初始化 GA（可在外链脚本加载前调用，API 将排队）
window.dataLayer = window.dataLayer || [];
function gtag(){ window.dataLayer.push(arguments); }
gtag('js', new Date());
gtag('config', 'G-HGX38HMNL1');

document.addEventListener('DOMContentLoaded', () => {
  // 仅对卡片元素应用 reveal，降低动画工作量
  const cards = document.querySelectorAll('.tool-card.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    cards.forEach(el => io.observe(el));
  } else {
    cards.forEach(el => el.classList.add('show'));
  }

  // 点击跟踪（可选）
  document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const toolName = btn.getAttribute('aria-describedby') === 'giffgaff-desc' ? 'Giffgaff' : 'Simyo';
      if (typeof gtag === 'function') {
        gtag('event', 'select_tool', { tool: toolName });
      }
    });
  });
});


