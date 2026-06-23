const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { promisify } = require('util');
const { exec } = require('child_process');

const execPromise = promisify(exec);

// Directories
const IMAGES_DIR = path.join(__dirname, '../client/public/Images');
const VIDEOS_DIR = path.join(__dirname, '../client/public/Video');
const THUMB_IMAGES_DIR = path.join(__dirname, '../client/public/Images/thumbs');
const THUMB_VIDEOS_DIR = path.join(__dirname, '../client/public/Video/thumbs');

// Create thumbnail directories
if (!fs.existsSync(THUMB_IMAGES_DIR)) {
  fs.mkdirSync(THUMB_IMAGES_DIR, { recursive: true });
}
if (!fs.existsSync(THUMB_VIDEOS_DIR)) {
  fs.mkdirSync(THUMB_VIDEOS_DIR, { recursive: true });
}

// Helper function to format bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Create thumbnail images (10% of original dimensions)
async function createImageThumbnails() {
  const files = fs.readdirSync(IMAGES_DIR).filter(file => 
    /\.(webp|jpg|jpeg|png)$/i.test(file) && !fs.statSync(path.join(IMAGES_DIR, file)).isDirectory()
  );

  console.log(`\n🖼️  Creating thumbnails for ${files.length} images...\n`);
  console.log('━'.repeat(80));
  
  let totalInputSize = 0;
  let totalOutputSize = 0;
  
  for (const file of files) {
    const inputPath = path.join(IMAGES_DIR, file);
    const outputPath = path.join(THUMB_IMAGES_DIR, file);
    
    try {
      const inputStats = fs.statSync(inputPath);
      const inputSize = inputStats.size;
      totalInputSize += inputSize;

      // Get original dimensions
      const metadata = await sharp(inputPath).metadata();
      const newWidth = Math.round(metadata.width * 0.1);
      const newHeight = Math.round(metadata.height * 0.1);

      // Create thumbnail at 10% size with quality 70
      await sharp(inputPath)
        .resize(newWidth, newHeight, {
          fit: 'cover',
          position: 'center'
        })
        .webp({ quality: 70 })
        .toFile(outputPath);

      const outputStats = fs.statSync(outputPath);
      const outputSize = outputStats.size;
      totalOutputSize += outputSize;
      
      const savedPercent = ((inputSize - outputSize) / inputSize * 100).toFixed(1);

      console.log(`✅ ${file}`);
      console.log(`   ${metadata.width}x${metadata.height} → ${newWidth}x${newHeight}`);
      console.log(`   ${formatBytes(inputSize)} → ${formatBytes(outputSize)} (${savedPercent}% saved)\n`);
    } catch (error) {
      console.error(`❌ Error creating thumbnail for ${file}:`, error.message);
    }
  }
  
  console.log('━'.repeat(80));
  console.log('\n📊 Image Thumbnails Summary:');
  console.log(`   Total original size: ${formatBytes(totalInputSize)}`);
  console.log(`   Total thumbnail size: ${formatBytes(totalOutputSize)}`);
  console.log(`   Total saved: ${formatBytes(totalInputSize - totalOutputSize)}`);
  console.log(`   Compression ratio: ${((totalInputSize - totalOutputSize) / totalInputSize * 100).toFixed(1)}%`);
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

// Create thumbnail videos (scale to 10% and reduce bitrate)
async function createVideoThumbnails() {
  const hasFFmpeg = await checkFFmpeg();
  if (!hasFFmpeg) {
    console.log('\n⚠️  FFmpeg not found. Skipping video thumbnails.');
    console.log('   Install FFmpeg to create video thumbnails: winget install ffmpeg\n');
    return;
  }

  const files = fs.readdirSync(VIDEOS_DIR).filter(file => 
    /\.(mp4|mov|avi|mkv)$/i.test(file) && !fs.statSync(path.join(VIDEOS_DIR, file)).isDirectory()
  );

  console.log(`\n🎬 Creating thumbnails for ${files.length} videos...\n`);
  console.log('━'.repeat(80));
  
  let totalInputSize = 0;
  let totalOutputSize = 0;
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const inputPath = path.join(VIDEOS_DIR, file);
    const outputPath = path.join(THUMB_VIDEOS_DIR, file.replace(/\.(mov|avi|mkv)$/i, '.mp4'));
    
    try {
      const inputStats = fs.statSync(inputPath);
      const inputSize = inputStats.size;
      totalInputSize += inputSize;

      console.log(`⏳ [${i + 1}/${files.length}] Processing: ${file}`);
      console.log(`   Original size: ${formatBytes(inputSize)}`);

      // FFmpeg command: scale to 10%, reduce bitrate, compress heavily
      // Scale by 0.1, use higher CRF for more compression, reduce audio bitrate
      const ffmpegCmd = `ffmpeg -i "${inputPath}" -vf "scale=iw*0.1:ih*0.1" -c:v libx264 -crf 35 -preset fast -c:a aac -b:a 64k -movflags +faststart "${outputPath}" -y -loglevel error -stats`;
      
      await execPromise(ffmpegCmd, { maxBuffer: 50 * 1024 * 1024 });

      const outputStats = fs.statSync(outputPath);
      const outputSize = outputStats.size;
      totalOutputSize += outputSize;
      
      const savedPercent = ((inputSize - outputSize) / inputSize * 100).toFixed(1);

      console.log(`✅ Thumbnail size: ${formatBytes(outputSize)}`);
      console.log(`   Saved: ${formatBytes(inputSize - outputSize)} (${savedPercent}%)\n`);
    } catch (error) {
      console.error(`❌ Error creating thumbnail for ${file}:`, error.message);
      console.log('');
    }
  }
  
  console.log('━'.repeat(80));
  console.log('\n📊 Video Thumbnails Summary:');
  console.log(`   Total original size: ${formatBytes(totalInputSize)}`);
  console.log(`   Total thumbnail size: ${formatBytes(totalOutputSize)}`);
  console.log(`   Total saved: ${formatBytes(totalInputSize - totalOutputSize)}`);
  console.log(`   Compression ratio: ${((totalInputSize - totalOutputSize) / totalInputSize * 100).toFixed(1)}%`);
}

// Main execution
async function main() {
  console.log('🚀 Creating 1/10 size thumbnails for optimal display...\n');
  console.log('📂 Output directories:');
  console.log(`   Images: ${THUMB_IMAGES_DIR}`);
  console.log(`   Videos: ${THUMB_VIDEOS_DIR}`);

  try {
    await createImageThumbnails();
    await createVideoThumbnails();
    
    console.log('\n✨ Thumbnail creation complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Review thumbnails in /Images/thumbs and /Video/thumbs');
    console.log('   2. Update components to use thumbnails for display');
    console.log('   3. Load full-size on interaction or lazy load\n');
  } catch (error) {
    console.error('❌ Thumbnail creation failed:', error);
    process.exit(1);
  }
}

main();
