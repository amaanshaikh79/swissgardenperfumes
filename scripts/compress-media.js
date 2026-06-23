const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { exec } = require('child_process');

const execPromise = promisify(exec);

// Directories
const IMAGES_DIR = path.join(__dirname, '../client/public/Images');
const VIDEOS_DIR = path.join(__dirname, '../client/public/Video');
const OUTPUT_IMAGES_DIR = path.join(__dirname, '../client/public/Images-compressed');
const OUTPUT_VIDEOS_DIR = path.join(__dirname, '../client/public/Video-compressed');

// Create output directories
if (!fs.existsSync(OUTPUT_IMAGES_DIR)) {
  fs.mkdirSync(OUTPUT_IMAGES_DIR, { recursive: true });
}
if (!fs.existsSync(OUTPUT_VIDEOS_DIR)) {
  fs.mkdirSync(OUTPUT_VIDEOS_DIR, { recursive: true });
}

// Compress images using Sharp
async function compressImages() {
  const sharp = require('sharp');
  const files = fs.readdirSync(IMAGES_DIR).filter(file => 
    /\.(jpg|jpeg|png)$/i.test(file)
  );

  console.log(`\n🖼️  Compressing ${files.length} images...`);
  
  for (const file of files) {
    const inputPath = path.join(IMAGES_DIR, file);
    const outputPath = path.join(OUTPUT_IMAGES_DIR, file.replace(/\.(jpg|jpeg|png)$/i, '.webp'));
    
    try {
      const inputStats = fs.statSync(inputPath);
      const inputSize = inputStats.size;

      await sharp(inputPath)
        .webp({ quality: 80 })
        .toFile(outputPath);

      const outputStats = fs.statSync(outputPath);
      const outputSize = outputStats.size;
      const savedPercent = ((inputSize - outputSize) / inputSize * 100).toFixed(1);

      console.log(`✅ ${file}: ${formatBytes(inputSize)} → ${formatBytes(outputSize)} (${savedPercent}% saved)`);
    } catch (error) {
      console.error(`❌ Error compressing ${file}:`, error.message);
    }
  }
}

// Compress videos using FFmpeg
async function compressVideos() {
  const files = fs.readdirSync(VIDEOS_DIR).filter(file => 
    /\.(mp4|mov|avi|mkv)$/i.test(file)
  );

  console.log(`\n🎬 Compressing ${files.length} videos...`);
  
  for (const file of files) {
    const inputPath = path.join(VIDEOS_DIR, file);
    const outputPath = path.join(OUTPUT_VIDEOS_DIR, file.replace(/\.(mov|avi|mkv)$/i, '.mp4'));
    
    try {
      const inputStats = fs.statSync(inputPath);
      const inputSize = inputStats.size;

      console.log(`⏳ Processing ${file}...`);

      // FFmpeg command for high-quality compression
      const ffmpegCmd = `ffmpeg -i "${inputPath}" -c:v libx264 -crf 28 -preset medium -c:a aac -b:a 128k -movflags +faststart "${outputPath}" -y`;
      
      await execPromise(ffmpegCmd);

      const outputStats = fs.statSync(outputPath);
      const outputSize = outputStats.size;
      const savedPercent = ((inputSize - outputSize) / inputSize * 100).toFixed(1);

      console.log(`✅ ${file}: ${formatBytes(inputSize)} → ${formatBytes(outputSize)} (${savedPercent}% saved)`);
    } catch (error) {
      console.error(`❌ Error compressing ${file}:`, error.message);
    }
  }
}

// Helper function to format bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Main execution
async function main() {
  console.log('🚀 Starting media compression...\n');
  console.log('📂 Output directories:');
  console.log(`   Images: ${OUTPUT_IMAGES_DIR}`);
  console.log(`   Videos: ${OUTPUT_VIDEOS_DIR}`);

  try {
    await compressImages();
    await compressVideos();
    
    console.log('\n✨ Compression complete!');
    console.log('\n⚠️  IMPORTANT: Review the compressed files before replacing originals.');
    console.log('To replace originals, run: node scripts/replace-originals.js');
  } catch (error) {
    console.error('❌ Compression failed:', error);
    process.exit(1);
  }
}

main();
