# eSIM Tools 性能优化指南

## 概述

本项目已实施全面的性能优化，包括资源压缩、Service Worker离线支持、图片优化、微交互动画等。

## 优化特性

### 1. 资源压缩与优化

#### Webpack构建优化
- **代码分割**: 自动分离第三方库和业务代码
- **Tree Shaking**: 移除未使用的代码
- **压缩**: 使用TerserPlugin压缩JavaScript
- **CSS优化**: 使用PostCSS和cssnano压缩CSS

#### 文件压缩
- **Gzip压缩**: 自动生成.gz文件
- **Brotli压缩**: 生成.br文件（如果支持）
- **压缩率**: 通常可达到60-80%的压缩率

### 2. Service Worker离线支持

#### 缓存策略
- **静态资源**: Cache First策略
- **API请求**: Network First策略
- **二维码API**: Cache First策略（24小时缓存）

#### 离线功能
- 应用可在离线状态下使用
- 自动更新检测和通知
- 网络状态实时显示

### 3. 图片优化

#### WebP支持
- 自动检测浏览器WebP支持
- 优先使用WebP格式
- 降级到JPEG/PNG

#### 图片压缩
- 自动压缩图片文件
- 生成多种格式（WebP、JPEG、PNG）
- 保持视觉质量的同时减少文件大小

### 4. 微交互动画

#### 按钮反馈
- 点击时的缩放效果
- 触摸设备的优化反馈
- 涟漪效果动画

#### 加载状态
- 优雅的加载指示器
- 进度条动画
- 状态切换动画

### 5. 移动端优化

#### 触摸优化
- 防止双击缩放
- 触摸反馈优化
- 滚动性能优化

#### 响应式设计
- 移动端专用动画
- 触摸友好的交互
- 性能优先的动画

## 使用方法

### 开发环境

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建优化版本
npm run build

# 压缩构建文件
npm run compress
```

### 生产部署

```bash
# 完整构建流程
npm run build

# 部署到Netlify
npm run deploy
```

## 性能监控

### 内置监控
- 页面加载性能分析
- 网络请求监控
- 缓存命中率统计

### 性能指标
- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms

## 优化配置

### Webpack配置
```javascript
// webpack.config.js
module.exports = {
  optimization: {
    minimize: true,
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  }
}
```

### Service Worker配置
```javascript
// sw.js
const STATIC_CACHE = 'static-v2.1.0';
const DYNAMIC_CACHE = 'dynamic-v2.1.0';

// 缓存策略
runtimeCaching: [
  {
    urlPattern: /^https:\/\/api\.qrserver\.com/,
    handler: 'CacheFirst',
    options: {
      cacheName: 'qr-cache',
      expiration: {
        maxEntries: 50,
        maxAgeSeconds: 24 * 60 * 60
      }
    }
  }
]
```

## 最佳实践

### 1. 图片优化
- 使用WebP格式
- 设置合适的压缩质量
- 实现懒加载

### 2. 代码优化
- 避免不必要的DOM操作
- 使用防抖和节流
- 优化事件监听器

### 3. 缓存策略
- 合理设置缓存时间
- 实现缓存更新机制
- 监控缓存命中率

### 4. 用户体验
- 提供加载状态反馈
- 实现优雅的错误处理
- 优化动画性能

## 故障排除

### 常见问题

1. **Service Worker不工作**
   - 检查HTTPS环境
   - 清除浏览器缓存
   - 检查控制台错误

2. **图片加载失败**
   - 检查WebP支持
   - 验证图片路径
   - 检查网络连接

3. **动画卡顿**
   - 使用transform代替position
   - 启用硬件加速
   - 优化动画帧率

### 调试工具

```javascript
// 性能监控
performanceOptimizer.setupPerformanceMonitoring();

// 网络状态检查
console.log('在线状态:', navigator.onLine);

// 缓存状态
caches.keys().then(keys => console.log('缓存列表:', keys));
```

## 更新日志

### v2.1.0
- 添加Service Worker离线支持
- 实现图片WebP优化
- 添加微交互动画
- 优化移动端体验
- 实现资源压缩

### v2.0.0
- 基础性能优化
- 代码分割
- CSS压缩
- 基础缓存策略

## 贡献指南

1. 遵循性能优先原则
2. 测试所有优化功能
3. 监控性能指标
4. 更新相关文档

## 许可证

MIT License - 详见LICENSE文件 