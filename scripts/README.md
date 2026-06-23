# Media Compression Scripts

These scripts will compress all images and videos in your project to reduce file sizes and improve website performance.

## Current File Sizes

### Images (18 files)
- Total size: ~85 MB
- Format: JPG
- Target format: WebP (better compression)

### Videos (7 files)
- Total size: ~480 MB
- Format: MP4/MOV
- Target: Optimized MP4 with H.264

## Prerequisites

### 1. Install Node.js Dependencies
```bash
cd scripts
npm install
```

### 2. Install FFmpeg (for video compression)

**Windows:**
1. Download FFmpeg from: https://www.gyan.dev/ffmpeg/builds/
2. Extract the zip file
3. Add the `bin` folder to your system PATH
4. Verify installation: `ffmpeg -version`

**Alternative (using Chocolatey):**
```bash
choco install ffmpeg
```

**Alternative (using Scoop):**
```bash
scoop install ffmpeg
```

## Usage

### Step 1: Compress Media Files
```bash
cd scripts
npm run compress
```

This will:
- Convert images to WebP format with 80% quality
- Compress videos using H.264 codec with CRF 28
- Save compressed files to:
  - `client/public/Images-compressed/`
  - `client/public/Video-compressed/`
- Show before/after sizes and savings

### Step 2: Review Compressed Files
Before replacing originals:
1. Check the compressed images in `Images-compressed/`
2. Play compressed videos in `Video-compressed/`
3. Ensure quality is acceptable

### Step 3: Replace Original Files (Optional)
```bash
npm run replace
```

This will:
- Create a backup of originals in `backups/media-originals/`
- Replace original files with compressed versions
- Delete temporary compressed folders

## Important Notes

### Images
- **Format change**: JPG → WebP
- **Expected savings**: 60-80% file size reduction
- **Quality**: 80% (adjustable in script)
- **Browser support**: All modern browsers (Chrome, Firefox, Safari 14+, Edge)

### Videos
- **CRF value**: 28 (lower = better quality, higher file size)
  - Range: 18-28 recommended (18=high quality, 28=good quality, smaller files)
- **Expected savings**: 30-50% file size reduction
- **Codec**: H.264 with AAC audio
- **Optimization**: Fast start enabled for web streaming

### Updating Code References

After converting images to WebP, update your React components:

**Before:**
```jsx
<img src="/Images/Alpine Savage.JPG" alt="Alpine Savage" />
```

**After:**
```jsx
<img src="/Images/Alpine Savage.webp" alt="Alpine Savage" />
```

Or use a utility function to handle both formats:
```jsx
const getImageSrc = (name) => `/Images/${name}.webp`;
```

## Customization

### Adjust Image Quality
Edit `compress-media.js`, line with `.webp({ quality: 80 })`:
- Lower quality (60-70): Smaller files, some quality loss
- Higher quality (85-95): Larger files, minimal quality loss

### Adjust Video Quality
Edit `compress-media.js`, line with `-crf 28`:
- CRF 23: Higher quality, larger files
- CRF 28: Good quality, smaller files (recommended)
- CRF 32: Lower quality, smallest files

## Troubleshooting

### FFmpeg not found
- Ensure FFmpeg is installed and in your PATH
- Restart your terminal after installation
- Test: `ffmpeg -version`

### Sharp installation issues
```bash
npm install --force sharp
```

### Out of memory
- Process files in smaller batches
- Close other applications
- Increase Node.js memory: `node --max-old-space-size=4096 compress-media.js`

## Expected Results

Based on your current files:

**Images:**
- Current: ~85 MB
- After compression: ~20-30 MB
- **Savings: ~55-65 MB (65-75%)**

**Videos:**
- Current: ~480 MB
- After compression: ~240-300 MB
- **Savings: ~180-240 MB (40-50%)**

**Total potential savings: ~240-300 MB**

## Rollback

If you need to restore originals:
```bash
# Originals are backed up in: backups/media-originals/
cp -r backups/media-originals/Images/* client/public/Images/
cp -r backups/media-originals/Video/* client/public/Video/
```
