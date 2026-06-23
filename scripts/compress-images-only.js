const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Directories
const IMAGES_DIR = path.join(__dirname, '../client/public/Images');
const OUTPUT_DIR = path.join(__dirname, '../client/public/Images-compressed');

// Create output directory
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Helper function to format bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Compress images
async function compressImages() {
  const files = fs.readdirSync(IMAGES_DIR).filter(file => 
    /\.(jpg|jpeg|png)$/i.test(file)
  );

  console.log(`\n🖼️  Found ${files.length} images to compress\n`);
  console.log('━'.repeat(80));
  
  let totalInputSize = 0;
  let totalOutputSize = 0;
  
  for (const file of files) {
    const inputPath = path.join(IMAGES_DIR, file);
    const outputPath = path.join(OUTPUT_DIR, file.replace(/\.(jpg|jpeg|png)$/i, '.webp'));
    
    try {
      const inputStats = fs.statSync(inputPath);
      const inputSize = inputStats.size;
      totalInputSize += inputSize;

      await sharp(inputPath)
        .webp({ quality: 80 })
        .toFile(outputPath);

      const outputStats = fs.statSync(outputPath);
      const outputSize = outputStats.size;
      totalOutputSize += outputSize;
      
      const savedPercent = ((inputSize - outputSize) / inputSize * 100).toFixed(1);
      const saved = inputSize - outputSize;

      console.log(`✅ ${file}`);
      console.log(`   ${formatBytes(inputSize)} → ${formatBytes(outputSize)} | Saved: ${formatBytes(saved)} (${savedPercent}%)`);
      console.log('');
    } catch (error) {
      console.error(`❌ Error compressing ${file}:`, error.message);
    }
  }
  
  console.log('━'.repeat(80));
  console.log('\n📊 Summary:');
  console.log(`   Total original size: ${formatBytes(totalInputSize)}`);
  console.log(`   Total compressed size: ${formatBytes(totalOutputSize)}`);
  console.log(`   Total saved: ${formatBytes(totalInputSize - totalOutputSize)}`);
  console.log(`   Compression ratio: ${((totalInputSize - totalOutputSize) / totalInputSize * 100).toFixed(1)}%`);
  console.log(`\n📂 Compressed images saved to: ${OUTPUT_DIR}`);
  console.log('\n⚠️  Next steps:');
  console.log('   1. Review the compressed images');
  console.log('   2. Run "node replace-originals.js" to replace originals');
  console.log('   3. Update your code to use .webp extensions\n');
}

// Main execution
async function main() {
  console.log('🚀 Starting image compression...');
  
  try {
    await compressImages();
    console.log('✨ Compression complete!\n');
  } catch (error) {
    console.error('❌ Compression failed:', error);
    process.exit(1);
  }
}

main();
