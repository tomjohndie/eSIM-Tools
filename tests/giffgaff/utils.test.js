/**
 * Giffgaff 工具函数模块测试
 */

import Utils from '../../src/js/modules/giffgaff/utils';

describe('Giffgaff Utils', () => {
  describe('Cookie 操作', () => {
    beforeEach(() => {
      // 清除所有 cookies
      document.cookie.split(';').forEach(cookie => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      });
    });

    it('setCookie 应该设置 cookie', () => {
      Utils.setCookie('test', 'value', 1);
      expect(document.cookie).toContain('test=value');
    });

    it('getCookie 应该获取 cookie 值', () => {
      document.cookie = 'test=value';
      expect(Utils.getCookie('test')).toBe('value');
    });

    it('getCookie 应该返回 null 如果 cookie 不存在', () => {
      expect(Utils.getCookie('nonexistent')).toBeNull();
    });

    it('eraseCookie 应该删除 cookie', () => {
      document.cookie = 'test=value';
      Utils.eraseCookie('test');
      expect(Utils.getCookie('test')).toBeNull();
    });
  });

  describe('isServiceTimeAvailable()', () => {
    it('应该在服务时间内返回 true', () => {
      // 模拟下午 2 点
      const mockDate = new Date('2024-01-01T14:00:00');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
      
      expect(Utils.isServiceTimeAvailable()).toBe(true);
      
      global.Date.mockRestore();
    });

    it('应该在服务维护时间返回 false', () => {
      // 模拟早上 8 点（在 04:30-12:30 维护时段）
      const mockDate = new Date('2024-01-01T08:00:00');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
      
      expect(Utils.isServiceTimeAvailable()).toBe(false);
      
      global.Date.mockRestore();
    });
  });

  describe('copyToClipboard()', () => {
    it('应该使用 clipboard API 复制文本', async () => {
      const text = 'test text';
      await Utils.copyToClipboard(text);
      
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(text);
    });

    it('应该在 clipboard API 失败时使用降级方案', async () => {
      // 模拟 clipboard API 失败
      navigator.clipboard.writeText.mockRejectedValueOnce(new Error('Failed'));
      
      // 监听 execCommand
      const execCommandSpy = jest.spyOn(document, 'execCommand').mockReturnValue(true);
      
      const result = await Utils.copyToClipboard('test');
      
      expect(result).toBe(true);
      expect(execCommandSpy).toHaveBeenCalledWith('copy');
      
      execCommandSpy.mockRestore();
    });
  });

  describe('generateQRCodeURL()', () => {
    it('应该生成正确的二维码 URL', () => {
      const data = 'test data';
      const url = Utils.generateQRCodeURL(data);
      
      expect(url).toContain('https://api.qrserver.com/v1/create-qr-code/');
      expect(url).toContain('size=300x300');
      expect(url).toContain('data=test%20data');
    });

    it('应该支持自定义尺寸', () => {
      const data = 'test';
      const size = 500;
      const url = Utils.generateQRCodeURL(data, size);
      
      expect(url).toContain('size=500x500');
    });
  });

  describe('formatTime()', () => {
    it('应该格式化时间为 HH:MM', () => {
      const date = new Date('2024-01-01T09:05:00');
      const formatted = Utils.formatTime(date);
      
      expect(formatted).toBe('09:05');
    });

    it('应该格式化当前时间', () => {
      const mockDate = new Date('2024-01-01T15:30:00');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
      
      const formatted = Utils.formatTime();
      
      expect(formatted).toBe('15:30');
      
      global.Date.mockRestore();
    });
  });

  describe('debounce()', () => {
    jest.useFakeTimers();

    it('应该延迟函数执行', () => {
      const mockFn = jest.fn();
      const debouncedFn = Utils.debounce(mockFn, 100);
      
      debouncedFn('test');
      expect(mockFn).not.toHaveBeenCalled();
      
      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledWith('test');
    });

    it('应该取消之前的调用', () => {
      const mockFn = jest.fn();
      const debouncedFn = Utils.debounce(mockFn, 100);
      
      debouncedFn('first');
      jest.advanceTimersByTime(50);
      debouncedFn('second');
      jest.advanceTimersByTime(100);
      
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('second');
    });
  });

  describe('throttle()', () => {
    jest.useFakeTimers();

    it('应该限制函数执行频率', () => {
      const mockFn = jest.fn();
      const throttledFn = Utils.throttle(mockFn, 100);
      
      throttledFn('first');
      throttledFn('second');
      throttledFn('third');
      
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('first');
      
      jest.advanceTimersByTime(100);
      throttledFn('fourth');
      
      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(mockFn).toHaveBeenCalledWith('fourth');
    });
  });

  describe('showStatus()', () => {
    it('应该显示成功状态', () => {
      const element = document.createElement('div');
      Utils.showStatus(element, 'Success message', 'success');
      
      expect(element.textContent).toBe('Success message');
      expect(element.className).toBe('text-success');
      expect(element.style.display).toBe('block');
    });

    it('应该显示错误状态', () => {
      const element = document.createElement('div');
      Utils.showStatus(element, 'Error message', 'error');
      
      expect(element.textContent).toBe('Error message');
      expect(element.className).toBe('text-danger');
    });

    it('应该处理 null 元素', () => {
      expect(() => {
        Utils.showStatus(null, 'Message', 'success');
      }).not.toThrow();
    });
  });
});