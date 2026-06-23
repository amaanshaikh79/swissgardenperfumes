const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { exec } = require('child_process');

const execPromise = promisify(exec);

// Directories
const VIDEOS_DIR = path.join(__dirname, '../client/public/Video');
const OUTPUT_DIR = path.join(__dirname, '../client/public/Video-compressed');

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

// Check if FFmpeg is installed
async function checkFFmpeg() {
  try {
    await execPromise('ffmpeg -version');
    return true;
  } catch (error) {
    return false;
  }
}

// Compress videos
async function compressVideos() {
  const files = fs.readdirSync(VIDEOS_DIR).filter(file => 
    /\.(mp4|mov|avi|mkv)$/i.test(file)
  );

  console.log(`\n🎬 Found ${files.length} videos to compress\n`);
  console.log('━'.repeat(80));
  
  let totalInputSize = 0;
  let totalOutputSize = 0;
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const inputPath = path.join(VIDEOS_DIR, file);
    const outputPath = path.join(OUTPUT_DIR, file.replace(/\.(mov|avi|mkv)$/i, '.mp4'));
    
    try {
      const inputStats = fs.statSync(inputPath);
      const inputSize = inputStats.size;
      totalInputSize += inputSize;

      console.log(`⏳ [${i + 1}/${files.length}] Processing: ${file}`);
      console.log(`   Original size: ${formatBytes(inputSize)}`);

      // FFmpeg command with progress
      const ffmpegCmd = `ffmpeg -i "${inputPath}" -c:v libx264 -crf 28 -preset medium -c:a aac -b:a 128k -movflags +faststart "${outputPath}" -y -loglevel error -stats`;
      
      await execPromise(ffmpegCmd, { maxBuffer: 10 * 1024 * 1024 });

      const outputStats = fs.statSync(outputPath);
      const outputSize = outputStats.size;
      totalOutputSize += outputSize;
      
      const savedPercent = ((inputSize - outputSize) / inputSize * 100).toFixed(1);
      const saved = inputSize - outputSize;

      console.log(`✅ Compressed: ${formatBytes(outputSize)}`);
      console.log(`   Saved: ${formatBytes(saved)} (${savedPercent}%)\n`);
    } catch (error) {
      console.error(`❌ Error compressing ${file}:`, error.message);
      console.log('');
    }
  }
  
  console.log('━'.repeat(80));
  console.log('\n📊 Summary:');
  console.log(`   Total original size: ${formatBytes(totalInputSize)}`);
  console.log(`   Total compressed size: ${formatBytes(totalOutputSize)}`);
  console.log(`   Total saved: ${formatBytes(totalInputSize - totalOutputSize)}`);
  console.log(`   Compression ratio: ${((totalInputSize - totalOutputSize) / totalInputSize * 100).toFixed(1)}%`);
  console.log(`\n📂 Compressed videos saved to: ${OUTPUT_DIR}`);
  console.log('\n⚠️  Next steps:');
  console.log('   1. Review the compressed videos');
  console.log('   2. Run "node replace-originals.js" to replace originals\n');
}

// Main execution
async function main() {
  console.log('🚀 Starting video compression...');
  
  // Check FFmpeg
  const hasFFmpeg = await checkFFmpeg();
  if (!hasFFmpeg) {
    console.error('\n❌ FFmpeg is not installed!');
    console.log('\n📖 Please install FFmpeg first. See INSTALL_FFMPEG.md for instructions.\n');
    console.log('Quick install options:');
    console.log('  • winget install ffmpeg');
    console.log('  • choco install ffmpeg');
    console.log('  • scoop install ffmpeg\n');
    process.exit(1);
  }
  
  try {
    await compressVideos();
    console.log('✨ Compression complete!\n');
  } catch (error) {
    console.error('❌ Compression failed:', error);
    process.exit(1);
  }
}

main();
