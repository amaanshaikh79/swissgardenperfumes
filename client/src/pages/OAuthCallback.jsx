import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const OAuthCallback = () => {
    const navigate = useNavigate();
    const { loginWithToken } = useAuth();
    const [status, setStatus] = useState('loading'); // loading | success | error
    const [message, setMessage] = useState('Completing sign in...');

    useEffect(() => {
        const handleCallback = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            const error = urlParams.get('error');

            // Clean URL params immediately to prevent re-processing
            window.history.replaceState({}, document.title, window.location.pathname);

            if (error || !code) {
                setStatus('error');
                setMessage('Sign in was cancelled or failed. Redirecting...');
                toast.error('Social login failed. Please try again.');
                setTimeout(() => navigate('/login'), 2500);
                return;
            }

            try {
                // Trade the one-time code for the JWT (the raw token is never put
                // in the redirect URL). Then sync auth state via loginWithToken.
                const apiBase = import.meta.env.VITE_API_URL || '/api';
                const exchangeRes = await fetch(`${apiBase}/auth/oauth/exchange`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code }),
                });
                const exchangeData = await exchangeRes.json().catch(() => ({}));
                if (!exchangeRes.ok || !exchangeData.token) {
                    throw new Error('Code exchange failed');
                }

                // Use AuthContext's loginWithToken to properly sync state
                const user = await loginWithToken(exchangeData.token);

                if (user) {
                    setStatus('success');
                    setMessage(`Welcome, ${user.firstName}! 🎉`);
                    toast.success(`Welcome back, ${user.firstName}!`);
                    setTimeout(() => navigate('/'), 1500);
                } else {
                    throw new Error('Failed to fetch user profile');
                }
            } catch (err) {
                console.error('OAuth callback error:', err);
                setStatus('error');
                setMessage('Something went wrong. Redirecting...');
                toast.error('Login failed. Please try again.');
                setTimeout(() => navigate('/login'), 2500);
            }
        };

        handleCallback();
    }, [navigate, loginWithToken]);

    return (
        <div className="oauth-callback-page">
            <Helmet>
                <title>Signing In | SwissGarden Perfumes</title>
                <meta name="robots" content="noindex,nofollow" />
            </Helmet>
            <h1 style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 }}>Completing sign in</h1>
            <motion.div
                className="oauth-callback-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
            >
                {/* Logo */}
                <div className="oauth-callback-logo">
                    <span className="logo-text">swissgarden</span>
                    <span className="logo-sub">PERFUMES</span>
                </div>

                {status === 'loading' && (
                    <>
                        <div className="oauth-spinner-ring">
                            <div className="oauth-spinner-inner" />
                        </div>
                        <p className="oauth-callback-msg">{message}</p>
                        <p className="oauth-callback-sub">Please wait a moment...</p>
                    </>
                )}

                {status === 'success' && (
                    <motion.div
                        className="oauth-success-state"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="oauth-success-icon">✓</div>
                        <p className="oauth-callback-msg">{message}</p>
                        <p className="oauth-callback-sub">Taking you home...</p>
                    </motion.div>
                )}

                {status === 'error' && (
                    <motion.div
                        className="oauth-error-state"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="oauth-error-icon">✕</div>
                        <p className="oauth-callback-msg">{message}</p>
                    </motion.div>
                )}
            </motion.div>

            <style>{`
                .oauth-callback-page {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--gradient-hero);
                    padding: 2rem;
                }
                .oauth-callback-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: 24px;
                    padding: 3rem 2.5rem;
                    text-align: center;
                    max-width: 380px;
                    width: 100%;
                    box-shadow: 0 25px 60px -10px rgba(0,0,0,0.5);
                }
                .oauth-callback-logo {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    margin-bottom: 2.5rem;
                }
                .oauth-spinner-ring {
                    width: 64px;
                    height: 64px;
                    border-radius: 50%;
                    border: 3px solid var(--border-color);
                    border-top-color: var(--accent);
                    animation: oauth-spin 0.9s linear infinite;
                    margin: 0 auto 1.5rem;
                }
                @keyframes oauth-spin {
                    to { transform: rotate(360deg); }
                }
                .oauth-callback-msg {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 0.5rem;
                }
                .oauth-callback-sub {
                    font-size: 0.85rem;
                    color: var(--text-muted);
                }
                .oauth-success-icon {
                    width: 64px;
                    height: 64px;
                    border-radius: 50%;
                    background: #22c55e;
                    color: white;
                    font-size: 1.8rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1.5rem;
                }
                .oauth-error-icon {
                    width: 64px;
                    height: 64px;
                    border-radius: 50%;
                    background: #ef4444;
                    color: white;
                    font-size: 1.8rem;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1.5rem;
                }
            `}</style>
        </div>
    );
};

export default OAuthCallback;
