# SwissGarden Perfumes - Performance & Optimization Guide

## 🚀 Performance Optimizations Implemented

This guide documents all performance optimizations applied to ensure the website runs smoothly on both laptops and mobile devices.

---

## 📊 Performance Targets

- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms

---

## 🎥 Video Optimizations

### LazyVideo Component
**Location**: `client/src/components/common/LazyVideo.jsx`

**Features**:
- ✅ Viewport-based lazy loading (loads only when 100px from viewport)
- ✅ Mobile device detection
- ✅ Separate video sources for mobile vs desktop
- ✅ `preload="none"` for deferred loading
- ✅ `playsInline` for iOS compatibility
- ✅ Automatic cleanup on unmount

**Usage**:
```jsx
import LazyVideo from '../components/common/LazyVideo';

<LazyVideo
    src="/Video/product.mp4"
    mobileSrc="/Video/product-mobile.mp4"  // Optional: lighter version for mobile
    poster="/Images/poster.jpg"             // Optional: thumbnail before load
    className="hero-video"
    autoPlay
    loop
    muted
    playsInline
/>
```

**Best Practices**:
- Keep hero video to < 5MB
- Use H.264 codec for best compatibility
- Create mobile-optimized versions (720p max)
- Always mute autoplay videos

---

## 🖼️ Image Optimizations

### Enhanced LazyImage Component
**Location**: `client/src/components/common/LazyImage.jsx`

**Features**:
- ✅ Intersection Observer for lazy loading
- ✅ Responsive `srcset` and `sizes` support
- ✅ Priority loading for above-fold images
- ✅ Blur-up placeholder effect
- ✅ Error handling with fallback
- ✅ Hardware acceleration
- ✅ Reduced motion support

**Usage**:
```jsx
import LazyImage from '../components/common/LazyImage';

// Basic usage
<LazyImage 
    src="/Images/product.jpg" 
    alt="Product name"
/>

// With responsive images
<LazyImage 
    src="/Images/product-800w.jpg"
    srcSet="/Images/product-400w.jpg 400w, 
            /Images/product-800w.jpg 800w,
            /Images/product-1200w.jpg 1200w"
    sizes="(max-width: 768px) 100vw, 50vw"
    alt="Product name"
/>

// Priority image (above fold, no lazy load)
<LazyImage 
    src="/Images/hero.jpg" 
    alt="Hero"
    priority={true}
/>
```

**Image Optimization Checklist**:
- [ ] Compress images (use tools like TinyPNG, ImageOptim)
- [ ] Target: < 200KB per product image
- [ ] Use JPEG for photos, PNG for graphics with transparency
- [ ] Create responsive image variants (400w, 800w, 1200w)
- [ ] Set explicit width/height to prevent layout shift
- [ ] Use priority loading for hero/above-fold images

---

## ⚡ Animation Optimizations

### usePerformance Hook
**Location**: `client/src/hooks/usePerformance.js`

**Detects**:
- Mobile devices
- Low-end devices (CPU cores, memory)
- User motion preferences
- Network connection speed (4G, 3G, 2G)
- Data saver mode

**Usage**:
```jsx
import { usePerformance, getAnimationVariants } from '../hooks/usePerformance';

function MyComponent() {
    const { shouldReduceAnimations, isMobile } = usePerformance();
    const variants = getAnimationVariants(shouldReduceAnimations);

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={variants.slideUp}
        >
            Content
        </motion.div>
    );
}
```

### CSS Performance Optimizations
**Location**: `client/src/styles/index.css`

**Implemented**:
- ✅ Hardware acceleration with `transform: translateZ(0)`
- ✅ GPU-optimized transforms and opacity
- ✅ Reduced animation complexity on mobile
- ✅ Simplified shadows on mobile devices
- ✅ Disabled blur effects on mobile
- ✅ `content-visibility: auto` for off-screen sections
- ✅ Larger touch targets (44x44px minimum)
- ✅ Smooth scrolling with performance considerations

**Mobile-Specific**:
```css
@media (max-width: 768px) {
    * {
        animation-duration: 0.3s !important;
        transition-duration: 0.3s !important;
    }
    
    [class*="shadow"] {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
    }
}
```

**Reduced Motion**:
```css
@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
    }
}
```

---

## 📱 Mobile Responsiveness

### Breakpoints Used

| Device Type | Breakpoint | Optimizations |
|------------|------------|---------------|
| Mobile Small | 320px - 480px | Simplified animations, reduced effects |
| Mobile | 481px - 768px | Touch targets, simplified shadows |
| Tablet | 769px - 1024px | Balanced animations |
| Desktop | 1025px+ | Full animations and effects |

### Touch Device Optimizations

```css
@media (hover: none) and (pointer: coarse) {
    .btn, a, button {
        min-height: 44px;
        min-width: 44px;
    }
    
    .btn:hover {
        transform: none !important; /* Remove hover effects */
    }
}
```

---

## 🌐 Network Optimizations

### Data Saver Mode Support

```css
@media (prefers-reduced-data: reduce) {
    video {
        display: none !important;
    }
    
    * {
        animation: none !important;
    }
}
```

### Adaptive Video Quality

The `LazyVideo` component automatically adjusts quality based on:
- Device type (mobile vs desktop)
- Connection speed (4G, 3G, 2G)
- Data saver mode

---

## 🔍 Performance Monitoring

### Core Web Vitals Monitoring

Add to your analytics (Google Analytics 4 recommended):

```javascript
// Measure Core Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
    const body = JSON.stringify(metric);
    // Use `navigator.sendBeacon()` if available, falling back to `fetch()`
    if (navigator.sendBeacon) {
        navigator.sendBeacon('/analytics', body);
    } else {
        fetch('/analytics', { body, method: 'POST', keepalive: true });
    }
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### Browser DevTools Performance Audit

1. **Chrome DevTools**:
   - Open DevTools (F12)
   - Go to "Lighthouse" tab
   - Run audit for "Performance" and "Best Practices"
   - Target: 90+ score

2. **Check Network Tab**:
   - Throttle to "Slow 3G" or "Fast 3G"
   - Verify videos/images load progressively
   - Ensure no blocking resources

3. **Performance Tab**:
   - Record page load
   - Check for long tasks (> 50ms)
   - Verify smooth 60fps animations

---

## 📋 Performance Checklist

### Before Deployment

- [ ] Run Lighthouse audit (target 90+ performance score)
- [ ] Test on real devices (iPhone, Android, old devices)
- [ ] Verify responsive images load correctly
- [ ] Check video lazy loading works
- [ ] Test on slow 3G connection
- [ ] Verify reduced motion preferences work
- [ ] Check touch targets are 44x44px minimum
- [ ] Ensure no layout shifts (CLS < 0.1)
- [ ] Test with data saver mode enabled
- [ ] Verify all images have alt text
- [ ] Check font loading (no FOIT/FOUT)

### Image Optimization Workflow

1. **Compress images**:
   ```bash
   # Using ImageMagick
   convert input.jpg -quality 85 -strip output.jpg
   
   # Or use online tools:
   # - TinyPNG (https://tinypng.com)
   # - Squoosh (https://squoosh.app)
   ```

2. **Create responsive variants**:
   ```bash
   convert input.jpg -resize 400 product-400w.jpg
   convert input.jpg -resize 800 product-800w.jpg
   convert input.jpg -resize 1200 product-1200w.jpg
   ```

3. **Generate WebP versions** (optional):
   ```bash
   cwebp -q 85 input.jpg -o output.webp
   ```

### Video Optimization Workflow

1. **Compress video**:
   ```bash
   ffmpeg -i input.mp4 -c:v libx264 -crf 28 -preset slow -c:a aac -b:a 128k output.mp4
   ```

2. **Create mobile version** (720p max):
   ```bash
   ffmpeg -i input.mp4 -vf scale=720:-2 -c:v libx264 -crf 28 output-mobile.mp4
   ```

3. **Generate poster image**:
   ```bash
   ffmpeg -i input.mp4 -ss 00:00:01 -vframes 1 poster.jpg
   ```

---

## 🎯 Performance Best Practices

### DO's ✅

1. **Use lazy loading** for all below-fold images and videos
2. **Set explicit dimensions** for images to prevent layout shift
3. **Optimize images** before uploading (< 200KB target)
4. **Use hardware-accelerated CSS** (`transform` over `top/left`)
5. **Minimize animations** on mobile devices
6. **Test on real devices** with throttled connections
7. **Use `loading="lazy"` attribute** on images
8. **Implement responsive images** with `srcset`
9. **Defer non-critical JavaScript**
10. **Use `content-visibility: auto`** for long pages

### DON'Ts ❌

1. **Don't** use heavy background videos on mobile
2. **Don't** autoplay videos without muting
3. **Don't** forget reduced motion preferences
4. **Don't** ignore touch target sizes (< 44px)
5. **Don't** use complex animations on low-end devices
6. **Don't** load all images eagerly
7. **Don't** use large uncompressed images
8. **Don't** animate expensive properties (width, height)
9. **Don't** forget to test on slow connections
10. **Don't** skip accessibility testing

---

## 🛠️ Troubleshooting

### Problem: Slow Page Load
**Solutions**:
- Check image sizes (compress if > 200KB)
- Ensure lazy loading is working
- Verify videos use `preload="none"`
- Check for render-blocking resources

### Problem: Janky Animations
**Solutions**:
- Use `transform` and `opacity` only
- Add `will-change` before animation starts
- Remove `will-change` after animation completes
- Test on low-end devices
- Simplify animations on mobile

### Problem: Layout Shifts
**Solutions**:
- Set explicit width/height on images
- Use aspect ratio boxes for responsive images
- Reserve space for dynamically loaded content
- Use `content-visibility` carefully

### Problem: Video Not Playing on iOS
**Solutions**:
- Add `playsInline` attribute
- Ensure video is muted for autoplay
- Use H.264 codec
- Test with .mp4 format (avoid .mov in production)

---

## 📚 Additional Resources

- [Web.dev Performance Guide](https://web.dev/performance/)
- [MDN: Lazy Loading](https://developer.mozilla.org/en-US/docs/Web/Performance/Lazy_loading)
- [Google: Optimize Images](https://developers.google.com/speed/docs/insights/OptimizeImages)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [Core Web Vitals](https://web.dev/vitals/)

---

## 📝 Summary

This website is optimized for:
- ✅ **Fast loading** on all devices and connections
- ✅ **Smooth animations** with GPU acceleration
- ✅ **Responsive design** from 320px to 4K displays
- ✅ **Accessibility** with reduced motion support
- ✅ **Mobile-first** with touch-friendly interactions
- ✅ **Progressive enhancement** for modern browsers
- ✅ **Adaptive content** based on device capabilities

**Result**: Seamless user experience across all devices without lag or layout issues.
