import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <HelmetProvider>
            <BrowserRouter>
                <AuthProvider>
                    <CartProvider>
                        <App />
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
