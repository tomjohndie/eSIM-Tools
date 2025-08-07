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
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('应该在服务时间内返回 true（服务可用）', () => {
      // 测试服务可用的时间点
      const availableTimes = [
        new Date('2024-01-01T00:00:00'), // 午夜
        new Date('2024-01-01T03:00:00'), // 凌晨3点
        new Date('2024-01-01T04:00:00'), // 凌晨4点
        new Date('2024-01-01T04:29:00'), // 4:29（服务停止前1分钟）
        new Date('2024-01-01T12:31:00'), // 12:31（服务恢复后1分钟）
        new Date('2024-01-01T13:00:00'), // 下午1点
        new Date('2024-01-01T14:00:00'), // 下午2点
        new Date('2024-01-01T18:00:00'), // 晚上6点
        new Date('2024-01-01T22:40:00'), // 晚上10:40（用户报告的时间）
        new Date('2024-01-01T23:59:59'), // 接近午夜
      ];

      availableTimes.forEach(time => {
        jest.spyOn(global, 'Date').mockImplementation(() => time);
        expect(Utils.isServiceTimeAvailable()).toBe(true);
        jest.restoreAllMocks();
      });
    });

    it('应该在服务维护时间返回 false（服务不可用）', () => {
      // 测试服务不可用的时间点（04:30-12:30）
      const unavailableTimes = [
        new Date('2024-01-01T04:30:00'), // 4:30（维护开始）
        new Date('2024-01-01T04:31:00'), // 4:31
        new Date('2024-01-01T05:00:00'), // 早上5点
        new Date('2024-01-01T06:00:00'), // 早上6点
        new Date('2024-01-01T08:00:00'), // 早上8点
        new Date('2024-01-01T10:00:00'), // 上午10点
        new Date('2024-01-01T11:00:00'), // 上午11点
        new Date('2024-01-01T12:00:00'), // 中午12点
        new Date('2024-01-01T12:29:00'), // 12:29
        new Date('2024-01-01T12:30:00'), // 12:30（维护结束）
      ];

      unavailableTimes.forEach(time => {
        jest.spyOn(global, 'Date').mockImplementation(() => time);
        expect(Utils.isServiceTimeAvailable()).toBe(false);
        jest.restoreAllMocks();
      });
    });

    it('应该正确处理边界情况', () => {
      // 测试边界时间点
      const boundaryTests = [
        { time: new Date('2024-01-01T04:29:59'), expected: true },  // 4:29:59 - 服务可用
        { time: new Date('2024-01-01T04:30:00'), expected: false }, // 4:30:00 - 服务不可用
        { time: new Date('2024-01-01T12:30:00'), expected: false }, // 12:30:00 - 服务不可用
        { time: new Date('2024-01-01T12:30:59'), expected: false }, // 12:30:59 - 服务不可用
        { time: new Date('2024-01-01T12:31:00'), expected: true },  // 12:31:00 - 服务可用
      ];

      boundaryTests.forEach(({ time, expected }) => {
        jest.spyOn(global, 'Date').mockImplementation(() => time);
        expect(Utils.isServiceTimeAvailable()).toBe(expected);
        jest.restoreAllMocks();
      });
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