# Quick Start: Media Compression

## ✅ Images Compressed!

Your images have been successfully compressed:
- **Original size**: 73.85 MB
- **Compressed size**: 6.12 MB
- **Savings**: 67.73 MB (91.7% reduction!)

The compressed images are saved in `client/public/Images-compressed/`

## 🎬 Next: Compress Videos

Your videos are currently ~480 MB total. Let's compress them too!

### Step 1: Install FFmpeg

Choose one method:

**Easiest (Windows 10/11):**
```bash
winget install ffmpeg
```

**Or using Chocolatey:**
```bash
choco install ffmpeg
```

**Or using Scoop:**
```bash
scoop install ffmpeg
```

After installation, **restart your terminal** and verify:
```bash
ffmpeg -version
```

### Step 2: Compress Videos
```bash
cd scripts
npm run compress:videos
```

Expected savings: ~200-250 MB (40-50% reduction)

## 📝 Replace Original Files

After reviewing both compressed images and videos:

```bash
cd scripts
node replace-originals.js
```

This will:
1. ✅ Backup originals to `backups/media-originals/`
2. ✅ Replace images with WebP versions
3. ✅ Replace videos with compressed MP4s

## 🔧 Update Your Code

### Images: JPG → WebP

Find and replace in your React components:

**Before:**
```jsx
<img src="/Images/Alpine Savage.JPG" />
```

**After:**
```jsx
<img src="/Images/Alpine Savage.webp" />
```

### Quick Find & Replace

Search for: `\.JPG` or `\.jpg`
Replace with: `.webp`

**Files to update:**
- `client/src/pages/*.jsx`
- `client/src/components/**/*.jsx`

### Or Use Dynamic Loading

Update your image loading logic to automatically use WebP:

```jsx
const getImagePath = (name) => {
  const extension = '.webp'; // or '.JPG' for fallback
  return `/Images/${name}${extension}`;
};

// Usage
<img src={getImagePath('Alpine Savage')} alt="Alpine Savage" />
```

## 📊 Total Savings

After compressing both images and videos:

- **Images**: 73.85 MB → ~6 MB (91.7% saved)
- **Videos**: ~480 MB → ~250 MB (48% saved)
- **Total savings**: ~300 MB

This will significantly improve:
- ✅ Page load times
- ✅ Mobile experience
- ✅ Bandwidth costs
- ✅ SEO scores

## 🚨 Important Notes

1. **Backup**: Originals are automatically backed up before replacement
2. **Quality**: Review compressed files before replacing
3. **Browser Support**: WebP is supported in all modern browsers
4. **Rollback**: You can always restore from `backups/media-originals/`

## Need Help?

- Images not loading? Check file paths and extensions
- Videos playing issues? Ensure H.264 codec support
- FFmpeg errors? See `INSTALL_FFMPEG.md`
