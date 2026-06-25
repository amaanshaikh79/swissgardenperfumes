import { Link } from 'react-router-dom';
import { FiInstagram, FiMail, FiMapPin, FiPhone, FiMessageCircle } from 'react-icons/fi';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaYoutube, FaPinterestP } from 'react-icons/fa';
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
                                <span className="logo-text">swissgarden</span>
                                <span className="logo-sub">PERFUMES</span>
                            </Link>
                            <p className="footer-brand-statement">
                                <em>Swiss precision. Indian craft.</em> · The Mood Collection
                            </p>
                            <div className="footer-socials">
                                <a href="https://www.instagram.com/swissgardenperfumes.official_" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Instagram"><FiInstagram size={18} /></a>
                                <a href="https://wa.me/919354936369" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="WhatsApp"><FiMessageCircle size={18} /></a>
                                <a href="mailto:Contact@swissgardenperfumes.com" className="footer-social-link" aria-label="Email"><FiMail size={18} /></a>
                                <a href="https://www.facebook.com/swissgardenperfumes" className="footer-social-link" aria-label="Facebook"><FaFacebookF size={18} /></a>
                                <a href="https://www.twitter.com/swissgardenperfumes" className="footer-social-link" aria-label="Twitter"><FaTwitter size={18} /></a>
                                <a href="https://www.linkedin.com/swissgardenperfumes" className="footer-social-link" aria-label="LinkedIn"><FaLinkedinIn size={18} /></a>
                                <a href="https://www.youtube.com/swissgardenperfumes" className="footer-social-link" aria-label="YouTube"><FaYoutube size={18} /></a>
                                <a href="https://www.pinterest.com/swissgardenperfumes" className="footer-social-link" aria-label="Pinterest"><FaPinterestP size={18} /></a>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="footer-section">
                            <h4 className="footer-heading">Explore</h4>
                            <Link to="/shop" className="footer-link">Shop the Collection</Link>
                            <Link to="/combo-set" className="footer-link">Build Your Trio</Link>
                            <Link to="/pairing-guide" className="footer-link">Scent Pairing Guide</Link>
                            <Link to="/about" className="footer-link">About Swiss Garden Perfumes</Link>
                            <Link to="/gifting" className="footer-link">Gifting</Link>
                            <Link to="/contact" className="footer-link">Contact Us</Link>
                        </div>

                        {/* Policies */}
                        <div className="footer-section">
                            <h4 className="footer-heading">Customer Care</h4>
                            <Link to="/shipping-policy" className="footer-link">Shipping Policy</Link>
                            <Link to="/return-policy" className="footer-link">Return Policy</Link>
                            <Link to="/privacy-policy" className="footer-link">Privacy Policy</Link>
                            <Link to="/terms" className="footer-link">Terms & Conditions</Link>
                        </div>

                        {/* Contact */}
                        <div className="footer-section">
                            <h4 className="footer-heading">Get in Touch</h4>
                            <div className="footer-contact-item">
                                <FiMapPin size={14} />
                                <span>C-589 DDA Flat, Pocket 11<br />Jasola, New Delhi 110025</span>
                            </div>
                            <div className="footer-contact-item">
                                <FiPhone size={14} />
                                <span>+91 9354936369</span>
                            </div>
                            <div className="footer-contact-item">
                                <FiMail size={14} />
                                <span>Contact@swissgardenperfumes.com</span>
                            </div>
                            <div className="footer-contact-item">
                                <FiMessageCircle size={14} />
                                <span>WhatsApp Support</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Legal Block */}
            <div className="footer-legal">
                <div className="container">
                    <div className="footer-legal-content">
                        <p className="footer-legal-brand">
                            Swiss Garden Perfumes is a brand of <strong>Golden Buck Private Limited</strong>.
                        </p>
                        <p className="footer-legal-manufacturing">
                            <em><strong>Manufacturing note:</strong> Swiss Garden Perfumes products are manufactured in India. 
                            The Swiss identity represents our standard of precision in formulation — not geographic origin.</em>
                        </p>
                        <p className="footer-legal-copyright">
                            © 2025 Golden Buck Private Limited. All rights reserved. Swiss Garden Perfumes™
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
