import { Link } from 'react-router-dom';
import { FiInstagram, FiMail, FiMapPin, FiPhone, FiMessageCircle } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-top">
                <div className="container">
                    <div className="footer-grid">
                        {/* Brand */}
                        <div className="footer-brand">
                            <Link to="/" className="footer-logo">
                                <span className="logo-text">GOLDENBUCK</span>
                                <span className="logo-sub">PERFUMES</span>
                            </Link>
                            <p className="footer-brand-desc">
                                Premium fragrance profiles inspired by iconic luxury scents — crafted for everyday wear in India. Smart buyer's luxury alternative.
                            </p>
                            <div className="footer-socials">
                                <a href="#" className="footer-social-link" aria-label="Instagram"><FiInstagram size={18} /></a>
                                <a href="#" className="footer-social-link" aria-label="WhatsApp"><FiMessageCircle size={18} /></a>
                                <a href="#" className="footer-social-link" aria-label="Email"><FiMail size={18} /></a>
                            </div>
                        </div>

                        {/* Shop */}
                        <div className="footer-section">
                            <h4 className="footer-heading">Shop</h4>
                            <Link to="/shop" className="footer-link">All Fragrances</Link>
                            <Link to="/shop?gender=Men" className="footer-link">For Him</Link>
                            <Link to="/shop?gender=Women" className="footer-link">For Her</Link>
                            <Link to="/shop?gender=Unisex" className="footer-link">Unisex</Link>
                            <Link to="/shop?tag=combo" className="footer-link">Combo Deals</Link>
                            <Link to="/shop?category=Gift Set" className="footer-link">Gift Sets</Link>
                        </div>

                        {/* Company */}
                        <div className="footer-section">
                            <h4 className="footer-heading">Company</h4>
                            <Link to="/about" className="footer-link">About Us</Link>
                            <Link to="/contact" className="footer-link">Contact Us</Link>
                            <Link to="/shipping" className="footer-link">Shipping Policy</Link>
                            <Link to="/returns" className="footer-link">Return Policy</Link>
                            <Link to="/privacy" className="footer-link">Privacy Policy</Link>
                            <Link to="/terms" className="footer-link">Terms & Conditions</Link>
                        </div>

                        {/* Contact */}
                        <div className="footer-section">
                            <h4 className="footer-heading">Get in Touch</h4>
                            <div className="footer-contact-item">
                                <FiMapPin size={14} />
                                <span>Mumbai, Maharashtra<br />India</span>
                            </div>
                            <div className="footer-contact-item">
                                <FiPhone size={14} />
                                <span>+91 98765 43210</span>
                            </div>
                            <div className="footer-contact-item">
                                <FiMail size={14} />
                                <span>hello@goldenbuckperfumes.com</span>
                            </div>
                            <div className="footer-contact-item">
                                <FiMessageCircle size={14} />
                                <span>WhatsApp Support</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Legal Disclaimer */}
            <div className="footer-disclaimer">
                <div className="container">
                    <p>
                        We create independent fragrance interpretations and are not affiliated with, endorsed by, or connected to any designer brands. All product names, trademarks, and images used are for descriptive reference only and belong to their respective owners.
                    </p>
                </div>
            </div>

            <div className="footer-bottom">
                <div className="container">
                    <div className="footer-bottom-content">
                        <p>© {new Date().getFullYear()} GoldenBuck Perfumes. All rights reserved.</p>
                        <div className="footer-payments">
                            <span>UPI</span>
                            <span>•</span>
                            <span>Cards</span>
                            <span>•</span>
                            <span>Net Banking</span>
                            <span>•</span>
                            <span>COD</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
