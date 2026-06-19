import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

/**
 * LazyVideo Component - Loads video only when in viewport
 * Optimizes performance by deferring video loading until needed
 * Includes mobile detection for lighter video quality
 */
const LazyVideo = ({ 
    src, 
    poster, 
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
    const [videoLoaded, setVideoLoaded] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile device
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768 || /iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const videoElement = videoRef.current;
        if (!videoElement) return;

        // Intersection Observer for lazy loading
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !isInView) {
                        setIsInView(true);
                    }
                });
            },
            {
                rootMargin: '100px', // Load 100px before entering viewport
                threshold: 0.01,
            }
        );

        observer.observe(videoElement);

        return () => {
            if (videoElement) {
                observer.unobserve(videoElement);
            }
        };
    }, [isInView]);

    // Load video when in view
    useEffect(() => {
        const videoElement = videoRef.current;
        if (!videoElement || !isInView || videoLoaded) return;

        const handleLoadedData = () => {
            setVideoLoaded(true);
            if (onLoad) onLoad();
        };

        videoElement.addEventListener('loadeddata', handleLoadedData);

        // Set video source based on device
        const videoSrc = isMobile && mobileSrc ? mobileSrc : src;
        videoElement.src = videoSrc;
        videoElement.load();

        return () => {
            videoElement.removeEventListener('loadeddata', handleLoadedData);
        };
    }, [isInView, src, mobileSrc, isMobile, videoLoaded, onLoad]);

    return (
        <video
            ref={videoRef}
            className={className}
            autoPlay={autoPlay}
            loop={loop}
            muted={muted}
            playsInline={playsInline}
            controls={controls}
            preload={preload}
            poster={poster}
            {...props}
        />
    );
};

LazyVideo.propTypes = {
    src: PropTypes.string.isRequired,
    poster: PropTypes.string,
    className: PropTypes.string,
    autoPlay: PropTypes.bool,
    loop: PropTypes.bool,
    muted: PropTypes.bool,
    playsInline: PropTypes.bool,
    controls: PropTypes.bool,
    preload: PropTypes.string,
    onLoad: PropTypes.func,
    mobileSrc: PropTypes.string,
};

export default LazyVideo;
