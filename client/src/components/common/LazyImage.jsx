import { useState, useEffect } from 'react';
import './LazyImage.css';

/**
 * LazyImage Component - Ultra-optimized with thumbnail-first loading
 * Features:
 * - Shows 1/10 size thumbnail immediately (98% smaller)
 * - Lazy loads full-size image when in viewport
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
    useThumbnail = true, // Enable thumbnail-first loading
    width,
    height,
    ...props 
}) => {
    // Normalize src to ensure spaces are properly URL-encoded
    const normalizeSrc = (s) => {
        if (!s || typeof s !== 'string') return s;
        return s.replace(/ /g, '%20');
    };

    // Generate thumbnail path: /Images/photo.webp -> /Images/thumbs/photo.webp
    const getThumbnailSrc = (originalSrc) => {
        if (!originalSrc || typeof originalSrc !== 'string') return null;
        const normalized = normalizeSrc(originalSrc);
        const lastSlashIndex = normalized.lastIndexOf('/');
        if (lastSlashIndex === -1) return null;
        const basePath = normalized.substring(0, lastSlashIndex);
        const filename = normalized.substring(lastSlashIndex + 1);
        return `${basePath}/thumbs/${filename}`;
    };

    // Normalize src to handle spaces properly
    const normalizedSrc = normalizeSrc(src);

    // Determine what to show initially
    const thumbnailSrc = useThumbnail && !priority ? getThumbnailSrc(normalizedSrc) : null;
    const initialSrc = priority ? normalizedSrc : (thumbnailSrc || placeholder);

    const [imageSrc, setImageSrc] = useState(initialSrc);
    const [imageSrcSet, setImageSrcSet] = useState(priority && srcSet ? srcSet : null);
    const [imageRef, setImageRef] = useState();
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const [isFullSizeLoaded, setIsFullSizeLoaded] = useState(priority);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        // Skip lazy loading for priority images
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
                            if (!didCancel && (entry.intersectionRatio > 0 || entry.isIntersecting)) {
                                setIsInView(true);
                                // Load full-size image
                                setImageSrc(normalizedSrc);
                                if (srcSet) setImageSrcSet(srcSet);
                                setIsFullSizeLoaded(true);
                                observer.unobserve(imageRef);
                            }
                        });
                    },
                    {
                        threshold: 0.01,
                        rootMargin: '100px',
                    }
                );
                observer.observe(imageRef);
            } else {
                // Old browsers fallback
                setIsInView(true);
                setImageSrc(normalizedSrc);
                if (srcSet) setImageSrcSet(srcSet);
                setIsFullSizeLoaded(true);
            }
        }
        return () => {
            didCancel = true;
            if (observer && observer.unobserve && imageRef) {
                observer.unobserve(imageRef);
            }
        };
    }, [normalizedSrc, srcSet, imageRef, priority, isFullSizeLoaded]);

    const handleLoad = () => {
        setIsLoaded(true);
        if (onLoad) onLoad();
    };

    const handleError = () => {
        setHasError(true);
        // Fallback strategy: if thumbnail fails, load full-size immediately
        if (useThumbnail && imageSrc === thumbnailSrc && normalizedSrc !== thumbnailSrc) {
            setImageSrc(normalizedSrc);
            setIsFullSizeLoaded(true);
        } else if (imageSrc !== placeholder && imageSrc !== normalizedSrc) {
            // Try the original src
            setImageSrc(normalizedSrc);
        } else {
            // Last resort: use placeholder
            setImageSrc(placeholder);
        }
    };

    return (
        <img
            ref={setImageRef}
            src={imageSrc}
            srcSet={imageSrcSet}
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
    );
};

export default LazyImage;
