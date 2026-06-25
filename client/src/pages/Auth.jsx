import { useState } from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';
import { authAPI } from '../services/api';

// Google SVG icon
const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
);

// Facebook SVG icon
const FacebookIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
);

// API base URL — works both locally and on Render
const API_BASE = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
    : window.location.origin;

const handleOAuthLogin = (provider) => {
    const backendUrl = import.meta.env.VITE_API_URL
        ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
        : '';
    window.location.href = `${backendUrl}/api/auth/${provider}`;
};

const fadeSlide = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

// ═══════════════════════════════════════════════════════════
//  LOGIN PAGE
// ═══════════════════════════════════════════════════════════
const Login = () => {
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(form);
            toast.success('Welcome back!');
            navigate(from, { replace: true });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Helmet><title>Sign In | SwissGarden Perfumes</title></Helmet>
            <div className="auth-page">
                <motion.div className="auth-card" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <div className="auth-header">
                        <Link to="/" className="auth-logo">
                            <span className="logo-text">swissgarden</span>
                            <span className="logo-sub">PERFUMES</span>
                        </Link>
                        <h1 className="auth-title">Welcome Back</h1>
                        <p className="auth-subtitle">Sign in to your account</p>
                    </div>

                    <motion.form className="auth-form" onSubmit={handleEmailLogin} {...fadeSlide}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="login-email">Email Address</label>
                            <div className="auth-input-wrapper">
                                <FiMail size={16} className="auth-input-icon" />
                                <input id="login-email" type="email" className="form-input auth-input" placeholder="your@email.com" required autoComplete="email"
                                    value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="login-password">Password</label>
                            <div className="auth-input-wrapper">
                                <FiLock size={16} className="auth-input-icon" />
                                <input id="login-password" type={showPassword ? 'text' : 'password'} className="form-input auth-input" placeholder="Enter your password" required autoComplete="current-password"
                                    value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                                <button type="button" className="auth-toggle-password" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                </button>
                            </div>
                            <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                                <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--accent)', fontWeight: '600' }}>
                                    Forgot Password?
                                </Link>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary btn-lg auth-submit-btn" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>

                        <div className="auth-divider">
                            <span>or continue with</span>
                        </div>

                        <div className="auth-social-buttons">
                            <button
                                type="button"
                                className="auth-social-btn auth-social-google"
                                onClick={() => handleOAuthLogin('google')}
                            >
                                <GoogleIcon />
                                <span>Continue with Google</span>
                            </button>
                            <button
                                type="button"
                                className="auth-social-btn auth-social-facebook"
                                onClick={() => handleOAuthLogin('facebook')}
                            >
                                <FacebookIcon />
                                <span>Continue with Facebook</span>
                            </button>
                        </div>
                    </motion.form>

                    <div className="auth-footer">
                        <p>Don't have an account? <Link to="/register" className="auth-link">Create one</Link></p>
                    </div>
                </motion.div>
            </div>
        </>
    );
};

// ═══════════════════════════════════════════════════════════
//  REGISTER PAGE
// ═══════════════════════════════════════════════════════════
const Register = () => {
    const [form, setForm] = useState({
        firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            await register({
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                email: form.email.trim(),
                password: form.password,
            });
            toast.success('Account created successfully!');
            navigate('/');
        } catch (error) {
            const response = error.response?.data;
            const errorMessage =
                response?.errorMessage || response?.message ||
                (Array.isArray(response?.errors) ? response.errors[0]?.message : null) ||
                'Registration failed';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Helmet><title>Create Account | SwissGarden Perfumes</title></Helmet>
            <div className="auth-page">
                <motion.div className="auth-card" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <div className="auth-header">
                        <Link to="/" className="auth-logo">
                            <span className="logo-text">swissgarden</span>
                            <span className="logo-sub">PERFUMES</span>
                        </Link>
                        <h1 className="auth-title">Create Account</h1>
                        <p className="auth-subtitle">Join the SwissGarden experience</p>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        {/* Name */}
                        <div className="auth-name-row">
                            <div className="form-group">
                                <label className="form-label" htmlFor="reg-firstName">First Name *</label>
                                <input id="reg-firstName" type="text" className="form-input" placeholder="First name" required autoComplete="given-name"
                                    value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="reg-lastName">Last Name *</label>
                                <input id="reg-lastName" type="text" className="form-input" placeholder="Last name" required autoComplete="family-name"
                                    value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="form-group">
                            <label className="form-label" htmlFor="reg-email">Email Address *</label>
                            <div className="auth-input-wrapper">
                                <FiMail size={16} className="auth-input-icon" />
                                <input id="reg-email" type="email" className="form-input auth-input" placeholder="your@email.com" required autoComplete="email"
                                    value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="form-group">
                            <label className="form-label" htmlFor="reg-password">Password *</label>
                            <div className="auth-input-wrapper">
                                <FiLock size={16} className="auth-input-icon" />
                                <input id="reg-password" type={showPassword ? 'text' : 'password'} className="form-input auth-input"
                                    placeholder="Min 6 characters with a number" required minLength={6} autoComplete="new-password"
                                    value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                                <button type="button" className="auth-toggle-password" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                </button>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="reg-confirmPassword">Confirm Password *</label>
                            <input id="reg-confirmPassword" type="password" className="form-input" placeholder="Re-enter your password" required autoComplete="new-password"
                                value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
                        </div>

                        <button type="submit" className="btn btn-primary btn-lg auth-submit-btn" disabled={loading}>
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>

                        <div className="auth-divider">
                            <span>or continue with</span>
                        </div>

                        <div className="auth-social-buttons">
                            <button
                                type="button"
                                className="auth-social-btn auth-social-google"
                                onClick={() => handleOAuthLogin('google')}
                            >
                                <GoogleIcon />
                                <span>Continue with Google</span>
                            </button>
                            <button
                                type="button"
                                className="auth-social-btn auth-social-facebook"
                                onClick={() => handleOAuthLogin('facebook')}
                            >
                                <FacebookIcon />
                                <span>Continue with Facebook</span>
                            </button>
                        </div>
                    </form>

                    <div className="auth-footer">
                        <p>Already have an account? <Link to="/login" className="auth-link">Sign In</Link></p>
                    </div>
                </motion.div>
            </div>
        </>
    );
};

// ═══════════════════════════════════════════════════════════
//  FORGOT PASSWORD PAGE
// ═══════════════════════════════════════════════════════════
const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await authAPI.forgotPassword({ email: email.trim() });
            toast.success(data.message);
            setSent(true);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Helmet><title>Forgot Password | SwissGarden Perfumes</title></Helmet>
            <div className="auth-page">
                <motion.div className="auth-card" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <div className="auth-header">
                        <Link to="/" className="auth-logo">
                            <span className="logo-text">swissgarden</span>
                            <span className="logo-sub">PERFUMES</span>
                        </Link>
                        <h1 className="auth-title">Forgot Password?</h1>
                        <p className="auth-subtitle">
                            {sent 
                                ? 'Check your email for reset instructions'
                                : 'Enter your email to receive a password reset link'
                            }
                        </p>
                    </div>

                    {!sent ? (
                        <form className="auth-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label" htmlFor="forgot-email">Email Address</label>
                                <div className="auth-input-wrapper">
                                    <FiMail size={16} className="auth-input-icon" />
                                    <input
                                        id="forgot-email"
                                        type="email"
                                        className="form-input auth-input"
                                        placeholder="your@email.com"
                                        required
                                        autoComplete="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary btn-lg auth-submit-btn" disabled={loading}>
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </form>
                    ) : (
                        <div style={{ textAlign: 'center', padding: 'var(--space-xl) 0' }}>
                            <div style={{ 
                                fontSize: '3rem', 
                                marginBottom: 'var(--space-lg)',
                                filter: 'grayscale(100%)' 
                            }}>
                                ✉️
                            </div>
                            <p style={{ 
                                fontSize: '0.9rem', 
                                color: 'var(--text-secondary)', 
                                marginBottom: 'var(--space-lg)' 
                            }}>
                                We've sent a password reset link to <strong>{email}</strong>
                            </p>
                            <p style={{ 
                                fontSize: '0.85rem', 
                                color: 'var(--text-muted)' 
                            }}>
                                Didn't receive the email? Check your spam folder or{' '}
                                <button
                                    type="button"
                                    onClick={() => setSent(false)}
                                    style={{
                                        color: 'var(--accent)',
                                        fontWeight: '600',
                                        textDecoration: 'underline',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: 0,
                                    }}
                                >
                                    try again
                                </button>
                            </p>
                        </div>
                    )}

                    <div className="auth-footer">
                        <p>Remember your password? <Link to="/login" className="auth-link">Sign In</Link></p>
                    </div>
                </motion.div>
            </div>
        </>
    );
};

// ═══════════════════════════════════════════════════════════
//  RESET PASSWORD PAGE
// ═══════════════════════════════════════════════════════════
const ResetPassword = () => {
    const [form, setForm] = useState({ password: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { token } = useParams();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (form.password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        try {
            const { data } = await authAPI.resetPassword(token, { password: form.password });
            if (data.success) {
                // Store the token and user from response
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                toast.success('Password reset successful! Logging you in...');
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid or expired reset token');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Helmet><title>Reset Password | SwissGarden Perfumes</title></Helmet>
            <div className="auth-page">
                <motion.div className="auth-card" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <div className="auth-header">
                        <Link to="/" className="auth-logo">
                            <span className="logo-text">swissgarden</span>
                            <span className="logo-sub">PERFUMES</span>
                        </Link>
                        <h1 className="auth-title">Reset Password</h1>
                        <p className="auth-subtitle">Enter your new password</p>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="reset-password">New Password</label>
                            <div className="auth-input-wrapper">
                                <FiLock size={16} className="auth-input-icon" />
                                <input
                                    id="reset-password"
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-input auth-input"
                                    placeholder="Min 6 characters"
                                    required
                                    minLength={6}
                                    autoComplete="new-password"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                />
                                <button type="button" className="auth-toggle-password" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                </button>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="reset-confirm">Confirm Password</label>
                            <div className="auth-input-wrapper">
                                <FiLock size={16} className="auth-input-icon" />
                                <input
                                    id="reset-confirm"
                                    type="password"
                                    className="form-input auth-input"
                                    placeholder="Re-enter your password"
                                    required
                                    autoComplete="new-password"
                                    value={form.confirmPassword}
                                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary btn-lg auth-submit-btn" disabled={loading}>
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>Remember your password? <Link to="/login" className="auth-link">Sign In</Link></p>
                    </div>
                </motion.div>
            </div>
        </>
    );
};

export { Login, Register, ForgotPassword, ResetPassword };
