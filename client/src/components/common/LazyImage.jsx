import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './LazyImage.css';

/**
 * LazyImage Component - Performance optimized lazy loading with responsive images
 * Features:
 * - Intersection Observer for viewport detection
 * - Responsive srcset support
 * - Blur-up placeholder effect
 * - Progressive image loading
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
    ...props 
}) => {
    const [imageSrc, setImageSrc] = useState(priority ? src : placeholder);
    const [imageSrcSet, setImageSrcSet] = useState(priority && srcSet ? srcSet : null);
    const [imageRef, setImageRef] = useState();
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        // Skip lazy loading for priority images (above fold)
        if (priority) {
            setIsInView(true);
            setIsLoaded(true);
            return;
        }

        let observer;
        let didCancel = false;

        if (imageRef && imageSrc === placeholder) {
            if (IntersectionObserver) {
                observer = new IntersectionObserver(
                    entries => {
                        entries.forEach(entry => {
                            if (
                                !didCancel &&
                                (entry.intersectionRatio > 0 || entry.isIntersecting)
                            ) {
                                setIsInView(true);
                                setImageSrc(src);
                                if (srcSet) setImageSrcSet(srcSet);
                                observer.unobserve(imageRef);
                            }
                        });
                    },
                    {
                        threshold: 0.01,
                        rootMargin: '100px', // Load images 100px before viewport
                    }
                );
                observer.observe(imageRef);
            } else {
                // Old browsers fallback
                setIsInView(true);
                setImageSrc(src);
                if (srcSet) setImageSrcSet(srcSet);
            }
        }
        return () => {
            didCancel = true;
            if (observer && observer.unobserve && imageRef) {
                observer.unobserve(imageRef);
            }
        };
    }, [src, srcSet, imageSrc, imageRef, placeholder, priority]);

    const handleLoad = () => {
        setIsLoaded(true);
        if (onLoad) onLoad();
    };

    const handleError = () => {
        setHasError(true);
        // Fallback to placeholder on error
        setImageSrc(placeholder);
    };

    return (
        <img
            ref={setImageRef}
            src={imageSrc}
            srcSet={imageSrcSet}
            sizes={sizes}
            alt={alt}
            className={`lazy-image ${className} ${isLoaded ? 'lazy-image--loaded' : ''} ${isInView ? 'lazy-image--in-view' : ''} ${hasError ? 'lazy-image--error' : ''}`}
            onLoad={handleLoad}
            onError={handleError}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            {...props}
        />
    );
};

LazyImage.propTypes = {
    src: PropTypes.string.isRequired,
    alt: PropTypes.string.isRequired,
    className: PropTypes.string,
    placeholder: PropTypes.string,
    srcSet: PropTypes.string,
    sizes: PropTypes.string,
    onLoad: PropTypes.func,
    priority: PropTypes.bool,
};

export default LazyImage;
