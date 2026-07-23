import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiUser, FiShoppingBag, FiMenu, FiX, FiChevronDown, FiLogOut, FiGrid, FiPackage, FiHeart } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import useModalA11y from '../../hooks/useModalA11y';
import './Navbar.css';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const shopDropdownRef = useRef(null);
    const userMenuRef = useRef(null);
    const mobileCloseRef = useRef(null);
    const { user, isAuthenticated, isAdmin, logout } = useAuth();
    const { cartCount, setIsCartOpen } = useCart();
    const location = useLocation();
    const navigate = useNavigate();

    const closeSearch = useCallback(() => setSearchOpen(false), []);
    const closeMobile = useCallback(() => setMobileOpen(false), []);
    // Search keeps focus on its autoFocus input, so no closeRef is passed.
    const searchPanelRef = useModalA11y(searchOpen, closeSearch, null);
    const mobilePanelRef = useModalA11y(mobileOpen, closeMobile, mobileCloseRef);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 30);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setMobileOpen(false);
        setSearchOpen(false);
        setShopDropdownOpen(false);
        setUserMenuOpen(false);
    }, [location]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (shopDropdownRef.current && !shopDropdownRef.current.contains(e.target)) {
                setShopDropdownOpen(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setUserMenuOpen(false);
            }
        };
        const handleEscape = (e) => {
            if (e.key === 'Escape') setUserMenuOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);

    // Lock background scroll and hide floating widgets (chat bubble) while the
    // mobile drawer is open — prevents the classic scroll-bleed and overlap glitches.
    useEffect(() => {
        document.body.classList.toggle('sg-drawer-open', mobileOpen);
        return () => document.body.classList.remove('sg-drawer-open');
    }, [mobileOpen]);

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

    // Center Menu: Shop | Bestsellers | For Him | For Her | Combo Sets | Gifting | Pairing Guide | About
    const navLinks = [
        { to: '/shop', label: 'Shop', hasDropdown: true },
        { to: '/shop?tag=bestseller', label: 'Bestsellers' },
        { to: '/shop?gender=Men', label: 'For Him' },
        { to: '/shop?gender=Women', label: 'For Her' },
        { to: '/combo-set', label: 'Combo Sets' },
        { to: '/gifting', label: 'Gifting' },
        { to: '/pairing-guide', label: 'Pairing Guide' },
        { to: '/about', label: 'About' },
    ];

    const shopCategories = {
        'By Gender': [
            { label: 'For Him', to: '/shop?gender=Men' },
            { label: 'For Her', to: '/shop?gender=Women' },
            { label: 'Unisex', to: '/shop?gender=Unisex' },
        ],
        'By Type': [
            { label: 'Attar Roll-On', to: '/shop?category=Attar' },
            { label: 'Eau De Parfum', to: '/shop?category=Eau de Parfum' },
        ],
        'By Occasion': [
            { label: 'Office', to: '/shop?occasion=Office' },
            { label: 'Date Night', to: '/shop?occasion=Date Night' },
            { label: 'Party', to: '/shop?occasion=Party' },
            { label: 'Daily Wear', to: '/shop?occasion=Day' },
        ],
        'By Price': [
            { label: 'Under ₹799', to: '/shop?maxPrice=799' },
            { label: '₹800 – ₹1,999', to: '/shop?minPrice=800&maxPrice=1999' },
            { label: '₹2,000+', to: '/shop?minPrice=2000' },
        ],
    };

    return (
        <>

            <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
                <div className="navbar-container">
                    {/* Mobile Menu Toggle */}
                    <button className="navbar-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
                        {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
                    </button>

                    {/* Logo (Left) */}
                    <Link to="/" className="navbar-logo">
                        <span className="logo-text">swissgarden</span>
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
                        <button className="navbar-action-btn navbar-search-btn" onClick={() => setSearchOpen(!searchOpen)} aria-label="Search">
                            <FiSearch size={18} />
                        </button>

                        {isAuthenticated ? (
                            <div className="navbar-user-menu" ref={userMenuRef}>
                                <button
                                    type="button"
                                    className="navbar-action-btn user-btn"
                                    aria-label="Account menu"
                                    aria-haspopup="menu"
                                    aria-expanded={userMenuOpen}
                                    onClick={() => setUserMenuOpen((o) => !o)}
                                >
                                    <FiUser size={18} />
                                </button>
                                <div className={`user-dropdown ${userMenuOpen ? 'open' : ''}`} role="menu">
                                    <div className="user-dropdown-header">
                                        <span className="user-dropdown-name">{user?.firstName}</span>
                                        <span className="user-dropdown-email">{user?.email}</span>
                                    </div>
                                    <div className="user-dropdown-divider" />
                                    <Link to="/profile" className="user-dropdown-item" role="menuitem" onClick={() => setUserMenuOpen(false)}>
                                        <FiUser size={14} /> My Profile
                                    </Link>
                                    <Link to="/orders" className="user-dropdown-item" role="menuitem" onClick={() => setUserMenuOpen(false)}>
                                        <FiPackage size={14} /> My Orders
                                    </Link>
                                    <Link to="/wishlist" className="user-dropdown-item" role="menuitem" onClick={() => setUserMenuOpen(false)}>
                                        <FiHeart size={14} /> Wishlist
                                    </Link>
                                    {isAdmin && (
                                        <Link to="/admin" className="user-dropdown-item" role="menuitem" onClick={() => setUserMenuOpen(false)}>
                                            <FiGrid size={14} /> Admin Dashboard
                                        </Link>
                                    )}
                                    <div className="user-dropdown-divider" />
                                    <button className="user-dropdown-item" role="menuitem" onClick={() => { setUserMenuOpen(false); handleLogout(); }}>
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
                        ref={searchPanelRef}
                        className="search-overlay"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Search"
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
                                aria-label="Search fragrances"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                            <button type="button" className="search-close" onClick={() => setSearchOpen(false)} aria-label="Close search">
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
                            ref={mobilePanelRef}
                            className="mobile-menu"
                            role="dialog"
                            aria-modal="true"
                            aria-label="Menu"
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'tween', duration: 0.3 }}
                        >
                            <div className="mobile-menu-header">
                                <div className="mobile-logo">
                                    <span className="logo-text">swissgarden</span>
                                    <span className="logo-sub">PERFUMES</span>
                                </div>
                                <button ref={mobileCloseRef} onClick={() => setMobileOpen(false)} className="mobile-close-btn" aria-label="Close menu">
                                    <FiX size={24} />
                                </button>
                            </div>

                            <div className="mobile-menu-content">
                                {/* Main Navigation */}
                                <div className="mobile-menu-section">
                                    <div className="mobile-menu-section-title">Explore</div>
                                    <Link to="/shop" className="mobile-menu-link">
                                        <FiGrid size={18} />
                                        <span>Shop</span>
                                    </Link>
                                    <Link to="/shop?tag=bestseller" className="mobile-menu-link mobile-menu-link--featured">
                                        <FiHeart size={18} />
                                        <span>Bestsellers</span>
                                    </Link>
                                    <Link to="/shop?gender=Men" className="mobile-menu-link">
                                        <span className="mobile-menu-icon">👔</span>
                                        <span>For Him</span>
                                    </Link>
                                    <Link to="/shop?gender=Women" className="mobile-menu-link">
                                        <span className="mobile-menu-icon">👗</span>
                                        <span>For Her</span>
                                    </Link>
                                    <Link to="/shop?gender=Unisex" className="mobile-menu-link">
                                        <span className="mobile-menu-icon">⚡</span>
                                        <span>Unisex</span>
                                    </Link>
                                </div>

                                <div className="mobile-menu-divider" />

                                {/* Special Offerings */}
                                <div className="mobile-menu-section">
                                    <div className="mobile-menu-section-title">Special Offers</div>
                                    <Link to="/combo-set" className="mobile-menu-link">
                                        <FiPackage size={18} />
                                        <span>Combo Sets</span>
                                    </Link>
                                    <Link to="/gifting" className="mobile-menu-link">
                                        <span className="mobile-menu-icon">🎁</span>
                                        <span>Gifting</span>
                                    </Link>
                                </div>

                                <div className="mobile-menu-divider" />

                                {/* Information */}
                                <div className="mobile-menu-section">
                                    <div className="mobile-menu-section-title">Discover</div>
                                    <Link to="/pairing-guide" className="mobile-menu-link">
                                        <span className="mobile-menu-icon">🌟</span>
                                        <span>Pairing Guide</span>
                                    </Link>
                                    <Link to="/about" className="mobile-menu-link">
                                        <span className="mobile-menu-icon">ℹ️</span>
                                        <span>About</span>
                                    </Link>
                                    <Link to="/contact" className="mobile-menu-link">
                                        <span className="mobile-menu-icon">📧</span>
                                        <span>Contact</span>
                                    </Link>
                                </div>

                                {/* User Account Section */}
                                {isAuthenticated && (
                                    <>
                                        <div className="mobile-menu-divider" />
                                        <div className="mobile-menu-section">
                                            <div className="mobile-menu-section-title">Account</div>
                                            <Link to="/profile" className="mobile-menu-link">
                                                <FiUser size={18} />
                                                <span>My Profile</span>
                                            </Link>
                                            <Link to="/orders" className="mobile-menu-link">
                                                <FiPackage size={18} />
                                                <span>My Orders</span>
                                            </Link>
                                            <Link to="/wishlist" className="mobile-menu-link">
                                                <FiHeart size={18} />
                                                <span>Wishlist</span>
                                            </Link>
                                            {isAdmin && (
                                                <Link to="/admin" className="mobile-menu-link">
                                                    <FiGrid size={18} />
                                                    <span>Admin Dashboard</span>
                                                </Link>
                                            )}
                                            <button className="mobile-menu-link mobile-logout-btn" onClick={handleLogout}>
                                                <FiLogOut size={18} />
                                                <span>Logout</span>
                                            </button>
                                        </div>
                                    </>
                                )}

                                {/* Sign In CTA */}
                                {!isAuthenticated && (
                                    <div className="mobile-menu-footer">
                                        <Link to="/login" className="btn btn-primary btn-block mobile-menu-cta">
                                            <FiUser size={18} />
                                            Sign In / Register
                                        </Link>
                                    </div>
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
