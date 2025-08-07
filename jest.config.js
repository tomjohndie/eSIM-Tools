/**
 * Jest 测试框架配置
 */

module.exports = {
  // 测试环境
  testEnvironment: 'jsdom',
  
  // 测试文件匹配模式
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js',
    '**/__tests__/**/*.js'
  ],
  
  // 忽略的文件/目录
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/netlify/',
    '/.netlify/'
  ],
  
  // 覆盖率收集
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/*.spec.js',
    '!**/node_modules/**',
    '!**/dist/**'
  ],
  
  // 覆盖率报告格式
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov'
  ],
  
  // 覆盖率阈值
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60
    }
  },
  
  // 模块名映射
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/tests/__mocks__/styleMock.js',
    '\\.(gif|ttf|eot|svg|png|jpg|jpeg)$': '<rootDir>/tests/__mocks__/fileMock.js'
  },
  
  // 转换器配置
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  
  // 设置文件
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // 全局变量
  globals: {
    'NODE_ENV': 'test'
  },
  
  // 详细输出
  verbose: true,
  
  // 清除模拟
  clearMocks: true,
  
  // 恢复模拟
  restoreMocks: true
};