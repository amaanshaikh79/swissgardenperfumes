# Image Display Fix Guide

## Issue
Product cards showing lifestyle photos instead of actual product bottle images.

## Root Cause
The database was seeded correctly, but the application needs to:
1. Clear browser cache
2. Restart the development server
3. Verify image files are in correct location

## ✅ Solution Steps

### Step 1: Verify Image Files (Already Done ✅)
All correct images are in `client/public/Images/`:
- Alpine Savage.JPG ✅
- Alpine Savage(2).JPG ✅
- Alpine Savage(3).jpg ✅
- Blue Dominion.JPG ✅
- Blue Dominion(2).JPG ✅
- Blue Dominion(3).jpg ✅
- Citrus Reverie.JPG ✅
- Citrus Reverie(2).JPG ✅
- Citrus Reverie(3).jpg ✅
- Royal Ascent.JPG ✅
- Royal Ascent(2).JPG ✅
- Royal Ascent(3).jpg ✅
- Swiss Flora.JPG ✅
- Swiss Flora(2).JPG ✅
- Swiss Flora(3).jpg ✅
- Glacier Splash.JPG ✅
- Glacier Splash(2).JPG ✅
- Glacier Splash(3).jpg ✅

### Step 2: Database Re-seeded (Already Done ✅)
```bash
cd server
npm run seed
```

Database now has correct image paths:
```javascript
images: [
    { url: '/Images/Alpine Savage.JPG', alt: 'Alpine Savage - Main View' },
    { url: '/Images/Alpine Savage(2).JPG', alt: 'Alpine Savage - Hover View' },
    { url: '/Images/Alpine Savage(3).jpg', alt: 'Alpine Savage - Alternate View' },
]
```

### Step 3: Restart Development Server

**Stop the current server** (if running):
- Press `Ctrl + C` in the server terminal

**Start the server again**:
```bash
cd server
npm run dev
```

**Start the client** (if not running):
```bash
cd client
npm run dev
```

### Step 4: Clear Browser Cache

**Option A: Hard Refresh**
- Windows/Linux: `Ctrl + Shift + R` or `Ctrl + F5`
- Mac: `Cmd + Shift + R`

**Option B: Clear Cache Manually**
1. Open Developer Tools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

**Option C: Incognito/Private Window**
- Open a new incognito/private window
- Navigate to `http://localhost:5173` (or your dev URL)

### Step 5: Verify Images are Loading

**Check in Browser:**
1. Go to Shop page or Home page
2. Open Developer Tools (F12)
3. Go to Network tab
4. Filter by "Img"
5. Refresh page
6. Verify you see requests like:
   - `/Images/Alpine Savage.JPG` ✅
   - `/Images/Blue Dominion.JPG` ✅
   - `/Images/Citrus Reverie.JPG` ✅
   - etc.

**If still showing wrong images:**
1. Check if images are 404 (not found) in Network tab
2. Verify case sensitivity: `Alpine Savage.JPG` not `alpine savage.jpg`
3. Check file paths in MongoDB database directly

## 🔍 Debugging

### Check Database Directly
```javascript
// In MongoDB Compass or shell
db.products.find({}, { name: 1, images: 1 })
```

### Check Image URLs in Browser Console
```javascript
// In browser console
fetch('/Images/Alpine Savage.JPG')
  .then(r => console.log('Alpine Savage:', r.status))
```

### Verify ProductCard Component
The ProductCard component uses:
```jsx
<LazyImage
    src={product.images[0].url}  // Should be: /Images/Alpine Savage.JPG
    className="product-card-image-main"
/>
```

## ✅ Expected Result

**Default Display:**
- Alpine Savage.JPG (product bottle)
- Blue Dominion.JPG (product bottle)
- Citrus Reverie.JPG (product bottle)
- Royal Ascent.JPG (product bottle)
- Swiss Flora.JPG (product bottle)
- Glacier Splash.JPG (product bottle)

**On Hover:**
- Alpine Savage(2).JPG
- Blue Dominion(2).JPG
- Citrus Reverie(2).JPG
- Royal Ascent(2).JPG
- Swiss Flora(2).JPG
- Glacier Splash(2).JPG

## 🚨 Production Note

For production deployment:
1. Ensure all images are uploaded to server
2. Verify image paths are accessible
3. Check file permissions
4. Clear CDN cache if using CDN
5. Re-seed production database

---

**Status**: Database and seed file are correct ✅  
**Next Step**: Restart server + Clear browser cache
