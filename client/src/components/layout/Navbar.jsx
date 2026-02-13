import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingBag, FiHeart, FiUser, FiMenu, FiX, FiSun, FiMoon, FiSearch, FiLogOut, FiGrid } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import './Navbar.css';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const { cartCount, setIsCartOpen } = useCart();
    const { isDark, toggleTheme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setMobileOpen(false);
        setSearchOpen(false);
    }, [location]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
            setSearchOpen(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const navLinks = [
        { to: '/', label: 'Home' },
        { to: '/shop', label: 'Shop' },
        { to: '/about', label: 'About' },
        { to: '/contact', label: 'Contact' },
    ];

    return (
        <>
            <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
                <div className="navbar-container">
                    {/* Mobile Menu Toggle */}
                    <button className="navbar-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
                        {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
                    </button>

                    {/* Logo */}
                    <Link to="/" className="navbar-logo">
                        <span className="logo-text">GOLDBERG</span>
                        <span className="logo-sub">PERFUMES</span>
                    </Link>

                    {/* Desktop Nav Links */}
                    <div className="navbar-links">
                        {navLinks.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`navbar-link ${location.pathname === link.to ? 'active' : ''}`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="navbar-actions">
                        <button className="navbar-action-btn" onClick={() => setSearchOpen(!searchOpen)} aria-label="Search">
                            <FiSearch size={18} />
                        </button>

                        <button className="navbar-action-btn" onClick={toggleTheme} aria-label="Toggle theme">
                            {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
                        </button>

                        {isAuthenticated && (
                            <Link to="/wishlist" className="navbar-action-btn" aria-label="Wishlist">
                                <FiHeart size={18} />
                            </Link>
                        )}

                        <button className="navbar-action-btn cart-btn" onClick={() => setIsCartOpen(true)} aria-label="Cart">
                            <FiShoppingBag size={18} />
                            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                        </button>

                        {isAuthenticated ? (
                            <div className="navbar-user-menu">
                                <button className="navbar-action-btn user-btn">
                                    <FiUser size={18} />
                                </button>
                                <div className="user-dropdown">
                                    <div className="user-dropdown-header">
                                        <span className="user-dropdown-name">{user?.firstName}</span>
                                        <span className="user-dropdown-email">{user?.email}</span>
                                    </div>
                                    <div className="user-dropdown-divider" />
                                    <Link to="/profile" className="user-dropdown-item">
                                        <FiUser size={14} /> My Profile
                                    </Link>
                                    <Link to="/orders" className="user-dropdown-item">
                                        <FiShoppingBag size={14} /> My Orders
                                    </Link>
                                    {isAdmin && (
                                        <Link to="/admin" className="user-dropdown-item">
                                            <FiGrid size={14} /> Admin Dashboard
                                        </Link>
                                    )}
                                    <div className="user-dropdown-divider" />
                                    <button className="user-dropdown-item" onClick={handleLogout}>
                                        <FiLogOut size={14} /> Logout
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Link to="/login" className="btn btn-outline btn-sm navbar-login-btn">
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            {/* Search Bar Overlay */}
            <AnimatePresence>
                {searchOpen && (
                    <motion.div
                        className="search-overlay"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <form className="search-form" onSubmit={handleSearch}>
                            <FiSearch size={20} className="search-icon" />
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search luxury fragrances..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                            <button type="button" className="search-close" onClick={() => setSearchOpen(false)}>
                                <FiX size={20} />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            className="mobile-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                        />
                        <motion.div
                            className="mobile-menu"
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'tween', duration: 0.3 }}
                        >
                            <div className="mobile-menu-header">
                                <span className="logo-text">GOLDBERG</span>
                                <button onClick={() => setMobileOpen(false)}>
                                    <FiX size={22} />
                                </button>
                            </div>
                            <div className="mobile-menu-links">
                                {navLinks.map((link) => (
                                    <Link key={link.to} to={link.to} className="mobile-menu-link">
                                        {link.label}
                                    </Link>
                                ))}
                                {isAuthenticated && (
                                    <>
                                        <Link to="/profile" className="mobile-menu-link">Profile</Link>
                                        <Link to="/orders" className="mobile-menu-link">Orders</Link>
                                        <Link to="/wishlist" className="mobile-menu-link">Wishlist</Link>
                                        {isAdmin && <Link to="/admin" className="mobile-menu-link">Admin</Link>}
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
