# Cookie登录功能部署指南

## 🍪 功能概述

Cookie登录功能允许用户使用已有的Giffgaff网站登录Cookie快速访问eSIM工具，无需重复OAuth认证流程。

## 📋 部署要求

### 后端文件
- **`verify_cookie.php`** - Cookie验证服务
- **PHP环境** - PHP 7.0+，支持cURL扩展
- **Web服务器** - Apache/Nginx等

### 前端配置
- 前端页面会自动调用 `verify_cookie.php`
- 如果后端不可用，会提示用户使用OAuth登录

## 🚀 部署步骤

### 1. 上传PHP文件
将 `verify_cookie.php` 文件上传到您的Web服务器根目录或与HTML文件相同的目录。

```bash
# 文件结构示例
your-domain.com/
├── index.html                    # 主页
├── giffgaff_complete_esim.html  # Giffgaff工具
├── verify_cookie.php            # Cookie验证服务 ← 上传这个文件
└── other-files...
```

### 2. 配置服务器权限
确保PHP文件具有执行权限：

```bash
chmod 644 verify_cookie.php
```

### 3. 测试后端服务
访问 `https://your-domain.com/verify_cookie.php` 应该返回错误信息（因为没有POST数据），这表明服务正常运行。

### 4. 配置CORS（如果需要）
如果前端和后端在不同域名，可能需要配置CORS。`verify_cookie.php` 已包含基本的CORS头设置。

## 🔧 功能工作流程

### Cookie登录流程
```
1. 用户选择"Cookie登录"
   ↓
2. 用户输入从giffgaff.com获取的Cookie
   ↓
3. 前端调用 verify_cookie.php
   ↓
4. PHP验证Cookie有效性
   ↓
5. 返回Access Token或错误信息
   ↓
6. 前端继续eSIM操作流程
```

### Cookie验证逻辑
```php
// verify_cookie.php 主要功能
1. 解析Cookie字符串
2. 提取认证相关的Cookie
3. 调用Giffgaff API验证Cookie
4. 返回Access Token或错误信息
```

## 📝 使用说明

### 获取Cookie的步骤
1. **访问 giffgaff.com** 并完成登录
2. **打开开发者工具**（F12）
3. **切换到"应用程序"标签页**（Chrome）或"存储"标签页（Firefox）
4. **选择Cookie** → `https://www.giffgaff.com`
5. **复制所有Cookie** 或重要的认证Cookie
6. **粘贴到工具中** 并点击验证

### Cookie格式示例
```
session_token=abc123; user_id=456789; auth_token=xyz789; _ga=GA1.2.123456789; ...
```

## ⚠️ 重要说明

### 安全考虑
1. **Cookie包含敏感信息** - 请勿在不安全的网络环境下使用
2. **定期更新Cookie** - Cookie会过期，需要重新获取
3. **服务器日志** - 后端会记录验证请求，但不记录完整Cookie内容

### 限制和注意事项
1. **需要后端支持** - 纯静态部署无法使用Cookie登录
2. **Cookie有效期** - Giffgaff Cookie通常有时间限制
3. **API变化** - Giffgaff API变化可能影响Cookie验证逻辑

## 🛠️ 故障排除

### 常见问题

#### 1. "后端服务不可用"错误
**原因**: `verify_cookie.php` 文件未正确部署
**解决方案**:
- 检查文件是否上传到正确位置
- 确认Web服务器支持PHP
- 检查文件权限设置

#### 2. "Cookie验证失败"错误
**原因**: Cookie无效或已过期
**解决方案**:
- 重新从giffgaff.com获取Cookie
- 确认Cookie格式正确
- 检查Cookie是否包含必要的认证信息

#### 3. CORS错误
**原因**: 跨域请求被阻止
**解决方案**:
- 确保前端和后端在同一域名
- 或配置正确的CORS头（已在PHP文件中包含）

#### 4. 403/401错误
**原因**: Cookie无效或Giffgaff API拒绝请求
**解决方案**:
- 检查Cookie是否来自正确的域名
- 确认Cookie未过期
- 尝试重新登录giffgaff.com

## 🔄 替代方案

### 如果Cookie登录不可用
推荐使用 **OAuth 2.0登录方式**：

#### 优势
- ✅ 无需后端支持
- ✅ 更安全的认证方式
- ✅ 标准化流程
- ✅ 功能完整

#### 使用方法
1. 选择"OAuth 2.0登录"
2. 按照指引完成认证
3. 享受完整的eSIM管理功能

## 📊 功能对比

| 特性 | Cookie登录 | OAuth 2.0登录 |
|------|------------|---------------|
| 后端需求 | ✅ 需要 | ❌ 不需要 |
| 安全性 | 🟡 中等 | 🟢 高 |
| 设置复杂度 | 🟡 中等 | 🟢 简单 |
| 用户体验 | 🟢 快速 | 🟡 标准 |
| 维护成本 | 🟡 中等 | 🟢 低 |

## 💡 建议

### 推荐部署策略
1. **优先OAuth** - 主推OAuth 2.0登录方式
2. **Cookie作为补充** - 为高级用户提供Cookie选项
3. **清晰提示** - 明确告知用户两种方式的区别

### 最佳实践
1. **定期测试** - 确保Cookie验证逻辑正常工作
2. **监控日志** - 关注验证失败的情况
3. **用户教育** - 提供清晰的使用说明
4. **安全更新** - 定期更新验证逻辑以适应API变化

---

**注意**: Cookie登录功能为可选功能。如果您不需要此功能，可以专注于OAuth 2.0登录方式，它提供完整的功能且无需后端支持。