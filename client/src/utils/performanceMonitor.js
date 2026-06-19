/**
 * Performance Monitoring Utility
 * Tracks Core Web Vitals and performance metrics
 */

// Check if Performance API is available
const supportsPerformanceAPI = typeof window !== 'undefined' && 
                               'performance' in window && 
                               'PerformanceObserver' in window;

/**
 * Measure First Contentful Paint (FCP)
 */
export const measureFCP = (callback) => {
    if (!supportsPerformanceAPI) return;

    const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
                callback({
                    name: 'FCP',
                    value: entry.startTime,
                    rating: entry.startTime < 1800 ? 'good' : entry.startTime < 3000 ? 'needs-improvement' : 'poor'
                });
                observer.disconnect();
            }
        }
    });

    observer.observe({ entryTypes: ['paint'] });
};

/**
 * Measure Largest Contentful Paint (LCP)
 */
export const measureLCP = (callback) => {
    if (!supportsPerformanceAPI) return;

    const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        callback({
            name: 'LCP',
            value: lastEntry.startTime,
            rating: lastEntry.startTime < 2500 ? 'good' : lastEntry.startTime < 4000 ? 'needs-improvement' : 'poor',
            element: lastEntry.element
        });
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });
};

/**
 * Measure First Input Delay (FID)
 */
export const measureFID = (callback) => {
    if (!supportsPerformanceAPI) return;

    const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            callback({
                name: 'FID',
                value: entry.processingStart - entry.startTime,
                rating: entry.processingStart - entry.startTime < 100 ? 'good' : 
                       entry.processingStart - entry.startTime < 300 ? 'needs-improvement' : 'poor'
            });
        }
    });

    observer.observe({ entryTypes: ['first-input'] });
};

/**
 * Measure Cumulative Layout Shift (CLS)
 */
export const measureCLS = (callback) => {
    if (!supportsPerformanceAPI) return;

    let clsValue = 0;
    let clsEntries = [];

    const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
                clsValue += entry.value;
                clsEntries.push(entry);
            }
        }
        
        callback({
            name: 'CLS',
            value: clsValue,
            rating: clsValue < 0.1 ? 'good' : clsValue < 0.25 ? 'needs-improvement' : 'poor',
            entries: clsEntries
        });
    });

    observer.observe({ entryTypes: ['layout-shift'] });
};

/**
 * Measure Time to First Byte (TTFB)
 */
export const measureTTFB = (callback) => {
    if (!supportsPerformanceAPI) return;

    const navigationEntry = performance.getEntriesByType('navigation')[0];
    if (navigationEntry) {
        const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
        callback({
            name: 'TTFB',
            value: ttfb,
            rating: ttfb < 800 ? 'good' : ttfb < 1800 ? 'needs-improvement' : 'poor'
        });
    }
};

/**
 * Get Performance Summary
 */
export const getPerformanceSummary = () => {
    if (!supportsPerformanceAPI) return null;

    const navigation = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');

    return {
        // Navigation Timing
        dns: navigation?.domainLookupEnd - navigation?.domainLookupStart,
        tcp: navigation?.connectEnd - navigation?.connectStart,
        ttfb: navigation?.responseStart - navigation?.requestStart,
        download: navigation?.responseEnd - navigation?.responseStart,
        domInteractive: navigation?.domInteractive,
        domComplete: navigation?.domComplete,
        loadComplete: navigation?.loadEventEnd,
        
        // Paint Timing
        firstPaint: paint.find(entry => entry.name === 'first-paint')?.startTime,
        firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime,
        
        // Resource Timing
        resources: performance.getEntriesByType('resource').length,
        
        // Memory (if available)
        memory: performance.memory ? {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            limit: performance.memory.jsHeapSizeLimit
        } : null
    };
};

/**
 * Log Performance Metrics to Console (Development Only)
 */
export const logPerformanceMetrics = () => {
    if (process.env.NODE_ENV !== 'development') return;

    console.group('🚀 Performance Metrics');
    
    measureFCP((metric) => {
        console.log(`✅ ${metric.name}: ${metric.value.toFixed(2)}ms (${metric.rating})`);
    });
    
    measureLCP((metric) => {
        console.log(`✅ ${metric.name}: ${metric.value.toFixed(2)}ms (${metric.rating})`);
    });
    
    measureFID((metric) => {
        console.log(`✅ ${metric.name}: ${metric.value.toFixed(2)}ms (${metric.rating})`);
    });
    
    measureCLS((metric) => {
        console.log(`✅ ${metric.name}: ${metric.value.toFixed(4)} (${metric.rating})`);
    });
    
    measureTTFB((metric) => {
        console.log(`✅ ${metric.name}: ${metric.value.toFixed(2)}ms (${metric.rating})`);
    });
    
    setTimeout(() => {
        const summary = getPerformanceSummary();
        if (summary) {
            console.table({
                'DNS Lookup': `${summary.dns?.toFixed(2)}ms`,
                'TCP Connection': `${summary.tcp?.toFixed(2)}ms`,
                'TTFB': `${summary.ttfb?.toFixed(2)}ms`,
                'Download': `${summary.download?.toFixed(2)}ms`,
                'DOM Interactive': `${summary.domInteractive?.toFixed(2)}ms`,
                'DOM Complete': `${summary.domComplete?.toFixed(2)}ms`,
                'Load Complete': `${summary.loadComplete?.toFixed(2)}ms`,
                'First Paint': `${summary.firstPaint?.toFixed(2)}ms`,
                'FCP': `${summary.firstContentfulPaint?.toFixed(2)}ms`,
                'Total Resources': summary.resources
            });
            
            if (summary.memory) {
                console.log('💾 Memory Usage:', {
                    used: `${(summary.memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
                    total: `${(summary.memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
                    limit: `${(summary.memory.limit / 1048576).toFixed(2)} MB`
                });
            }
        }
        console.groupEnd();
    }, 3000);
};

/**
 * Monitor Long Tasks (> 50ms)
 */
export const monitorLongTasks = (callback) => {
    if (!supportsPerformanceAPI) return;

    try {
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.duration > 50) {
                    callback({
                        name: 'Long Task',
                        duration: entry.duration,
                        startTime: entry.startTime
                    });
                }
            }
        });

        observer.observe({ entryTypes: ['longtask'] });
    } catch (e) {
        // PerformanceObserver for longtask may not be supported
        console.warn('Long task monitoring not supported');
    }
};

/**
 * Track Page Visibility Changes
 */
export const trackVisibilityChange = (callback) => {
    if (typeof document === 'undefined') return;

    document.addEventListener('visibilitychange', () => {
        callback({
            visible: !document.hidden,
            timestamp: Date.now()
        });
    });
};

/**
 * Initialize Performance Monitoring (Development Mode)
 */
export const initPerformanceMonitoring = () => {
    if (process.env.NODE_ENV === 'development') {
        logPerformanceMetrics();
        
        monitorLongTasks((task) => {
            console.warn(`⚠️ Long Task Detected: ${task.duration.toFixed(2)}ms at ${task.startTime.toFixed(2)}ms`);
        });
    }
};

export default {
    measureFCP,
    measureLCP,
    measureFID,
    measureCLS,
    measureTTFB,
    getPerformanceSummary,
    logPerformanceMetrics,
    monitorLongTasks,
    trackVisibilityChange,
    initPerformanceMonitoring
};
