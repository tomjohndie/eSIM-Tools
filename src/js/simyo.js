/**
 * Simyo eSIM 工具 - 主入口文件
 * 
 * 这个文件负责初始化 Simyo eSIM 管理应用
 * 所有业务逻辑已经模块化到 modules/simyo/ 目录下
 */

// 导入样式
import '../styles/design-system.css';
import '../styles/animations.css';
import '../styles/mobile-responsive.css';

// 导入性能优化模块
import './performance.js';

// 导入 Simyo 应用主模块
import simyoApp from './modules/simyo/app.js';

// 将应用实例暴露到全局（用于调试和某些内联事件处理）
window.simyoApp = simyoApp;

// 生产环境不打印冗余日志

// 导出应用实例
export default simyoApp;