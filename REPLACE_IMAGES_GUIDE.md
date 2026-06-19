# Replace Product Images Guide

## ⚠️ Issue Identified
The database has **correct image URLs**, but the **physical image files** in `client/public/Images/` are lifestyle photos (people holding products), NOT product bottle images.

## Current Situation ✅ vs ❌

### Database URLs (Correct ✅):
```
/Images/Alpine Savage.JPG
/Images/Blue Dominion.JPG
/Images/Citrus Reverie.JPG
/Images/Royal Ascent.JPG
/Images/Swiss Flora.JPG
/Images/Glacier Splash.JPG
```

### Physical Files (Wrong ❌):
The files exist but contain **lifestyle photos** instead of **product bottles**

## 🎯 Solution: Replace Image Files

### Step 1: Prepare Your Product Bottle Images

You need **2 images per product** (bottle photos only):
1. **Main View** - Front view of the bottle
2. **Alternate View** - Side or angled view for hover effect

### Step 2: Name Images Correctly

**Exact naming required** (case-sensitive):

```
Alpine Savage.JPG          ← Main view
Alpine Savage(2).JPG       ← Hover view
Blue Dominion.JPG          ← Main view
Blue Dominion(2).JPG       ← Hover view
Citrus Reverie.JPG         ← Main view
Citrus Reverie(2).JPG      ← Hover view
Glacier Splash.JPG         ← Main view
Glacier Splash(2).JPG      ← Hover view
Royal Ascent.JPG           ← Main view
Royal Ascent(2).JPG        ← Hover view
Swiss Flora.JPG            ← Main view
Swiss Flora(2).JPG         ← Hover view
```

**Optional** (for product detail gallery):
```
Alpine Savage(3).jpg
Blue Dominion(3).jpg
Citrus Reverie(3).jpg
Glacier Splash(3).jpg
Royal Ascent(3).jpg
Swiss Flora(3).jpg
```

### Step 3: Replace Files

1. Navigate to folder:
   ```
   c:\swissgardenperfumes\client\public\Images\
   ```

2. **Backup current files** (optional):
   - Create a folder called `old_images`
   - Move current files there

3. **Copy your product bottle images** into `Images/` folder

4. **Verify naming** matches exactly (case-sensitive)

### Step 4: Optimize Images (Recommended)

Before uploading, optimize images for web:
- **Format**: JPG
- **Max dimensions**: 1000px × 1250px (4:5 aspect ratio)
- **File size**: Target 200-500KB per image
- **Quality**: 80-85%

**Tools for optimization:**
- TinyPNG (https://tinypng.com/)
- Squoosh (https://squoosh.app/)
- Photoshop: Save for Web

### Step 5: Restart Development Server

```bash
# Stop server (Ctrl + C)
# Then restart:
cd server
npm run dev
```

### Step 6: Clear Browser Cache

- Press `Ctrl + Shift + R` (Windows/Linux)
- Press `Cmd + Shift + R` (Mac)

OR open in Incognito/Private window

### Step 7: Verify

1. Go to Shop page: `http://localhost:5173/shop`
2. Check if product bottle images appear
3. Hover over images to see alternate view

## 📋 Image Requirements Checklist

### ✅ Each Product Needs:
- [ ] Main view image (Product Name.JPG)
- [ ] Hover view image (Product Name(2).JPG)
- [ ] Optional: Gallery image (Product Name(3).jpg)

### ✅ Image Specs:
- [ ] Format: JPG
- [ ] Aspect ratio: 4:5 (portrait)
- [ ] Naming: Exact match (case-sensitive)
- [ ] Content: Product bottle ONLY (no lifestyle photos)
- [ ] Background: White or transparent
- [ ] Quality: Clear, professional product shot
- [ ] Size: Optimized for web (< 500KB ideal)

## 🎨 Image Style Guide

### Main View (Product Name.JPG):
- Front-facing product bottle
- Centered in frame
- Clean white/neutral background
- Good lighting
- Label clearly visible
- Professional product photography

### Hover View (Product Name(2).JPG):
- Slightly angled or side view
- Same background as main view
- Consistent lighting
- Shows bottle from different perspective
- Maintains professional look

## 🚨 Common Mistakes to Avoid

❌ **Wrong naming**:
- `alpine savage.jpg` → Should be `Alpine Savage.JPG`
- `Alpine_Savage.JPG` → Should be `Alpine Savage.JPG`
- `AlpineSavage.JPG` → Should be `Alpine Savage.JPG`

❌ **Wrong content**:
- Lifestyle photos (people holding products)
- Multiple products in one image
- Low-quality/blurry images

❌ **Wrong format**:
- PNG when it should be JPG
- Lowercase extension when database expects uppercase

## 🎯 Expected Result

After replacing images, product cards should show:

**Default (no hover):**
- Clean product bottle photos
- Professional white background
- Product label visible

**On hover:**
- Alternate angle of product bottle
- Smooth fade transition
- Same professional quality

## 📸 Don't Have Product Photos?

If you don't have product bottle photos yet:

### Option 1: Create Mock-ups
- Use Photoshop/Canva templates
- Create roll-on bottle mock-ups
- Add your brand labels digitally

### Option 2: Temporary Placeholders
- Use solid color backgrounds with product names
- Add proper photos later before production launch

### Option 3: Hire Product Photographer
- Professional e-commerce product photography
- Ensure consistent lighting and angles
- Get multiple angles for each product

---

**Current Status**: Database ✅ | Image Files ❌  
**Next Action**: Replace image files in `client/public/Images/`
