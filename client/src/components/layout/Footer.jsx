import { Link } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiFacebook, FiMail, FiMapPin, FiPhone } from 'react-icons/fi';
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
                                Crafting exquisite luxury fragrances for the discerning connoisseur since 1987. Every scent tells a story of elegance and refinement.
                            </p>
                            <div className="footer-socials">
                                <a href="#" className="footer-social-link" aria-label="Instagram"><FiInstagram size={18} /></a>
                                <a href="#" className="footer-social-link" aria-label="Twitter"><FiTwitter size={18} /></a>
                                <a href="#" className="footer-social-link" aria-label="Facebook"><FiFacebook size={18} /></a>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="footer-section">
                            <h4 className="footer-heading">Explore</h4>
                            <Link to="/shop" className="footer-link">All Fragrances</Link>
                            <Link to="/shop?category=Eau de Parfum" className="footer-link">Eau de Parfum</Link>
                            <Link to="/shop?category=Parfum" className="footer-link">Parfum</Link>
                            <Link to="/shop?category=Gift Set" className="footer-link">Gift Sets</Link>
                            <Link to="/shop?gender=Men" className="footer-link">For Him</Link>
                            <Link to="/shop?gender=Women" className="footer-link">For Her</Link>
                        </div>

                        {/* Company */}
                        <div className="footer-section">
                            <h4 className="footer-heading">Company</h4>
                            <Link to="/about" className="footer-link">Our Story</Link>
                            <Link to="/contact" className="footer-link">Contact Us</Link>
                            <a href="#" className="footer-link">Shipping & Returns</a>
                            <a href="#" className="footer-link">Privacy Policy</a>
                            <a href="#" className="footer-link">Terms & Conditions</a>
                        </div>

                        {/* Contact */}
                        <div className="footer-section">
                            <h4 className="footer-heading">Get in Touch</h4>
                            <div className="footer-contact-item">
                                <FiMapPin size={14} />
                                <span>5th Avenue, Suite 1200<br />New York, NY 10022</span>
                            </div>
                            <div className="footer-contact-item">
                                <FiPhone size={14} />
                                <span>+1 (212) 555-0187</span>
                            </div>
                            <div className="footer-contact-item">
                                <FiMail size={14} />
                                <span>hello@goldenbuckperfumes.com</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <div className="container">
                    <p>© {new Date().getFullYear()} GoldenBuck Perfumes. All rights reserved.</p>
                    <p className="footer-craft">Crafted with passion for the art of perfumery.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
