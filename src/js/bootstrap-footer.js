// 统一引导脚本：在各页面加载后自动注入版权页脚
import { autoInjectFooter } from './modules/footer.js';

try {
  autoInjectFooter();
} catch (_) {}


