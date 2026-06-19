import { useState, useEffect } from 'react';

/**
 * Performance Hook - Detects device capabilities and user preferences
 * Returns performance settings to optimize animations and features
 */
export const usePerformance = () => {
    const [performanceSettings, setPerformanceSettings] = useState({
        isMobile: false,
        isLowEnd: false,
        prefersReducedMotion: false,
        connectionSpeed: 'unknown',
        shouldReduceAnimations: false,
    });

    useEffect(() => {
        // Detect mobile device
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || 
                        window.innerWidth <= 768;

        // Detect reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Detect low-end device (basic heuristics)
        const isLowEnd = (() => {
            // Check CPU cores
            const cores = navigator.hardwareConcurrency || 0;
            if (cores > 0 && cores <= 2) return true;

            // Check device memory (if available)
            if (navigator.deviceMemory && navigator.deviceMemory <= 2) return true;

            // Check for older mobile devices
            if (isMobile && window.devicePixelRatio && window.devicePixelRatio < 2) return true;

            return false;
        })();

        // Detect connection speed
        let connectionSpeed = 'unknown';
        if (navigator.connection) {
            const connection = navigator.connection;
            if (connection.effectiveType) {
                connectionSpeed = connection.effectiveType; // '4g', '3g', '2g', 'slow-2g'
            }
            if (connection.saveData) {
                connectionSpeed = 'slow'; // User has data saver on
            }
        }

        // Determine if animations should be reduced
        const shouldReduceAnimations = prefersReducedMotion || isLowEnd || 
                                       connectionSpeed === 'slow-2g' || 
                                       connectionSpeed === '2g' ||
                                       connectionSpeed === 'slow';

        setPerformanceSettings({
            isMobile,
            isLowEnd,
            prefersReducedMotion,
            connectionSpeed,
            shouldReduceAnimations,
        });

        // Listen for connection changes
        const handleConnectionChange = () => {
            if (navigator.connection) {
                const newSpeed = navigator.connection.effectiveType || 'unknown';
                setPerformanceSettings(prev => ({
                    ...prev,
                    connectionSpeed: newSpeed,
                    shouldReduceAnimations: prev.prefersReducedMotion || prev.isLowEnd || 
                                           newSpeed === 'slow-2g' || newSpeed === '2g',
                }));
            }
        };

        if (navigator.connection) {
            navigator.connection.addEventListener('change', handleConnectionChange);
        }

        return () => {
            if (navigator.connection) {
                navigator.connection.removeEventListener('change', handleConnectionChange);
            }
        };
    }, []);

    return performanceSettings;
};

/**
 * Get optimized animation variants based on performance settings
 */
export const getAnimationVariants = (shouldReduce) => {
    if (shouldReduce) {
        return {
            fadeIn: {
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { duration: 0.2 } },
            },
            slideUp: {
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { duration: 0.2 } },
            },
            scale: {
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { duration: 0.2 } },
            },
        };
    }

    return {
        fadeIn: {
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } },
        },
        slideUp: {
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
        },
        scale: {
            hidden: { opacity: 0, scale: 0.95 },
            visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
        },
    };
};

/**
 * Get video quality based on device capabilities
 */
export const getVideoQuality = (isMobile, connectionSpeed) => {
    if (connectionSpeed === 'slow-2g' || connectionSpeed === '2g') {
        return 'low';
    }
    if (isMobile || connectionSpeed === '3g') {
        return 'medium';
    }
    return 'high';
};

export default usePerformance;
