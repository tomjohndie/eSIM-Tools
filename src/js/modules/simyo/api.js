/**
 * Simyo API 交互模块
 */

class SimyoAPIManager {
  constructor() {
    this.baseUrl = 'https://appapi.simyo.nl';
    this.endpoints = {
      login: `${this.baseUrl}/api/login`,
      smsCode: `${this.baseUrl}/api/sms-code`,
      verifyCode: `${this.baseUrl}/api/verify-code`,
      deviceChange: `${this.baseUrl}/api/device-change`,
      activateESIM: `${this.baseUrl}/api/activate-esim`,
      confirmInstall: `${this.baseUrl}/api/confirm-install`
    };
  }

  /**
   * 登录
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @returns {Promise<Object>} Login Response
   */
  async login(username, password) {
    const response = await fetch(this.endpoints.login, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username,
        password: password
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Login failed: ${response.status} - ${errorText}`);
    }

    return await response.json();
  }

  /**
   * 发送短信验证码
   * @param {string} token - 访问令牌
   * @returns {Promise<Object>} SMS Code Response
   */
  async sendSMSCode(token) {
    const response = await fetch(this.endpoints.smsCode, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Send SMS failed: ${response.status} - ${errorText}`);
    }

    return await response.json();
  }

  /**
   * 验证短信验证码
   * @param {string} token - 访问令牌
   * @param {string} code - 验证码
   * @returns {Promise<Object>} Verification Response
   */
  async verifyCode(token, code) {
    const response = await fetch(this.endpoints.verifyCode, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code: code
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Verification failed: ${response.status} - ${errorText}`);
    }

    return await response.json();
  }

  /**
   * 请求设备更换
   * @param {string} token - 访问令牌
   * @returns {Promise<Object>} Device Change Response
   */
  async requestDeviceChange(token) {
    const response = await fetch(this.endpoints.deviceChange, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Device change failed: ${response.status} - ${errorText}`);
    }

    return await response.json();
  }

  /**
   * 激活 eSIM
   * @param {string} token - 访问令牌
   * @param {string} activationCode - 激活码
   * @returns {Promise<Object>} Activation Response
   */
  async activateESIM(token, activationCode) {
    const response = await fetch(this.endpoints.activateESIM, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        activationCode: activationCode
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Activation failed: ${response.status} - ${errorText}`);
    }

    return await response.json();
  }

  /**
   * 确认安装
   * @param {string} token - 访问令牌
   * @returns {Promise<Object>} Confirmation Response
   */
  async confirmInstallation(token) {
    const response = await fetch(this.endpoints.confirmInstall, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Confirmation failed: ${response.status} - ${errorText}`);
    }

    return await response.json();
  }
}

export default new SimyoAPIManager();