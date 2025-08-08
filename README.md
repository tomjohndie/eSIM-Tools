<div align="center">
<h1 align="center">eSIM工具集 🚀<br><img align='middle' src='https://anay.cosr.eu.org/?text=@Silentely/bili-calendar'></img></h1>
<img align='middle' src='https://anay.cosr.eu.org/?repo=Silentely/bili-calendar'></img>
<br>
<img src="https://img.shields.io/github/forks/Silentely/bili-calendar?color=orange" alt="GitHub forks">
<img src="https://img.shields.io/github/issues/Silentely/bili-calendar?color=green" alt="GitHub issues">
<br>
<img src="https://img.shields.io/github/license/Silentely/bili-calendar?color=ff69b4" alt="License">
<img src="https://img.shields.io/github/languages/code-size/Silentely/bili-calendar?color=blueviolet" alt="Code size">
<img src="https://img.shields.io/github/last-commit/Silentely/bili-calendar/main?label=%E4%B8%8A%E6%AC%A1%E6%9B%B4%E6%96%B0&color=success" alt="Last commit">
<img src="https://api.netlify.com/api/v1/badges/8fc159e2-3996-4e1b-bf9d-1945a3474682/deploy-status" alt="Netlify Status">
<br>
</div>

专为Giffgaff和Simyo用户设计的eSIM管理工具集，支持完整的eSIM申请、设备更换和二维码生成流程。

## ✨ 功能特性

### 🔧 Giffgaff eSIM工具
- **OAuth 2.0 PKCE认证** - 安全的身份验证流程
- **智能Cookie登录** - 通过Netlify Functions处理，支持所有部署环境
- **MFA多因子验证** - 邮件验证码支持，无服务器架构处理
- **GraphQL API集成** - 完整的API调用链
- **自动二维码生成** - LPA格式激活码
- **设备更换支持** - 完整的SIM卡更换流程

### 📱 Simyo eSIM工具
- **简单登录验证** - 手机号+密码认证
- **设备更换流程** - 支持验证码处理
- **短信验证码** - 自动发送和验证
- **一键二维码生成** - 即时生成可扫描二维码
- **安装确认功能** - 确保eSIM正确激活

## 🌐 在线使用

### 🚀 公共服务（推荐）
- **完整功能版本**: [https://esim.cosr.eu.org](https://esim.cosr.eu.org)
  - 无CORS限制，完整API功能
  - 支持所有eSIM操作
  - 定期更新维护
  - 性能优化，支持离线使用

### 🎁 Simyo邀请奖励
新用户开卡可享受**额外5欧元话费赠送**！[立即开卡](https://vriendendeal.simyo.nl/prepaid/AZzwPzb)

### 🎁 Giffgaff邀请奖励
新用户开卡可享受**额外5英镑话费赠送**！[立即开卡](https://www.giffgaff.com/orders/affiliate/mowal44_1653194386268)

## 🚀 本地部署

### 快速开始

1. **克隆仓库**
   ```bash
   git clone https://github.com/Silentely/esim-tools.git
   cd esim-tools
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动代理服务器**
   ```bash
   # Windows
   start_simyo_server.bat
   
   # macOS/Linux
   ./start_simyo_server.sh
   
   # 或手动启动
   npm start
   ```

4. **访问应用**
   ```
   http://localhost:3000
   ```

### 环境要求

#### 生产环境
- **无特殊要求** - 现代化Web应用 + Netlify Functions
- **现代浏览器** - Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **性能优化** - Service Worker离线支持，资源压缩

#### 开发环境
- **Node.js** >= 18.0.0 (仅本地开发需要)
- **npm** >= 8.0.0 (仅本地开发需要)

### 技术架构
- **前端**: 现代化Web应用，性能优化，微交互动画
- **后端**: Netlify Functions（生产）+ Node.js Express（开发）
- **部署**: 完全无服务器架构
- **API代理**: 统一CORS处理，完整日志记录
- **安全**: Helmet.js安全头，CORS配置
- **性能**: Service Worker离线支持，资源压缩，图片优化

## 📦 Netlify部署

### 自动部署
```bash
./deploy.sh
```

### 手动部署
1. Fork此仓库
2. 在[Netlify](https://app.netlify.com)中连接GitHub仓库
3. 构建设置：
   - Build command: `echo 'No build needed'`
   - Publish directory: `.`
4. 部署完成！

详细部署指南请参考 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

## 🔧 技术架构

### 前端技术栈
- **HTML5/CSS3** - 响应式设计，微交互动画
- **JavaScript ES6+** - 现代JavaScript特性
- **Bootstrap 5** - UI框架
- **Font Awesome** - 图标库
- **Service Worker** - 离线支持
- **WebP图片优化** - 自动格式检测和压缩

### 🚀 性能优化特性
- **资源压缩**: Webpack + TerserPlugin，压缩率可达65%+
- **Service Worker**: 离线缓存，网络状态监控
- **微交互动画**: 按钮反馈，加载状态，触摸优化
- **图片优化**: WebP格式支持，懒加载，自动压缩
- **代码分割**: 自动分离第三方库，减少初始加载时间
- **缓存策略**: 智能缓存API请求和静态资源

详细性能优化说明请参考 [PERFORMANCE.md](./PERFORMANCE.md)

### 后端架构
- **Netlify Functions** - 无服务器函数处理API代理
- **Node.js** - 本地开发环境
- **CORS处理** - 完整的跨域请求解决方案
- **会话持久化** - LocalStorage + 2小时自动过期

### 部署平台
- **Netlify** - 现代化Web应用托管 + 无服务器函数
- **GitHub Actions** - 自动化部署（可选）
- **CDN加速** - 全球内容分发网络
- **自定义域名** - 支持HTTPS
- **性能优化** - 自动资源压缩和缓存策略

## 📋 使用指南

### Giffgaff eSIM申请流程
1. **OAuth登录** - 使用Giffgaff账户登录
2. **邮件验证** - 输入收到的验证码
3. **获取会员信息** - 验证账户状态
4. **申请eSIM** - 预留SIM卡并手动激活
5. **生成二维码** - 获取LPA激活码

### Simyo设备更换流程
1. **登录账户** - 输入手机号和密码
2. **选择更换类型** - 新申请或设备更换
3. **验证码处理** - 短信或客服验证码
4. **获取eSIM配置** - 生成新的激活码
5. **扫码安装** - 在新设备上安装eSIM

详细使用说明：
- [Giffgaff工具说明](./README_giffgaff_esim.md)
- [Simyo工具说明](./README_simyo_esim.md)
- [性能优化指南](./PERFORMANCE.md)

## ⚠️ 重要说明

### 适用范围
- **Giffgaff**: 英国用户专用
- **Simyo**: 荷兰用户专用（06开头手机号）

### 安全提示
- 所有数据处理均在本地进行
- 不存储用户凭据信息
- 建议在安全网络环境下使用

### 使用方式说明

#### 🌟 推荐方式：在线服务 ([https://esim.cosr.eu.org](https://esim.cosr.eu.org))
- **优势**: 无需部署，即开即用，无CORS限制，性能优化
- **适用**: 普通用户日常使用
- **特点**: 定期维护更新，稳定可靠，完整功能，离线支持

#### 🔧 自建部署：本地/私有服务
- **文件**: `giffgaff_complete_esim.html` + `simyo_complete_esim.html`
- **优势**: 数据私有，可定制修改，离线使用
- **适用**: 企业部署，开发者，隐私要求高的用户
- **要求**: 需要代理服务器解决CORS问题（支持Netlify Functions或本地Node.js）

## 📁 项目结构

```
esim-tools/
├── index.html                    # 主页面 - 工具选择
├── server.js                     # Node.js开发服务器
├── src/                          # 源代码目录
│   ├── giffgaff/                 # Giffgaff eSIM工具
│   │   └── giffgaff_complete_esim.html  # 完整功能版本
│   └── simyo/                    # Simyo eSIM工具
│       ├── simyo_complete_esim.html     # 完整功能版本
│       └── simyo_proxy_server.js        # CORS代理服务器
├── netlify/                      # Netlify无服务器函数
│   └── functions/                # 生产环境API代理
│       ├── giffgaff-graphql.js
│       ├── giffgaff-mfa-challenge.js
│       ├── giffgaff-mfa-validation.js
│       └── verify-cookie.js
├── docs/                         # 文档目录
│   ├── fixes/                    # 问题修复说明
│   │   └── GIFFGAFF_CSP_CALLBACK_FIX.md
│   ├── guides/                   # 使用指南
│   │   └── CORS_SOLUTION.md
│   ├── reference/                # 参考文档
│   │   ├── README_giffgaff_esim.md
│   │   └── README_simyo_esim.md
│   ├── PROJECT_SUMMARY.md        # 项目概览
│   └── COOKIE_LOGIN_SETUP.md     # Cookie登录配置
├── tests/                        # 测试文件
│   ├── test_giffgaff_esim.html   # Giffgaff功能测试
│   └── test_simyo_esim.html      # Simyo功能测试
├── scripts/                      # 部署和启动脚本
│   ├── deploy.sh                 # 自动部署脚本
│   ├── start_simyo_server.sh     # Linux/macOS启动脚本
│   └── start_simyo_server.bat    # Windows启动脚本
├── postman/                      # 原始API脚本（参考）
├── netlify.toml                  # Netlify部署配置
├── package.json                  # 项目依赖配置
├── verify_cookie.php             # PHP Cookie验证（备用）
└── README.md                     # 项目说明文档
```

### CORS解决方案
现代化Web应用环境下通过以下方式解决跨域问题：
1. **推荐**: 使用公共服务 [https://esim.cosr.eu.org](https://esim.cosr.eu.org)
2. **Netlify代理重定向**: 自动代理API请求
3. **本地代理服务器**: 运行Node.js代理
4. **浏览器插件**: 临时解决方案

详细解决方案请参考 [docs/guides/CORS_SOLUTION.md](./docs/guides/CORS_SOLUTION.md)

## 🧪 测试

### 运行测试
```bash
# 在浏览器中打开测试页面
open tests/test_giffgaff_esim.html
open tests/test_simyo_esim.html
```

### 测试覆盖
- **单元测试** - 核心函数测试
- **集成测试** - API调用测试
- **端到端测试** - 完整流程测试
- **性能测试** - 响应时间和内存使用

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

### 开发流程
1. Fork仓库
2. 创建功能分支
3. 提交更改
4. 创建Pull Request

### 代码规范
- 使用ESLint进行代码检查
- 遵循现有的代码风格
- 添加必要的注释和文档

## 🙏 致谢

- 感谢Giffgaff和Simyo提供的API服务
- 感谢开源社区的技术支持
- 感谢所有贡献者和用户的反馈

## 📞 支持

如果您遇到问题或有建议，请：
- 提交 [GitHub Issue](https://github.com/Silentely/esim-tools/issues)
- 查看 [常见问题解答](./docs/guides/DEPLOYMENT_GUIDE.md#故障排除)
- 参考详细文档和使用指南

## 📋 TODO列表

### 🔄 Giffgaff eSIM激活流程自动化
- [ ] **网络抓包分析**: 在 `https://www.giffgaff.com/activate` 页面进行完整的网络请求抓包
  - [ ] 输入第四步获得的activationCode
  - [ ] 点击"Activate your SIM"按钮
  - [ ] 记录跳转后的页面URL和参数
  - [ ] 点击"Yes, I want to replace my SIM"按钮
  - [ ] 分析所有相关的API调用和请求参数
  - [ ] 记录认证token、session信息等关键参数
  - [ ] 整理完整的请求流程和参数映射
- [ ] **自动化脚本开发**: 基于抓包结果开发自动化激活脚本
  - [X] 实现自动输入activationCode
  - [X] 实现自动点击激活按钮(完成待实卡测试)
  - [ ] 实现自动确认SIM替换
  - [ ] 集成到现有的eSIM申请流程中
- [ ] **测试验证**: 验证自动化流程的稳定性和准确性
  - [ ] 多环境测试（不同浏览器、网络环境）
  - [ ] 错误处理和异常情况处理
  - [ ] 用户友好的进度提示和状态反馈

### 🛠️ 技术改进
- [X] **悬浮框优化**: 只有被截断才显示悬浮框，空值时不显示鼠标问号
- [X] **性能优化**: 添加Service Worker离线支持，资源压缩，微交互动画
- [ ] **错误处理优化**: 改进第五步"申請交換eSIM Swap SIM"的400错误处理
- [ ] **用户体验优化**: 优化前端显示activationCode、ssn等信息的方式
- [ ] **流程引导优化**: 改进用户手动激活的引导流程

### 📚 文档完善
- [X] **性能优化文档**: 添加PERFORMANCE.md详细说明
- [ ] **API文档**: 完善Giffgaff激活流程的API调用文档
- [ ] **用户指南**: 更新用户使用指南，包含新的自动化流程
- [ ] **开发文档**: 添加自动化脚本的开发说明

## 免责声明

本工具仅供个人使用，请遵守相关服务条款。使用本工具所产生的任何问题，作者不承担责任。

## 许可证

- 本项目的所有代码除另有说明外,均按照 [MIT License](LICENSE) 发布。
- 本项目的README.MD，wiki等资源基于 [CC BY-NC-SA 4.0][CC-NC-SA-4.0] 这意味着你可以拷贝、并再发行本项目的内容，<br/>
  但是你将必须同样**提供原作者信息以及协议声明**。同时你也**不能将本项目用于商业用途**，按照我们狭义的理解<br/>
  (增加附属条款)，凡是**任何盈利的活动皆属于商业用途**。
- 请在遵守当地相关法律法规的前提下使用本项目。

<p align="center">
  <img src="https://github.com/docker/dockercraft/raw/master/docs/img/contribute.png?raw=true" alt="贡献图示">
</p>

[github-hosts]: https://raw.githubusercontent.com/racaljk/hosts/master/hosts "hosts on Github"
[CC-NC-SA-4.0]: https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh

<div align="center">
  <sub>Made with ❤️ by <a href="https://github.com/Silentely">Silentely</a></sub>
</div>
