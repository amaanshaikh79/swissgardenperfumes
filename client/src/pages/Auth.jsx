import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Auth.css';

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
            <Helmet><title>Sign In | GoldBerg Perfumes</title></Helmet>
            <div className="auth-page">
                <motion.div className="auth-card" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <div className="auth-header">
                        <Link to="/" className="auth-logo">
                            <span className="logo-text">GOLDBERG</span>
                            <span className="logo-sub">PERFUMES</span>
                        </Link>
                        <h1 className="auth-title">Welcome Back</h1>
                        <p className="auth-subtitle">Sign in to your account</p>
                    </div>

                    <motion.form className="auth-form" onSubmit={handleEmailLogin} {...fadeSlide}>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <div className="auth-input-wrapper">
                                <FiMail size={16} className="auth-input-icon" />
                                <input type="email" className="form-input auth-input" placeholder="your@email.com" required autoComplete="email"
                                    value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div className="auth-input-wrapper">
                                <FiLock size={16} className="auth-input-icon" />
                                <input type={showPassword ? 'text' : 'password'} className="form-input auth-input" placeholder="Enter your password" required autoComplete="current-password"
                                    value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                                <button type="button" className="auth-toggle-password" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                </button>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary btn-lg auth-submit-btn" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
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
                firstName: form.firstName,
                lastName: form.lastName,
                email: form.email,
                password: form.password,
            });
            toast.success('Account created successfully!');
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Helmet><title>Create Account | GoldBerg Perfumes</title></Helmet>
            <div className="auth-page">
                <motion.div className="auth-card" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <div className="auth-header">
                        <Link to="/" className="auth-logo">
                            <span className="logo-text">GOLDBERG</span>
                            <span className="logo-sub">PERFUMES</span>
                        </Link>
                        <h1 className="auth-title">Create Account</h1>
                        <p className="auth-subtitle">Join the GoldBerg experience</p>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        {/* Name */}
                        <div className="auth-name-row">
                            <div className="form-group">
                                <label className="form-label">First Name *</label>
                                <input type="text" className="form-input" placeholder="First name" required autoComplete="given-name"
                                    value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Last Name *</label>
                                <input type="text" className="form-input" placeholder="Last name" required autoComplete="family-name"
                                    value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="form-group">
                            <label className="form-label">Email Address *</label>
                            <div className="auth-input-wrapper">
                                <FiMail size={16} className="auth-input-icon" />
                                <input type="email" className="form-input auth-input" placeholder="your@email.com" required autoComplete="email"
                                    value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="form-group">
                            <label className="form-label">Password *</label>
                            <div className="auth-input-wrapper">
                                <FiLock size={16} className="auth-input-icon" />
                                <input type={showPassword ? 'text' : 'password'} className="form-input auth-input"
                                    placeholder="Min 6 characters with a number" required minLength={6} autoComplete="new-password"
                                    value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                                <button type="button" className="auth-toggle-password" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                </button>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Confirm Password *</label>
                            <input type="password" className="form-input" placeholder="Re-enter your password" required autoComplete="new-password"
                                value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
                        </div>

                        <button type="submit" className="btn btn-primary btn-lg auth-submit-btn" disabled={loading}>
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>Already have an account? <Link to="/login" className="auth-link">Sign In</Link></p>
                    </div>
                </motion.div>
            </div>
        </>
    );
};

export { Login, Register };
