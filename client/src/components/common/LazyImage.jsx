import { useState, useEffect, useRef } from 'react';
import './LazyImage.css';

/**
 * LazyImage Component - Ultra-optimized with thumbnail-first loading
 * Features:
 * - Shows 1/10 size thumbnail immediately (98% smaller)
 * - Lazy loads full-size image when in viewport
 * - WebP auto-resolution with JPG fallback
 * - CLS prevention with optional width/height attributes
 * - fetchpriority support for critical above-the-fold images
 */
const LazyImage = ({ 
    src, 
    alt, 
    className = '', 
    placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3C/svg%3E',
    srcSet = null,
    sizes = null,
    onLoad = null,
    priority = false,
    useThumbnail = true, // New: Enable thumbnail-first loading
    width,
    height,
    ...props 
}) => {
    // Generate thumbnail path by injecting /thumbs/ before filename
    const getThumbnailSrc = (originalSrc) => {
        if (!originalSrc || typeof originalSrc !== 'string') return null;
        const parts = originalSrc.split('/');
        const filename = parts.pop();
        const basePath = parts.join('/');
        return `${basePath}/thumbs/${filename}`;
    };

    // Resolve optimized WebP path if the src points to Images directory
    const isJpg = typeof src === 'string' && src.startsWith('/Images/') && /\.(jpe?g|png)$/i.test(src);
    const webpSrc = isJpg ? src.replace(/\.(jpe?g|png)$/i, '.webp') : null;
    
    const thumbnailSrc = useThumbnail ? getThumbnailSrc(src) : null;
    const thumbnailWebpSrc = useThumbnail && webpSrc ? getThumbnailSrc(webpSrc) : null;

    const [imageSrc, setImageSrc] = useState(priority ? src : (thumbnailSrc || placeholder));
    const [imageSrcSet, setImageSrcSet] = useState(priority && srcSet ? srcSet : null);
    const [webpSrcCurrent, setWebpSrcCurrent] = useState(
        priority && webpSrc ? webpSrc : thumbnailWebpSrc
    );
    const [imageRef, setImageRef] = useState();
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const [isFullSizeLoaded, setIsFullSizeLoaded] = useState(priority);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        // Skip lazy loading for priority images (above fold)
        if (priority) {
            setIsInView(true);
            setIsLoaded(true);
            setIsFullSizeLoaded(true);
            return;
        }

        let observer;
        let didCancel = false;

        if (imageRef && !isFullSizeLoaded) {
            if (window.IntersectionObserver) {
                observer = new IntersectionObserver(
                    entries => {
                        entries.forEach(entry => {
                            if (
                                !didCancel &&
                                (entry.intersectionRatio > 0 || entry.isIntersecting)
                            ) {
                                setIsInView(true);
                                // Load full-size image
                                setImageSrc(src);
                                if (srcSet) setImageSrcSet(srcSet);
                                if (webpSrc) setWebpSrcCurrent(webpSrc);
                                setIsFullSizeLoaded(true);
                                observer.unobserve(imageRef);
                            }
                        });
                    },
                    {
                        threshold: 0.01,
                        rootMargin: '100px', // Load full-size images 100px before viewport
                    }
                );
                observer.observe(imageRef);
            } else {
                // Old browsers fallback
                setIsInView(true);
                setImageSrc(src);
                if (srcSet) setImageSrcSet(srcSet);
                if (webpSrc) setWebpSrcCurrent(webpSrc);
                setIsFullSizeLoaded(true);
            }
        }
        return () => {
            didCancel = true;
            if (observer && observer.unobserve && imageRef) {
                observer.unobserve(imageRef);
            }
        };
    }, [src, srcSet, webpSrc, imageRef, priority, isFullSizeLoaded]);

    const handleLoad = () => {
        setIsLoaded(true);
        if (onLoad) onLoad();
    };

    const handleError = () => {
        setHasError(true);
        // Fallback to original src or placeholder
        if (useThumbnail && imageSrc === thumbnailSrc) {
            // If thumbnail fails, try full size
            setImageSrc(src);
            if (webpSrc) setWebpSrcCurrent(webpSrc);
        } else if (imageSrc !== src) {
            setImageSrc(src);
        } else {
            setImageSrc(placeholder);
        }
    };

    return (
        <picture style={{ display: 'contents' }}>
            {webpSrcCurrent && (
                <source
                    srcSet={webpSrcCurrent}
                    type="image/webp"
                />
            )}
            {srcSet && (
                <source
                    srcSet={imageSrcSet || placeholder}
                />
            )}
            <img
                ref={setImageRef}
                src={imageSrc}
                sizes={sizes}
                alt={alt}
                width={width}
                height={height}
                className={`lazy-image ${className} ${isLoaded ? 'lazy-image--loaded' : ''} ${isInView ? 'lazy-image--in-view' : ''} ${isFullSizeLoaded ? 'lazy-image--full' : 'lazy-image--thumb'} ${hasError ? 'lazy-image--error' : ''}`}
                onLoad={handleLoad}
                onError={handleError}
                loading={priority ? 'eager' : 'lazy'}
                fetchpriority={priority ? 'high' : 'auto'}
                decoding="async"
                {...props}
            />
        </picture>
    );
};

export default LazyImage;
