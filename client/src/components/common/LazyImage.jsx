import { useState, useEffect, useRef } from 'react';
import './LazyImage.css';

const LazyImage = ({ 
    src, 
    alt, 
    className = '', 
    placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3C/svg%3E',
    ...props 
}) => {
    const [imageSrc, setImageSrc] = useState(placeholder);
    const [imageRef, setImageRef] = useState();
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
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
                                observer.unobserve(imageRef);
                            }
                        });
                    },
                    {
                        threshold: 0.01,
                        rootMargin: '75px',
                    }
                );
                observer.observe(imageRef);
            } else {
                // Old browsers fallback
                setImageSrc(src);
            }
        }
        return () => {
            didCancel = true;
            if (observer && observer.unobserve) {
                observer.unobserve(imageRef);
            }
        };
    }, [src, imageSrc, imageRef, placeholder]);

    const handleLoad = () => {
        setIsLoaded(true);
    };

    return (
        <img
            ref={setImageRef}
            src={imageSrc}
            alt={alt}
            className={`lazy-image ${className} ${isLoaded ? 'lazy-image--loaded' : ''} ${isInView ? 'lazy-image--in-view' : ''}`}
            onLoad={handleLoad}
            loading="lazy"
            {...props}
        />
    );
};

export default LazyImage;
