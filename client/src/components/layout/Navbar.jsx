import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiUser, FiShoppingBag, FiMenu, FiX, FiChevronDown, FiLogOut, FiGrid, FiPackage, FiHeart } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import TopBar from './TopBar';
import './Navbar.css';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
    const shopDropdownRef = useRef(null);
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const { cartCount, setIsCartOpen } = useCart();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 30);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setMobileOpen(false);
        setSearchOpen(false);
        setShopDropdownOpen(false);
    }, [location]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (shopDropdownRef.current && !shopDropdownRef.current.contains(e.target)) {
                setShopDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

    // Center Menu: Shop | Bestsellers | For Him | For Her | Combo Sets | About
    const navLinks = [
        { to: '/shop', label: 'Shop', hasDropdown: true },
        { to: '/shop?tag=bestseller', label: 'Bestsellers' },
        { to: '/shop?gender=Men', label: 'For Him' },
        { to: '/shop?gender=Women', label: 'For Her' },
        { to: '/shop?tag=combo', label: 'Combo Sets' },
        { to: '/about', label: 'About' },
    ];

    const shopCategories = {
        'By Gender': [
            { label: 'For Him', to: '/shop?gender=Men' },
            { label: 'For Her', to: '/shop?gender=Women' },
            { label: 'Unisex', to: '/shop?gender=Unisex' },
        ],
        'By Type': [
            { label: 'Eau De Parfum', to: '/shop?category=Eau de Parfum' },
            { label: 'Attar Roll-On', to: '/shop?category=Attar' },
        ],
        'By Occasion': [
            { label: 'Office', to: '/shop?occasion=Office' },
            { label: 'Date Night', to: '/shop?occasion=Date Night' },
            { label: 'Party', to: '/shop?occasion=Party' },
            { label: 'Daily Wear', to: '/shop?occasion=Day' },
        ],
        'By Price': [
            { label: 'Under ₹499', to: '/shop?maxPrice=499' },
            { label: '₹500 – ₹999', to: '/shop?minPrice=500&maxPrice=999' },
            { label: '₹1,000+', to: '/shop?minPrice=1000' },
        ],
    };

    return (
        <>
            <TopBar />

            <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
                <div className="navbar-container">
                    {/* Mobile Menu Toggle */}
                    <button className="navbar-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
                        {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
                    </button>

                    {/* Logo (Left) */}
                    <Link to="/" className="navbar-logo">
                        <span className="logo-text">GOLDENBUCK</span>
                        <span className="logo-sub">PERFUMES</span>
                    </Link>

                    {/* Desktop Nav Links */}
                    <div className="navbar-links">
                        {navLinks.map((link) => (
                            link.hasDropdown ? (
                                <div key={link.to} className="navbar-link-wrapper" ref={shopDropdownRef}>
                                    <button
                                        className={`navbar-link ${location.pathname === '/shop' ? 'active' : ''}`}
                                        onClick={() => setShopDropdownOpen(!shopDropdownOpen)}
                                    >
                                        {link.label} <FiChevronDown size={14} />
                                    </button>
                                    <AnimatePresence>
                                        {shopDropdownOpen && (
                                            <motion.div
                                                className="shop-mega-dropdown"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                {Object.entries(shopCategories).map(([group, items]) => (
                                                    <div key={group} className="mega-dropdown-column">
                                                        <h4 className="mega-dropdown-heading">{group}</h4>
                                                        {items.map((item) => (
                                                            <Link
                                                                key={item.label}
                                                                to={item.to}
                                                                className="mega-dropdown-link"
                                                            >
                                                                {item.label}
                                                            </Link>
                                                        ))}
                                                    </div>
                                                ))}
                                                <div className="mega-dropdown-column mega-dropdown-cta">
                                                    <div className="mega-cta-box">
                                                        <span className="mega-cta-label">🔥 Trending</span>
                                                        <h4>Buy 2, Save ₹200</h4>
                                                        <p>Build your combo & save big</p>
                                                        <Link to="/shop?tag=combo" className="btn btn-primary btn-sm">Shop Combos</Link>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className={`navbar-link ${location.pathname + location.search === link.to ? 'active' : ''}`}
                                >
                                    {link.label}
                                </Link>
                            )
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="navbar-actions">
                        <button className="navbar-action-btn" onClick={() => setSearchOpen(!searchOpen)} aria-label="Search">
                            <FiSearch size={18} />
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
                                        <FiPackage size={14} /> My Orders
                                    </Link>
                                    <Link to="/wishlist" className="user-dropdown-item">
                                        <FiHeart size={14} /> Wishlist
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
                            <Link to="/login" className="navbar-action-btn" aria-label="Account">
                                <FiUser size={18} />
                            </Link>
                        )}

                        <button className="navbar-action-btn cart-btn" onClick={() => setIsCartOpen(true)} aria-label="Cart">
                            <FiShoppingBag size={18} />
                            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Search Overlay */}
            <AnimatePresence>
                {searchOpen && (
                    <motion.div
                        className="search-overlay"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.25 }}
                    >
                        <form className="search-form" onSubmit={handleSearch}>
                            <FiSearch size={20} className="search-icon" />
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search fragrances..."
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
                                <span className="logo-text">GOLDENBUCK</span>
                                <button onClick={() => setMobileOpen(false)}>
                                    <FiX size={22} />
                                </button>
                            </div>
                            <div className="mobile-menu-links">
                                <Link to="/shop" className="mobile-menu-link">Shop All</Link>
                                <Link to="/shop?tag=bestseller" className="mobile-menu-link">Bestsellers</Link>
                                <Link to="/shop?gender=Men" className="mobile-menu-link">For Him</Link>
                                <Link to="/shop?gender=Women" className="mobile-menu-link">For Her</Link>
                                <Link to="/shop?gender=Unisex" className="mobile-menu-link">Unisex</Link>
                                <Link to="/shop?tag=combo" className="mobile-menu-link mobile-menu-link--highlight">
                                    🔥 Combo Deals
                                </Link>
                                <div className="mobile-menu-divider" />
                                <Link to="/about" className="mobile-menu-link">About Us</Link>
                                <Link to="/contact" className="mobile-menu-link">Contact</Link>
                                {isAuthenticated && (
                                    <>
                                        <div className="mobile-menu-divider" />
                                        <Link to="/profile" className="mobile-menu-link">My Profile</Link>
                                        <Link to="/orders" className="mobile-menu-link">My Orders</Link>
                                        <Link to="/wishlist" className="mobile-menu-link">Wishlist</Link>
                                        {isAdmin && <Link to="/admin" className="mobile-menu-link">Admin Dashboard</Link>}
                                        <button className="mobile-menu-link mobile-logout-btn" onClick={handleLogout}>
                                            Logout
                                        </button>
                                    </>
                                )}
                                {!isAuthenticated && (
                                    <>
                                        <div className="mobile-menu-divider" />
                                        <Link to="/login" className="btn btn-primary btn-block mobile-menu-cta">
                                            Sign In / Register
                                        </Link>
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
