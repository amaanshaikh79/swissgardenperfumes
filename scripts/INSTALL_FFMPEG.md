# Installing FFmpeg for Video Compression

FFmpeg is required to compress video files. Here are the easiest ways to install it on Windows:

## Option 1: Using Winget (Recommended - Windows 10/11)

1. Open PowerShell or Command Prompt
2. Run:
```bash
winget install ffmpeg
```
3. Restart your terminal
4. Verify: `ffmpeg -version`

## Option 2: Using Chocolatey

If you have Chocolatey installed:
```bash
choco install ffmpeg
```

## Option 3: Using Scoop

If you have Scoop installed:
```bash
scoop install ffmpeg
```

## Option 4: Manual Installation

1. Go to: https://www.gyan.dev/ffmpeg/builds/
2. Download: **ffmpeg-release-essentials.zip**
3. Extract the zip file to `C:\ffmpeg`
4. Add to PATH:
   - Press `Win + X` → System
   - Click "Advanced system settings"
   - Click "Environment Variables"
   - Under "System variables", find "Path"
   - Click "Edit" → "New"
   - Add: `C:\ffmpeg\bin`
   - Click OK on all dialogs
5. Restart your terminal
6. Verify: `ffmpeg -version`

## After Installation

Run the video compression:
```bash
cd scripts
node compress-media.js
```

Or for videos only:
```bash
node compress-videos-only.js
```

## Need Help?

If you encounter issues:
1. Make sure you restarted your terminal after installation
2. Check that FFmpeg is in your PATH: `where ffmpeg`
3. Try running as Administrator
