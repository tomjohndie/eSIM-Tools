#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 准备Netlify部署...');

// 定义要保留的文件和目录
const keepFiles = [
  'index.html',
  'src/',
  'netlify/',
  'sw.js',
  'README.md',
  'package.json',
  'netlify.toml',
  '.netlifyignore'
];

// 定义要排除的文件和目录
const excludeFiles = [
  'node_modules/',
  'scripts/',
  'tests/',
  'docs/',
  'webpack.config.js',
  'postcss.config.js',
  '.babelrc',
  '.env*',
  'env.example',
  '.git/',
  '.vscode/',
  '.idea/',
  '*.log',
  '*.tmp',
  '*.temp',
  '*.cache',
  'dist/',
  'build/',
  'out/',
  '.DS_Store',
  'Thumbs.db'
];

function shouldKeepFile(filePath) {
  // 检查是否在保留列表中
  for (const keepFile of keepFiles) {
    if (filePath.startsWith(keepFile) || filePath === keepFile) {
      return true;
    }
  }
  
  // 检查是否在排除列表中
  for (const excludeFile of excludeFiles) {
    if (filePath.includes(excludeFile) || filePath.endsWith(excludeFile.replace('/', ''))) {
      return false;
    }
  }
  
  return true;
}

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function analyzeDeployment() {
  console.log('\n📊 分析部署文件...');
  
  let totalFiles = 0;
  let totalSize = 0;
  let keptFiles = 0;
  let keptSize = 0;
  
  function scanDirectory(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const relativePath = path.relative('.', fullPath);
      
      if (fs.statSync(fullPath).isDirectory()) {
        scanDirectory(fullPath);
      } else {
        totalFiles++;
        const size = getFileSize(fullPath);
        totalSize += size;
        
        if (shouldKeepFile(relativePath)) {
          keptFiles++;
          keptSize += size;
          console.log(`✅ 保留: ${relativePath} (${formatFileSize(size)})`);
        } else {
          console.log(`❌ 排除: ${relativePath} (${formatFileSize(size)})`);
        }
      }
    }
  }
  
  try {
    scanDirectory('.');
  } catch (error) {
    console.log('⚠️  扫描目录时出错:', error.message);
  }
  
  console.log('\n📈 部署统计:');
  console.log(`总文件数: ${totalFiles}`);
  console.log(`总大小: ${formatFileSize(totalSize)}`);
  console.log(`保留文件数: ${keptFiles}`);
  console.log(`保留大小: ${formatFileSize(keptSize)}`);
  console.log(`排除文件数: ${totalFiles - keptFiles}`);
  console.log(`排除大小: ${formatFileSize(totalSize - keptSize)}`);
  console.log(`压缩率: ${((1 - keptSize / totalSize) * 100).toFixed(2)}%`);
}

function createDeploymentManifest() {
  console.log('\n📝 创建部署清单...');
  
  const manifest = {
    timestamp: new Date().toISOString(),
    files: [],
    stats: {
      totalFiles: 0,
      totalSize: 0
    }
  };
  
  function scanForManifest(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const relativePath = path.relative('.', fullPath);
      
      if (fs.statSync(fullPath).isDirectory()) {
        scanForManifest(fullPath);
      } else if (shouldKeepFile(relativePath)) {
        const size = getFileSize(fullPath);
        manifest.files.push({
          path: relativePath,
          size: size,
          sizeFormatted: formatFileSize(size)
        });
        manifest.stats.totalFiles++;
        manifest.stats.totalSize += size;
      }
    }
  }
  
  try {
    scanForManifest('.');
    fs.writeFileSync('deployment-manifest.json', JSON.stringify(manifest, null, 2));
    console.log('✅ 部署清单已创建: deployment-manifest.json');
  } catch (error) {
    console.log('❌ 创建部署清单失败:', error.message);
  }
}

// 执行分析
analyzeDeployment();
createDeploymentManifest();

console.log('\n🎉 部署准备完成！');
console.log('💡 提示: 确保 .netlifyignore 文件已正确配置');
console.log('🔗 部署链接: https://app.netlify.com/'); 