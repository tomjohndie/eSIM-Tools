# Netlify部署配置

## 概述

本项目已配置为在Netlify上进行高效部署，通过排除非必要文件来减少部署大小和提高部署速度。

## 配置文件

### 1. `.netlifyignore`
排除以下非必要文件：
- 开发工具和配置文件 (`node_modules/`, `webpack.config.js`, `.babelrc` 等)
- 测试文件 (`tests/`, `*.test.js`)
- 文档文件 (`docs/`, `*.md`)
- 环境配置 (`.env*`, `env.example`)
- IDE和编辑器文件 (`.vscode/`, `.idea/`)
- 系统文件 (`.DS_Store`, `Thumbs.db`)
- 临时文件 (`*.log`, `*.tmp`, `*.cache`)

### 2. `netlify.toml`
主要配置：
- **发布目录**: `.` (当前目录)
- **构建处理**: 启用HTML、CSS、JS、图片优化
- **缓存控制**: 静态资源长期缓存，HTML文件不缓存
- **安全头部**: XSS保护、内容类型检查等
- **内容安全策略**: 限制资源加载来源

## 部署流程

### 1. 自动部署
```bash
# 推送到GitHub后，Netlify会自动部署
git push origin main
```

### 2. 手动部署
```bash
# 安装依赖
npm install

# 分析部署文件
npm run deploy-analyze

# 部署到Netlify
npm run deploy
```

### 3. 本地测试
```bash
# 启动Netlify本地开发服务器
npm run netlify-dev
```

## 部署优化

### 文件排除策略
- **保留文件**: `index.html`, `src/`, `sw.js`, `README.md`
- **排除文件**: `node_modules/`, `scripts/`, `tests/`, `docs/`
- **构建产物**: 如果不需要，排除 `dist/`, `build/`

### 性能优化
1. **资源压缩**: CSS、JS、图片自动压缩
2. **缓存策略**: 静态资源长期缓存
3. **CDN加速**: 全球CDN分发
4. **HTTP/2**: 自动启用HTTP/2协议

### 安全配置
1. **内容安全策略**: 限制资源加载
2. **安全头部**: XSS保护、点击劫持防护
3. **HTTPS**: 强制HTTPS访问
4. **CORS**: 配置跨域访问策略

## 部署分析

运行部署分析脚本查看文件统计：
```bash
npm run deploy-analyze
```

输出示例：
```
📊 分析部署文件...
✅ 保留: index.html (2.1 KB)
✅ 保留: src/giffgaff/giffgaff_complete_esim.html (45.2 KB)
❌ 排除: node_modules/axios/package.json (1.2 KB)
❌ 排除: scripts/deploy-prepare.js (3.4 KB)

📈 部署统计:
总文件数: 1,234
总大小: 156.7 MB
保留文件数: 45
保留大小: 2.3 MB
排除文件数: 1,189
排除大小: 154.4 MB
压缩率: 98.53%
```

## 部署清单

部署时会生成 `deployment-manifest.json` 文件，包含：
- 部署时间戳
- 所有部署文件的列表
- 文件大小统计
- 部署统计信息

## 故障排除

### 常见问题

1. **部署失败**
   - 检查 `.netlifyignore` 配置
   - 确保必要文件未被排除
   - 查看Netlify构建日志

2. **文件缺失**
   - 检查 `netlify.toml` 中的发布目录配置
   - 确认文件路径正确

3. **性能问题**
   - 运行 `npm run deploy-analyze` 检查文件大小
   - 优化图片和资源文件
   - 检查缓存配置

### 调试命令
```bash
# 检查部署文件
npm run deploy-prepare

# 本地测试
npm run netlify-dev

# 安全检查
npm run security-check
```

## 最佳实践

1. **定期清理**: 删除不必要的文件和依赖
2. **监控部署**: 关注部署时间和文件大小
3. **版本控制**: 使用Git标签管理版本
4. **备份配置**: 备份重要的配置文件
5. **测试部署**: 在部署前进行本地测试

## 相关链接

- [Netlify文档](https://docs.netlify.com/)
- [部署配置参考](https://docs.netlify.com/configure-builds/file-based-configuration/)
- [性能优化指南](https://docs.netlify.com/optimize/overview/) 