const imagemin = require('imagemin');
const imageminWebp = require('imagemin-webp');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const fs = require('fs');
const path = require('path');

// 图片优化配置
const webpOptions = {
  quality: 85,
  method: 6,
  autoFilter: true,
  filter: 0.8
};

const jpegOptions = {
  quality: 85,
  progressive: true,
  smooth: 1
};

const pngOptions = {
  quality: [0.6, 0.8],
  speed: 4
};

// 优化函数
async function optimizeImages() {
  const srcDir = path.join(__dirname, '../src/images');
  const distDir = path.join(__dirname, '../dist/images');
  
  // 确保目标目录存在
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  
  try {
    console.log('开始优化图片...');
    
    // 优化为WebP格式
    const webpFiles = await imagemin([`${srcDir}/*.{jpg,jpeg,png}`], {
      destination: distDir,
      plugins: [
        imageminWebp(webpOptions)
      ]
    });
    
    console.log(`WebP优化完成: ${webpFiles.length} 个文件`);
    
    // 优化JPEG文件
    const jpegFiles = await imagemin([`${srcDir}/*.{jpg,jpeg}`], {
      destination: distDir,
      plugins: [
        imageminMozjpeg(jpegOptions)
      ]
    });
    
    console.log(`JPEG优化完成: ${jpegFiles.length} 个文件`);
    
    // 优化PNG文件
    const pngFiles = await imagemin([`${srcDir}/*.png`], {
      destination: distDir,
      plugins: [
        imageminPngquant(pngOptions)
      ]
    });
    
    console.log(`PNG优化完成: ${pngFiles.length} 个文件`);
    
    // 生成图片清单
    generateImageManifest(distDir);
    
    console.log('图片优化完成！');
  } catch (error) {
    console.error('图片优化失败:', error);
  }
}

// 生成图片清单
function generateImageManifest(distDir) {
  const manifest = {
    images: [],
    generated: new Date().toISOString()
  };
  
  function scanDirectory(dir, relativePath = '') {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath, path.join(relativePath, file));
      } else if (stat.isFile()) {
        const ext = path.extname(file).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
          manifest.images.push({
            name: file,
            path: path.join(relativePath, file),
            size: stat.size,
            type: ext.substring(1)
          });
        }
      }
    });
  }
  
  scanDirectory(distDir);
  
  const manifestPath = path.join(distDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  
  console.log(`图片清单已生成: ${manifestPath}`);
}

// 如果直接运行此脚本
if (require.main === module) {
  optimizeImages();
}

module.exports = { optimizeImages }; 