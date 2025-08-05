const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// 配置
const config = {
  inputDir: path.join(__dirname, '../src/assets/images'),
  outputDir: path.join(__dirname, '../dist/images'),
  formats: {
    jpeg: { quality: 80, progressive: true },
    png: { compressionLevel: 9, progressive: true },
    webp: { quality: 80, effort: 6 }
  },
  sizes: {
    thumbnail: { width: 150, height: 150 },
    medium: { width: 800, height: 600 },
    large: { width: 1200, height: 900 }
  }
};

// 确保输出目录存在
function ensureOutputDir() {
  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
  }
}

// 获取支持的图片格式
function isImageFile(filename) {
  const ext = path.extname(filename).toLowerCase();
  return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
}

// 优化单个图片
async function optimizeImage(inputPath, outputPath, format, options = {}) {
  try {
    const image = sharp(inputPath);
    
    // 应用格式特定的优化
    switch (format) {
      case 'jpeg':
        await image
          .jpeg({ quality: options.quality || config.formats.jpeg.quality, progressive: true })
          .toFile(outputPath);
        break;
      case 'png':
        await image
          .png({ compressionLevel: 9, progressive: true })
          .toFile(outputPath);
        break;
      case 'webp':
        await image
          .webp({ quality: options.quality || config.formats.webp.quality, effort: 6 })
          .toFile(outputPath);
        break;
      default:
        await image.toFile(outputPath);
    }
    
    console.log(`✅ 优化完成: ${path.basename(inputPath)} -> ${format.toUpperCase()}`);
    return true;
  } catch (error) {
    console.error(`❌ 优化失败: ${path.basename(inputPath)}`, error.message);
    return false;
  }
}

// 生成多种格式
async function generateMultipleFormats(inputPath, filename) {
  const baseName = path.parse(filename).name;
  const results = [];
  
  // 生成JPEG版本
  const jpegPath = path.join(config.outputDir, `${baseName}.jpg`);
  results.push(await optimizeImage(inputPath, jpegPath, 'jpeg'));
  
  // 生成WebP版本
  const webpPath = path.join(config.outputDir, `${baseName}.webp`);
  results.push(await optimizeImage(inputPath, webpPath, 'webp'));
  
  // 生成PNG版本（如果原图是PNG）
  if (path.extname(filename).toLowerCase() === '.png') {
    const pngPath = path.join(config.outputDir, `${baseName}.png`);
    results.push(await optimizeImage(inputPath, pngPath, 'png'));
  }
  
  return results;
}

// 生成缩略图
async function generateThumbnails(inputPath, filename) {
  const baseName = path.parse(filename).name;
  const results = [];
  
  try {
    // 生成缩略图
    const thumbnailPath = path.join(config.outputDir, `${baseName}-thumb.jpg`);
    await sharp(inputPath)
      .resize(config.sizes.thumbnail.width, config.sizes.thumbnail.height, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);
    
    console.log(`✅ 缩略图生成: ${path.basename(thumbnailPath)}`);
    results.push(true);
  } catch (error) {
    console.error(`❌ 缩略图生成失败: ${filename}`, error.message);
    results.push(false);
  }
  
  return results;
}

// 生成图片清单
function generateManifest() {
  const manifest = {
    generated: new Date().toISOString(),
    images: []
  };
  
  if (fs.existsSync(config.outputDir)) {
    const files = fs.readdirSync(config.outputDir);
    files.forEach(file => {
      if (isImageFile(file)) {
        const stats = fs.statSync(path.join(config.outputDir, file));
        manifest.images.push({
          filename: file,
          size: stats.size,
          format: path.extname(file).toLowerCase().slice(1)
        });
      }
    });
  }
  
  const manifestPath = path.join(config.outputDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`📋 图片清单已生成: ${manifestPath}`);
}

// 主函数
async function optimizeImages() {
  console.log('🚀 开始图片优化...');
  console.log(`📁 输入目录: ${config.inputDir}`);
  console.log(`📁 输出目录: ${config.outputDir}`);
  
  // 确保输出目录存在
  ensureOutputDir();
  
  // 检查输入目录是否存在
  if (!fs.existsSync(config.inputDir)) {
    console.log(`⚠️  输入目录不存在，创建示例目录: ${config.inputDir}`);
    fs.mkdirSync(config.inputDir, { recursive: true });
    
    // 创建示例文件
    const examplePath = path.join(config.inputDir, 'example.txt');
    fs.writeFileSync(examplePath, '请将需要优化的图片文件放在此目录中');
    console.log(`📝 已创建示例文件: ${examplePath}`);
    return;
  }
  
  const files = fs.readdirSync(config.inputDir);
  const imageFiles = files.filter(isImageFile);
  
  if (imageFiles.length === 0) {
    console.log('⚠️  未找到图片文件');
    return;
  }
  
  console.log(`📸 找到 ${imageFiles.length} 个图片文件`);
  
  let successCount = 0;
  let totalCount = 0;
  
  for (const filename of imageFiles) {
    const inputPath = path.join(config.inputDir, filename);
    console.log(`\n🔄 处理: ${filename}`);
    
    try {
      // 生成多种格式
      const formatResults = await generateMultipleFormats(inputPath, filename);
      totalCount += formatResults.length;
      successCount += formatResults.filter(Boolean).length;
      
      // 生成缩略图
      const thumbnailResults = await generateThumbnails(inputPath, filename);
      totalCount += thumbnailResults.length;
      successCount += thumbnailResults.filter(Boolean).length;
      
    } catch (error) {
      console.error(`❌ 处理失败: ${filename}`, error.message);
    }
  }
  
  // 生成清单
  generateManifest();
  
  console.log(`\n🎉 优化完成!`);
  console.log(`✅ 成功: ${successCount}/${totalCount}`);
  console.log(`📁 输出目录: ${config.outputDir}`);
  
  if (successCount < totalCount) {
    console.log(`⚠️  有 ${totalCount - successCount} 个文件处理失败`);
  }
}

// 命令行参数处理
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
📸 图片优化工具 (Sharp版本)

用法: node optimize-images.js [选项]

选项:
  --help, -h     显示帮助信息
  --input <dir>  指定输入目录 (默认: src/assets/images)
  --output <dir> 指定输出目录 (默认: dist/images)
  --quality <n>  设置JPEG/WebP质量 (默认: 80)
  --format <fmt> 指定输出格式 (jpeg, png, webp, all)

示例:
  node optimize-images.js
  node optimize-images.js --input ./images --output ./optimized
  node optimize-images.js --quality 90 --format webp
`);
  process.exit(0);
}

// 处理命令行参数
if (args.includes('--input')) {
  const inputIndex = args.indexOf('--input');
  if (inputIndex + 1 < args.length) {
    config.inputDir = path.resolve(args[inputIndex + 1]);
  }
}

if (args.includes('--output')) {
  const outputIndex = args.indexOf('--output');
  if (outputIndex + 1 < args.length) {
    config.outputDir = path.resolve(args[outputIndex + 1]);
  }
}

if (args.includes('--quality')) {
  const qualityIndex = args.indexOf('--quality');
  if (qualityIndex + 1 < args.length) {
    const quality = parseInt(args[qualityIndex + 1]);
    if (quality >= 1 && quality <= 100) {
      config.formats.jpeg.quality = quality;
      config.formats.webp.quality = quality;
    }
  }
}

// 运行优化
optimizeImages().catch(error => {
  console.error('❌ 程序执行失败:', error);
  process.exit(1);
}); 