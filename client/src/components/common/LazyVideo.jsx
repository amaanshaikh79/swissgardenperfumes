import { useEffect, useRef, useState } from 'react';

/**
 * LazyVideo Component - Loads video only when in viewport and manages execution
 * Optimizes performance by:
 * - Deferring video loading until it's near the viewport
 * - Pausing video when it leaves the viewport (reduces CPU & battery usage)
 * - Auto-resolving original JPG posters to compressed WebP posters
 * - Connection-aware loading (data-saver mode for slow 2G/3G or saveData networks)
 * - Explicit memory cleanup on unmount (prevents page leaks)
 */
const LazyVideo = ({ 
    src, 
    poster = '', 
    className = '', 
    autoPlay = true, 
    loop = true, 
    muted = true,
    playsInline = true,
    controls = false,
    preload = 'none',
    onLoad = null,
    mobileSrc = null,
    ...props 
}) => {
    const videoRef = useRef(null);
    const [isInView, setIsInView] = useState(false);
    const [isIntersecting, setIsIntersecting] = useState(false);
    const [videoLoaded, setVideoLoaded] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isDataSaver, setIsDataSaver] = useState(false);

    // Auto-resolve poster to WebP if it's a JPG in /Images/
    const isJpgPoster = typeof poster === 'string' && poster.startsWith('/Images/') && /\.(jpe?g|png)$/i.test(poster);
    const optimizedPoster = isJpgPoster ? poster.replace('/Images/', '/Images-compressed/').replace(/\.(jpe?g|png)$/i, '.webp') : poster;

    // Detect mobile device
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Detect slow connection / data saver mode
    useEffect(() => {
        if ('connection' in navigator) {
            const conn = navigator.connection;
            if (conn.saveData || /\b(2g|3g)\b/.test(conn.effectiveType || '')) {
                setIsDataSaver(true);
            }
        }
    }, []);

    // Intersection Observer for loading AND play/pause control
    useEffect(() => {
        const videoElement = videoRef.current;
        if (!videoElement) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    setIsIntersecting(entry.isIntersecting);
                    if (entry.isIntersecting) {
                        setIsInView(true);
                    }
                });
            },
            {
                rootMargin: '150px', // Load 150px before entering viewport
                threshold: 0.01,
            }
        );

        observer.observe(videoElement);

        return () => {
            if (videoElement) {
                observer.unobserve(videoElement);
            }
        };
    }, []);

    // Load video source when it enters view
    useEffect(() => {
        const videoElement = videoRef.current;
        if (!videoElement || !isInView || videoLoaded) return;

        // Skip auto-loading in data-saver mode if it's supposed to autoplay (save user bandwidth)
        if (isDataSaver && autoPlay && !controls) {
            return;
        }

        const handleLoadedData = () => {
            setVideoLoaded(true);
            if (onLoad) onLoad();
        };

        videoElement.addEventListener('loadeddata', handleLoadedData);

        const videoSrc = isMobile && mobileSrc ? mobileSrc : src;
        videoElement.src = videoSrc;
        videoElement.load();

        return () => {
            if (videoElement) {
                videoElement.removeEventListener('loadeddata', handleLoadedData);
            }
        };
    }, [isInView, src, mobileSrc, isMobile, videoLoaded, onLoad, isDataSaver, autoPlay, controls]);

    // Control play/pause dynamically based on viewport intersection
    useEffect(() => {
        const videoElement = videoRef.current;
        if (!videoElement || !videoLoaded) return;

        if (isIntersecting) {
            if (autoPlay) {
                videoElement.play().catch((err) => {
                    console.log('LazyVideo autoplay blocked or interrupted:', err.message);
                });
            }
        } else {
            if (!videoElement.paused) {
                videoElement.pause();
            }
        }
    }, [isIntersecting, videoLoaded, autoPlay]);

    // Memory cleanup on unmount
    useEffect(() => {
        const videoElement = videoRef.current;
        return () => {
            if (videoElement) {
                try {
                    videoElement.pause();
                    videoElement.src = '';
                    videoElement.load();
                } catch (e) {
                    console.warn('Error during video element cleanup:', e);
                }
            }
        };
    }, []);

    return (
        <video
            ref={videoRef}
            className={className}
            autoPlay={autoPlay && !isDataSaver}
            loop={loop}
            muted={muted}
            playsInline={playsInline}
            controls={controls || isDataSaver} // Force controls in data-saver so user can choose to play
            preload={preload}
            poster={optimizedPoster}
            {...props}
        />
    );
};

export default LazyVideo;
