import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import App from './App';
import ErrorBoundary from './components/common/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { initPerformanceMonitoring } from './utils/performanceMonitor';
import './styles/index.css';

// Initialize performance monitoring in development
if (import.meta.env.DEV) {
    initPerformanceMonitoring();
}

// Global safety net for uncaught async errors and runtime errors.
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled rejection:', e.reason);
});
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error || e.message);
});

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <HelmetProvider>
            <BrowserRouter>
                <AuthProvider>
                    <CartProvider>
                        <ErrorBoundary>
                            <App />
                        </ErrorBoundary>
                        <Toaster
                            position="top-center"
                            toastOptions={{
                                duration: 2500,
                                style: {
                                    background: '#111111',
                                    color: '#fff',
                                    borderRadius: '8px',
                                    fontSize: '0.85rem',
                                    fontWeight: '500',
                                    padding: '12px 20px',
                                },
                                success: {
                                    iconTheme: { primary: '#22C55E', secondary: '#111' },
                                },
                                error: {
                                    iconTheme: { primary: '#EF4444', secondary: '#111' },
                                },
                            }}
                        />
                    </CartProvider>
                </AuthProvider>
            </BrowserRouter>
        </HelmetProvider>
    </React.StrictMode>
);
