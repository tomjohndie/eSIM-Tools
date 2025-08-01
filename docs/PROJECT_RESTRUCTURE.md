# 项目架构重组说明

## 🔄 重组概述

为了更好地管理项目文件和提高可维护性，我们对整个项目进行了架构重组。

## 📁 新的目录结构

```
esim-tools/
├── index.html                    # 主页面 - 工具选择
├── src/                          # 源代码目录
│   ├── giffgaff/                 # Giffgaff eSIM工具
│   │   └── giffgaff_complete_esim.html
│   └── simyo/                    # Simyo eSIM工具
│       ├── simyo_complete_esim.html  # 完整版（需要代理）
│       ├── simyo_static.html         # 静态版（演示用）
│       └── simyo_proxy_server.js     # CORS代理服务器
├── docs/                         # 文档目录
│   ├── fixes/                    # 问题修复说明
│   │   ├── GIFFGAFF_OAUTH_FIX.md
│   │   └── GIFFGAFF_CSP_CALLBACK_FIX.md
│   ├── guides/                   # 使用指南
│   │   ├── CORS_SOLUTION.md
│   │   └── DEPLOYMENT_GUIDE.md
│   └── reference/                # 参考文档
│       ├── README_giffgaff_esim.md
│       └── README_simyo_esim.md
├── tests/                        # 测试文件
│   ├── test_giffgaff_esim.html
│   └── test_simyo_esim.html
├── scripts/                      # 脚本文件
│   ├── start_simyo_server.sh
│   ├── start_simyo_server.bat
│   └── deploy.sh
├── postman/                      # Postman脚本和参考文件
│   ├── Giffgaff-swap-esim.json
│   ├── Simyo-swap-esim.json
│   ├── giffgaff.html
│   └── simyo.html
├── netlify.toml                  # Netlify部署配置
├── package.json                  # Node.js依赖配置
└── README.md                     # 项目说明
```

## 🔧 主要变更

### 1. **源代码组织** (`src/`)
- **Giffgaff工具**: 移动到 `src/giffgaff/`
- **Simyo工具**: 移动到 `src/simyo/`，包括完整版、静态版和代理服务器

### 2. **文档分类** (`docs/`)
- **修复说明** (`docs/fixes/`): OAuth修复、CSP修复等技术问题解决方案
- **使用指南** (`docs/guides/`): CORS解决方案、部署指南等操作指南
- **参考文档** (`docs/reference/`): 各工具的详细说明文档

### 3. **测试文件** (`tests/`)
- 集中管理所有测试文件
- 便于自动化测试集成

### 4. **脚本管理** (`scripts/`)
- 部署脚本、启动脚本等工具脚本
- 便于CI/CD集成

### 5. **参考资料** (`postman/`)
- Postman集合文件
- 原始参考HTML文件
- 便于API开发和调试

## 🛠️ 配置更新

### Netlify配置 (`netlify.toml`)
更新了路径重定向规则：
```toml
[[redirects]]
  from = "/giffgaff"
  to = "/src/giffgaff/giffgaff_complete_esim.html"
  status = 200

[[redirects]]
  from = "/simyo"
  to = "/src/simyo/simyo_complete_esim.html"
  status = 200

[[redirects]]
  from = "/simyo-static"
  to = "/src/simyo/simyo_static.html"
  status = 200
```

### CSP配置修复
同时修复了Netlify配置中的CSP问题，添加了缺失的Giffgaff域名：
```toml
Content-Security-Policy = "connect-src 'self' ... https://id.giffgaff.com https://publicapi.giffgaff.com"
```

### 主README更新
- 添加了完整的项目结构说明
- 更新了所有文档路径引用
- 更新了测试文件路径

## 🎯 重组目标

### 1. **可维护性提升**
- 清晰的文件分类
- 便于查找和修改
- 减少文件混乱

### 2. **开发效率**
- 逻辑分组的文件结构
- 便于新功能开发
- 简化部署流程

### 3. **文档管理**
- 分类明确的文档结构
- 便于维护和更新
- 提高文档可读性

### 4. **协作友好**
- 标准化的项目结构
- 便于团队协作
- 符合开源项目规范

## 🔄 迁移影响

### 对用户的影响
- **无影响**: 所有URL路径保持不变
- **向后兼容**: 原有链接继续有效
- **功能完整**: 所有功能正常工作

### 对开发的影响
- **路径更新**: 需要使用新的文件路径
- **文档引用**: 更新内部文档链接
- **测试路径**: 更新测试文件引用

## ✅ 验证清单

- [x] 所有文件成功移动到新位置
- [x] Netlify重定向配置更新
- [x] CSP配置修复
- [x] README文档更新
- [x] 文档路径引用更新
- [x] 测试文件路径更新
- [x] 项目结构文档创建

## 🚀 后续计划

1. **CI/CD优化**: 根据新结构优化自动化流程
2. **文档完善**: 继续完善各类文档
3. **测试增强**: 基于新结构改进测试覆盖
4. **性能优化**: 利用清晰结构进行性能优化

---

**注意**: 此次重组不会影响用户体验，所有功能和URL保持不变。开发者需要根据新的文件路径进行后续开发。