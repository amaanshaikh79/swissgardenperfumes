# SwissGarden Perfumes - Responsive Design Testing Guide

## 📱 Device Breakpoints

| Breakpoint | Width Range | Target Devices |
|------------|-------------|----------------|
| **Mobile Small** | 320px - 480px | iPhone SE, older Android phones |
| **Mobile** | 481px - 768px | iPhone 12/13/14, most Android phones |
| **Tablet** | 769px - 1024px | iPad, Android tablets |
| **Desktop** | 1025px - 1440px | Laptops, small desktops |
| **Large Desktop** | 1441px+ | Large monitors, 4K displays |

---

## ✅ Testing Checklist

### All Pages Must Pass:

#### Mobile Small (320px - 480px)
- [ ] Navigation menu opens correctly (hamburger icon visible)
- [ ] All text is readable (no overlapping)
- [ ] Buttons are at least 44x44px (touch-friendly)
- [ ] Images scale properly (no overflow)
- [ ] Videos don't autoplay or are hidden
- [ ] Forms are usable (inputs stack vertically)
- [ ] Product cards display in 2 columns max
- [ ] No horizontal scrolling
- [ ] Footer content stacks properly

#### Mobile (481px - 768px)
- [ ] Navigation adapts smoothly
- [ ] Hero section displays correctly
- [ ] Product grids show 2-3 items per row
- [ ] Video gallery scrolls horizontally
- [ ] All CTAs are visible and clickable
- [ ] Cart drawer slides in smoothly
- [ ] Filter options work correctly
- [ ] Images lazy load properly

#### Tablet (769px - 1024px)
- [ ] Full navigation visible or collapsible
- [ ] Product grids show 3-4 items per row
- [ ] Hero content centered properly
- [ ] Sidebar layouts work correctly
- [ ] Touch interactions work
- [ ] Modal dialogs sized appropriately

#### Desktop (1025px+)
- [ ] Full navigation visible
- [ ] Product grids show 4+ items per row
- [ ] Hover effects work correctly
- [ ] All animations smooth at 60fps
- [ ] Multi-column layouts display properly
- [ ] Large images load without pixelation

---

## 🧪 Testing Methods

### Method 1: Browser DevTools (Chrome/Edge)

1. **Open DevTools**: Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
2. **Toggle Device Toolbar**: Press `Ctrl+Shift+M` (Windows) / `Cmd+Shift+M` (Mac)
3. **Select Device Presets**:
   - iPhone SE (375 x 667)
   - iPhone 12 Pro (390 x 844)
   - iPhone 14 Pro Max (430 x 932)
   - Pixel 5 (393 x 851)
   - iPad Air (820 x 1180)
   - iPad Pro (1024 x 1366)
   - Desktop (1920 x 1080)

4. **Custom Breakpoint Testing**:
   - Set to "Responsive" mode
   - Drag to test: 320px, 480px, 768px, 1024px, 1440px, 1920px

5. **Network Throttling**:
   - Open Network tab
   - Select throttling: "Slow 3G", "Fast 3G", "4G"
   - Test video/image loading

### Method 2: Real Device Testing

#### iOS Devices
- [ ] iPhone SE (2020) - Safari
- [ ] iPhone 12/13 - Safari & Chrome
- [ ] iPhone 14 Pro - Safari
- [ ] iPad (9th gen) - Safari
- [ ] iPad Pro - Safari

#### Android Devices
- [ ] Samsung Galaxy S21 - Chrome
- [ ] Google Pixel 5 - Chrome
- [ ] OnePlus 9 - Chrome
- [ ] Samsung Galaxy Tab - Chrome

### Method 3: Online Testing Tools

1. **BrowserStack** (https://www.browserstack.com)
   - Test on real devices remotely
   - iOS and Android coverage

2. **Responsive Design Checker** (https://responsivedesignchecker.com)
   - Quick viewport testing
   - Multiple device presets

3. **Chrome DevTools Device Mode**
   - Built-in device emulation
   - Network throttling

---

## 🎯 Page-by-Page Testing

### Homepage (`/`)

#### Mobile Small (320px)
```
✓ Hero video hidden or optimized
✓ Hero text readable (font size 1.6rem+)
✓ CTAs stack vertically
✓ Product grid: 2 columns
✓ Video gallery scrolls horizontally
✓ Newsletter form stacks
✓ Review cards stack
```

#### Mobile (768px)
```
✓ Hero video plays (if good connection)
✓ Hero text larger (2rem+)
✓ Product grid: 2-3 columns
✓ Navigation: hamburger menu
✓ Animations simplified
```

#### Tablet (1024px)
```
✓ Hero video full quality
✓ Product grid: 3-4 columns
✓ Navigation: full menu or condensed
✓ All animations enabled
```

#### Desktop (1440px+)
```
✓ Hero video HD quality
✓ Product grid: 4-6 columns
✓ Full navigation
✓ Hover effects active
```

### Shop Page (`/shop`)

#### All Breakpoints
```
✓ Filter sidebar responsive
✓ Product grid adapts
✓ Sort dropdown accessible
✓ Pagination visible
✓ Quick view modal responsive
```

### Product Detail Page (`/product/:id`)

#### Mobile
```
✓ Image gallery swipeable
✓ Thumbnails scrollable
✓ Product info readable
✓ Size/variant selectors touch-friendly
✓ Add to cart button fixed/sticky
✓ Description accordions work
```

#### Desktop
```
✓ Image gallery: 2 columns (gallery + info)
✓ Thumbnails: vertical sidebar
✓ Hover zoom on images
✓ Related products: 4 columns
```

### Combo Set Page (`/combo-set`)

#### Mobile
```
✓ Hero video optimized
✓ Selection slots stack vertically
✓ Product cards: 1 column
✓ Selection UI touch-friendly
✓ Sticky add to cart
```

#### Desktop
```
✓ Hero video full quality
✓ Selection slots: 3 columns
✓ Product cards: 2 columns
✓ Smooth interactions
```

### Checkout Page (`/checkout`)

#### Mobile
```
✓ Form fields stack
✓ Input labels visible
✓ Address fields readable
✓ Payment section clear
✓ Order summary sticky/collapsible
```

#### Desktop
```
✓ Two-column layout (form + summary)
✓ Progress indicator visible
✓ All fields accessible
```

---

## 🐛 Common Issues & Fixes

### Issue: Horizontal Scrolling on Mobile
**Cause**: Element wider than viewport
**Fix**: 
```css
* {
    max-width: 100%;
    overflow-x: hidden;
}
```

### Issue: Text Too Small on Mobile
**Cause**: Fixed font sizes
**Fix**:
```css
h1 { font-size: clamp(1.5rem, 5vw, 3rem); }
p { font-size: clamp(0.875rem, 2vw, 1rem); }
```

### Issue: Images Not Loading on Mobile
**Cause**: Large file sizes
**Fix**: 
- Compress images (< 200KB)
- Use responsive images with srcset
- Implement lazy loading

### Issue: Touch Targets Too Small
**Cause**: Buttons/links smaller than 44x44px
**Fix**:
```css
.btn, a { 
    min-width: 44px; 
    min-height: 44px; 
}
```

### Issue: Video Not Playing on iOS
**Cause**: Missing `playsInline` or not muted
**Fix**:
```jsx
<video playsInline muted autoPlay />
```

### Issue: Layout Shifts During Load
**Cause**: No image dimensions specified
**Fix**:
```jsx
<img width="400" height="500" />
/* or */
.image-wrapper { aspect-ratio: 4/5; }
```

---

## 📊 Performance Testing

### Lighthouse Audit Targets

Run Lighthouse on each page for mobile and desktop:

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse https://swissgardenperfumes.com --view

# Mobile audit
lighthouse https://swissgardenperfumes.com --preset=mobile --view

# Desktop audit
lighthouse https://swissgardenperfumes.com --preset=desktop --view
```

#### Target Scores (Mobile)
- **Performance**: 90+
- **Accessibility**: 95+
- **Best Practices**: 95+
- **SEO**: 100

#### Target Scores (Desktop)
- **Performance**: 95+
- **Accessibility**: 95+
- **Best Practices**: 95+
- **SEO**: 100

### Core Web Vitals Targets

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| **LCP** | ≤ 2.5s | 2.5s - 4.0s | > 4.0s |
| **FID** | ≤ 100ms | 100ms - 300ms | > 300ms |
| **CLS** | ≤ 0.1 | 0.1 - 0.25 | > 0.25 |
| **FCP** | ≤ 1.8s | 1.8s - 3.0s | > 3.0s |
| **TTFB** | ≤ 800ms | 800ms - 1800ms | > 1800ms |

---

## 🔍 Manual Testing Checklist

### Navigation
- [ ] Mobile menu opens/closes smoothly
- [ ] All links work on all devices
- [ ] Logo links to homepage
- [ ] Active page highlighted
- [ ] Cart icon shows item count
- [ ] User menu accessible

### Images
- [ ] All images lazy load
- [ ] Proper aspect ratios maintained
- [ ] No broken images
- [ ] Alt text present (accessibility)
- [ ] Hover effects work (desktop)

### Videos
- [ ] Hero video autoplays (muted)
- [ ] Gallery videos load on scroll
- [ ] Controls accessible if needed
- [ ] Mobile: reduced quality or hidden
- [ ] No autoplay on slow connections

### Forms
- [ ] Input fields properly sized
- [ ] Labels clearly visible
- [ ] Error messages display correctly
- [ ] Submit buttons accessible
- [ ] Auto-focus works
- [ ] Keyboard navigation works

### Modals & Drawers
- [ ] Cart drawer slides smoothly
- [ ] Product quick view opens correctly
- [ ] Close buttons accessible
- [ ] Background overlay works
- [ ] Scroll locked when open

### Animations
- [ ] Smooth 60fps performance
- [ ] No janky scrolling
- [ ] Reduced on mobile (optional)
- [ ] Respect reduced-motion preference
- [ ] GPU-accelerated

---

## 🧰 Testing Tools Checklist

### Browser DevTools
- [ ] Responsive design mode
- [ ] Network throttling
- [ ] Performance profiling
- [ ] Lighthouse audit
- [ ] Console error check

### Accessibility
- [ ] Screen reader test (NVDA/JAWS)
- [ ] Keyboard navigation only
- [ ] Color contrast check (WCAG AA)
- [ ] Focus indicators visible
- [ ] ARIA labels present

### Cross-Browser
- [ ] Chrome (Windows/Mac)
- [ ] Firefox (Windows/Mac)
- [ ] Safari (Mac/iOS)
- [ ] Edge (Windows)
- [ ] Samsung Internet (Android)

---

## 📝 Testing Report Template

```markdown
## Test Date: [Date]
## Tester: [Name]
## Environment: [Browser/Device]

### Homepage
- Mobile (375px): ✅ / ❌
- Tablet (768px): ✅ / ❌
- Desktop (1440px): ✅ / ❌
- Issues: [List any issues]

### Shop Page
- Mobile: ✅ / ❌
- Tablet: ✅ / ❌
- Desktop: ✅ / ❌
- Issues: [List any issues]

### Product Detail
- Mobile: ✅ / ❌
- Tablet: ✅ / ❌
- Desktop: ✅ / ❌
- Issues: [List any issues]

### Performance Scores
- Mobile Lighthouse: [Score]
- Desktop Lighthouse: [Score]
- LCP: [Time]
- FID: [Time]
- CLS: [Score]

### Critical Issues: [High priority issues]
### Minor Issues: [Low priority issues]
### Recommendations: [Improvements]
```

---

## ✅ Final Verification

Before deployment, ensure:

1. **Responsive Design**
   - [ ] Tested on all breakpoints (320px - 1920px+)
   - [ ] No horizontal scrolling
   - [ ] All content readable
   - [ ] Touch targets 44x44px minimum

2. **Performance**
   - [ ] Lighthouse score 90+ (mobile)
   - [ ] Lighthouse score 95+ (desktop)
   - [ ] Images < 200KB each
   - [ ] Videos lazy loaded
   - [ ] Core Web Vitals: Good

3. **Functionality**
   - [ ] All links work
   - [ ] Forms submit correctly
   - [ ] Cart functions properly
   - [ ] Search works
   - [ ] Filters apply correctly

4. **Accessibility**
   - [ ] Keyboard navigable
   - [ ] Screen reader friendly
   - [ ] WCAG AA compliant
   - [ ] Proper heading hierarchy
   - [ ] Alt text on images

5. **Cross-Browser**
   - [ ] Chrome/Edge: Working
   - [ ] Firefox: Working
   - [ ] Safari: Working
   - [ ] Mobile browsers: Working

---

## 🎉 Success Criteria

✅ **Website is fully responsive** from 320px to 4K displays
✅ **Performance optimized** for all devices and connection speeds
✅ **No lag or layout issues** across all pages
✅ **Smooth animations** with GPU acceleration
✅ **Touch-friendly** on all mobile devices
✅ **Accessible** to all users
✅ **Fast loading** even on slow connections

**Result**: Seamless user experience across all devices! 🚀
