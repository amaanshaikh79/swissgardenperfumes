const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Directories
const IMAGES_DIR = path.join(__dirname, '../client/public/Images');
const VIDEOS_DIR = path.join(__dirname, '../client/public/Video');
const OUTPUT_IMAGES_DIR = path.join(__dirname, '../client/public/Images-compressed');
const OUTPUT_VIDEOS_DIR = path.join(__dirname, '../client/public/Video-compressed');
const BACKUP_DIR = path.join(__dirname, '../backups/media-originals');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function backupOriginals() {
  console.log('\n📦 Creating backup of original files...');
  
  const backupImagesDir = path.join(BACKUP_DIR, 'Images');
  const backupVideosDir = path.join(BACKUP_DIR, 'Video');
  
  fs.mkdirSync(backupImagesDir, { recursive: true });
  fs.mkdirSync(backupVideosDir, { recursive: true });

  // Backup images
  const imageFiles = fs.readdirSync(IMAGES_DIR);
  for (const file of imageFiles) {
    fs.copyFileSync(
      path.join(IMAGES_DIR, file),
      path.join(backupImagesDir, file)
    );
  }

  // Backup videos
  const videoFiles = fs.readdirSync(VIDEOS_DIR);
  for (const file of videoFiles) {
    fs.copyFileSync(
      path.join(VIDEOS_DIR, file),
      path.join(backupVideosDir, file)
    );
  }

  console.log(`✅ Backup created at: ${BACKUP_DIR}`);
}

async function replaceImages() {
  console.log('\n🖼️  Replacing images...');
  
  // Delete old images
  const oldImages = fs.readdirSync(IMAGES_DIR);
  for (const file of oldImages) {
    fs.unlinkSync(path.join(IMAGES_DIR, file));
  }

  // Move compressed images
  const compressedImages = fs.readdirSync(OUTPUT_IMAGES_DIR);
  for (const file of compressedImages) {
    fs.renameSync(
      path.join(OUTPUT_IMAGES_DIR, file),
      path.join(IMAGES_DIR, file)
    );
  }

  console.log(`✅ Replaced ${compressedImages.length} images`);
}

async function replaceVideos() {
  console.log('\n🎬 Replacing videos...');
  
  // Delete old videos
  const oldVideos = fs.readdirSync(VIDEOS_DIR);
  for (const file of oldVideos) {
    fs.unlinkSync(path.join(VIDEOS_DIR, file));
  }

  // Move compressed videos
  const compressedVideos = fs.readdirSync(OUTPUT_VIDEOS_DIR);
  for (const file of compressedVideos) {
    fs.renameSync(
      path.join(OUTPUT_VIDEOS_DIR, file),
      path.join(VIDEOS_DIR, file)
    );
  }

  console.log(`✅ Replaced ${compressedVideos.length} videos`);
}

async function main() {
  console.log('⚠️  WARNING: This will replace your original media files!');
  console.log('A backup will be created first.');
  console.log('');
  
  const answer = await question('Do you want to continue? (yes/no): ');
  
  if (answer.toLowerCase() !== 'yes') {
    console.log('❌ Operation cancelled.');
    rl.close();
    return;
  }

  try {
    await backupOriginals();
    await replaceImages();
    await replaceVideos();
    
    // Clean up temporary directories
    fs.rmdirSync(OUTPUT_IMAGES_DIR, { recursive: true });
    fs.rmdirSync(OUTPUT_VIDEOS_DIR, { recursive: true });
    
    console.log('\n✨ All done! Original files have been replaced.');
    console.log(`📦 Originals backed up to: ${BACKUP_DIR}`);
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  rl.close();
}

main();
