/**
 * Jest 测试设置文件
 */

// 导入 Jest DOM 扩展
import '@testing-library/jest-dom';

// 设置全局测试超时
jest.setTimeout(10000);

// 模拟 localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// 模拟 sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// 模拟 fetch API
global.fetch = jest.fn();

// 模拟 crypto API
global.crypto = {
  getRandomValues: (arr) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  },
  subtle: {
    digest: jest.fn((algorithm, data) => {
      // 简单的 SHA-256 模拟
      return Promise.resolve(new ArrayBuffer(32));
    })
  }
};

// 模拟 navigator.clipboard
global.navigator.clipboard = {
  writeText: jest.fn(() => Promise.resolve()),
  readText: jest.fn(() => Promise.resolve(''))
};

// 模拟 IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords() {
    return [];
  }
};

// 模拟 Service Worker
global.navigator.serviceWorker = {
  register: jest.fn(() => Promise.resolve({
    installing: null,
    waiting: null,
    active: null,
    addEventListener: jest.fn()
  }))
};

// 清理每个测试后的模拟
afterEach(() => {
  jest.clearAllMocks();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
});