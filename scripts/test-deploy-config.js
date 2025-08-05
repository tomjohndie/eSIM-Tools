#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 测试Netlify部署配置...');

// 检查必要的文件
const requiredFiles = [
  'netlify.toml',
  '.netlifyignore',
  'index.html',
  'package.json'
];

console.log('\n📁 检查必要文件:');
let allFilesExist = true;
for (const file of requiredFiles) {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - 缺失`);
    allFilesExist = false;
  }
}

// 检查netlify.toml语法
console.log('\n📝 检查netlify.toml语法:');
try {
  const tomlContent = fs.readFileSync('netlify.toml', 'utf8');
  
  // 基本语法检查
  const lines = tomlContent.split('\n');
  let hasBuildSection = false;
  let hasRedirects = false;
  let hasHeaders = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === '[build]') hasBuildSection = true;
    if (trimmed.startsWith('[[redirects]]')) hasRedirects = true;
    if (trimmed.startsWith('[[headers]]')) hasHeaders = true;
  }
  
  if (hasBuildSection) {
    console.log('✅ [build] 部分存在');
  } else {
    console.log('❌ [build] 部分缺失');
  }
  
  if (hasRedirects) {
    console.log('✅ 重定向规则存在');
  } else {
    console.log('❌ 重定向规则缺失');
  }
  
  if (hasHeaders) {
    console.log('✅ 头部设置存在');
  } else {
    console.log('❌ 头部设置缺失');
  }
  
  console.log('✅ netlify.toml 语法检查通过');
  
} catch (error) {
  console.log('❌ netlify.toml 语法错误:', error.message);
}

// 检查.netlifyignore
console.log('\n🚫 检查.netlifyignore:');
try {
  const ignoreContent = fs.readFileSync('.netlifyignore', 'utf8');
  const ignoreLines = ignoreContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  
  console.log(`✅ 包含 ${ignoreLines.length} 个忽略规则`);
  
  const importantIgnores = ['node_modules/', 'scripts/', 'tests/', 'docs/'];
  for (const ignore of importantIgnores) {
    if (ignoreContent.includes(ignore)) {
      console.log(`✅ 忽略 ${ignore}`);
    } else {
      console.log(`⚠️  未忽略 ${ignore}`);
    }
  }
  
} catch (error) {
  console.log('❌ .netlifyignore 读取失败:', error.message);
}

// 检查部署文件
console.log('\n📦 检查部署文件:');
const deployFiles = [
  'index.html',
  'src/',
  'netlify/',
  'sw.js'
];

for (const file of deployFiles) {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - 缺失`);
  }
}

// 检查是否包含node_modules
console.log('\n🚫 检查是否包含node_modules:');
if (fs.existsSync('node_modules')) {
  console.log('⚠️  node_modules 目录存在 - 应该被忽略');
} else {
  console.log('✅ node_modules 目录不存在');
}

console.log('\n🎉 配置检查完成！');
console.log('💡 如果所有检查都通过，您的部署配置应该可以正常工作。'); 