# Giffgaff OAuth认证问题修复说明

## 🔍 问题描述

用户在使用Giffgaff eSIM工具时遇到OAuth认证问题：
- 在邮件验证码验证后，GraphQL API调用返回 `unauthorized` 错误
- 错误信息：`"Full authentication is required to access this resource"`

## 🎯 根本原因分析

通过分析Postman脚本 `Giffgaff-swap-esim.json`，发现问题出现在GraphQL API调用的认证机制上：

### 原始问题
1. **缺少MFA签名头**：GraphQL请求只包含了OAuth Bearer token，但缺少了MFA验证签名
2. **认证流程不完整**：Giffgaff的API需要两层认证：
   - OAuth 2.0 Bearer Token（用户身份）
   - MFA Signature（多因子认证签名）

### Postman脚本中的正确实现
```javascript
// 邮件验证后获取signature
pm.collectionVariables.set("email_signature", pm.response.json().signature);

// GraphQL请求需要同时包含OAuth token和MFA signature
headers: {
  'Authorization': 'Bearer {oauth_token}',
  'X-MFA-Signature': '{email_signature}'  // 关键：MFA签名头
}
```

## 🛠️ 修复方案

### 1. 添加MFA签名头到所有GraphQL请求

**修复前：**
```javascript
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${appState.accessToken}`
}
```

**修复后：**
```javascript
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${appState.accessToken}`,
  'X-MFA-Signature': appState.emailSignature  // 新增MFA签名
}
```

### 2. 增强错误处理和调试

**修复前：**
```javascript
if (!response.ok) {
  throw new Error(`请求失败: ${response.status}`);
}
```

**修复后：**
```javascript
if (!response.ok) {
  const errorText = await response.text();
  console.error('GraphQL请求失败:', response.status, errorText);
  throw new Error(`请求失败: ${response.status} - ${errorText}`);
}
```

### 3. 添加认证状态检查

```javascript
// 检查是否有必要的认证信息
if (!appState.accessToken) {
  throw new Error("缺少访问令牌，请重新进行OAuth认证");
}

if (!appState.emailSignature) {
  throw new Error("缺少邮件验证签名，请完成邮件验证");
}
```

## 📋 修复的具体文件和位置

### `giffgaff_complete_esim.html`

1. **获取会员信息请求** (行 ~970)
2. **预订eSIM请求** (行 ~1045)  
3. **交换SIM卡请求** (行 ~1115)
4. **获取eSIM Token请求** (行 ~1180)

### 修复内容
- ✅ 所有GraphQL请求添加 `X-MFA-Signature` 头
- ✅ 增强错误处理和日志输出
- ✅ 添加认证状态验证
- ✅ 添加调试信息输出

## 🔄 认证流程图

```
1. OAuth登录
   ↓
2. 获取Access Token
   ↓
3. 发送邮件验证码
   ↓
4. 验证邮件验证码 → 获取MFA Signature
   ↓
5. GraphQL API调用
   Headers: {
     'Authorization': 'Bearer {access_token}',
     'X-MFA-Signature': '{mfa_signature}'  ← 关键修复
   }
```

## 🧪 测试验证

### 测试步骤
1. 完成OAuth登录获取access token
2. 发送邮件验证码
3. 输入正确的邮件验证码
4. 检查浏览器控制台确认获得MFA签名
5. 尝试获取会员信息

### 预期结果
- ✅ 不再出现 `unauthorized` 错误
- ✅ GraphQL请求成功返回数据
- ✅ 控制台显示详细的请求/响应日志

## 🔧 调试技巧

### 浏览器控制台检查
```javascript
// 检查认证状态
console.log('Access Token:', appState.accessToken);
console.log('MFA Signature:', appState.emailSignature);

// 检查GraphQL请求头
console.log('Request Headers:', {
  'Authorization': `Bearer ${appState.accessToken}`,
  'X-MFA-Signature': appState.emailSignature
});
```

### 常见问题排查
1. **Access Token为空**：重新进行OAuth认证
2. **MFA Signature为空**：重新进行邮件验证
3. **GraphQL错误**：检查控制台中的详细错误信息

## 📝 技术要点

### Giffgaff API认证机制
- **OAuth 2.0 PKCE**：用于用户身份认证
- **MFA签名**：用于敏感操作的二次验证
- **双重认证**：两者缺一不可

### 请求头要求
```http
Authorization: Bearer {oauth_access_token}
X-MFA-Signature: {email_verification_signature}
Content-Type: application/json
```

### GraphQL端点
- **URL**: `https://publicapi.giffgaff.com/gateway/graphql`
- **方法**: POST
- **认证**: OAuth + MFA双重认证

## ✅ 修复确认

经过修复后，Giffgaff eSIM工具应该能够：
- ✅ 成功完成OAuth认证流程
- ✅ 正确处理邮件验证码验证
- ✅ 成功调用所有GraphQL API
- ✅ 完成完整的eSIM申请和交换流程

---

**注意**: 此修复基于对Postman脚本的深入分析，确保与官方API的认证机制完全一致。