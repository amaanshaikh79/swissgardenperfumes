import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShield, FiDatabase, FiLock, FiEye, FiUsers, FiSettings, FiClock, FiMail, FiPhone } from 'react-icons/fi';
import './Policy.css';

const fadeUp = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5 } };

const PrivacyPolicy = () => (
    <>
        <Helmet>
            <title>Privacy Policy | SwissGarden Perfumes</title>
            <meta name="description" content="SwissGarden Perfumes privacy policy. Learn how we collect, use, store, and protect your personal information." />
        </Helmet>
        <div className="policy-page">
            {/* Hero */}
            <section className="policy-hero">
                <div className="container-sm">
                    <motion.div {...fadeUp}>
                        <span className="section-label">Privacy Policy</span>
                        <h1 className="policy-hero-title">Your Privacy Matters</h1>
                        <div className="gold-divider" />
                        <p className="policy-hero-subtitle">
                            We respect your privacy and are committed to protecting the personal information you share with us. This policy explains how we handle your data.
                        </p>
                        <div className="policy-last-updated">
                            <FiClock size={12} /> Last updated: March 2026
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Content */}
            <div className="policy-content">

                {/* Information We Collect */}
                <motion.div className="policy-section-card" {...fadeUp}>
                    <div className="policy-section-header">
                        <div className="policy-section-icon"><FiDatabase size={20} /></div>
                        <h2 className="policy-section-title">Information We Collect</h2>
                    </div>
                    <p className="policy-text">
                        When you use our website or place an order, we may collect the following types of information:
                    </p>
                    <p className="policy-text"><strong>Personal Information:</strong></p>
                    <ul className="policy-list">
                        <li>Full name, email address, and phone number</li>
                        <li>Shipping and billing address</li>
                        <li>Payment details (processed securely via Razorpay — we do not store card numbers)</li>
                        <li>Account credentials (encrypted password)</li>
                    </ul>
                    <p className="policy-text"><strong>Automatically Collected Data:</strong></p>
                    <ul className="policy-list policy-list-bullet">
                        <li>IP address, browser type, and device information</li>
                        <li>Pages viewed, time spent, and navigation patterns</li>
                        <li>Cookies and similar tracking technologies</li>
                        <li>Referral source (how you found our website)</li>
                    </ul>
                </motion.div>

                {/* How We Use */}
                <motion.div className="policy-section-card" {...fadeUp}>
                    <div className="policy-section-header">
                        <div className="policy-section-icon"><FiEye size={20} /></div>
                        <h2 className="policy-section-title">How We Use Your Information</h2>
                    </div>
                    <p className="policy-text">
                        We use your information solely to provide and improve our services:
                    </p>
                    <ul className="policy-list">
                        <li>Process and fulfill your orders</li>
                        <li>Send order confirmations, shipping updates, and delivery notifications</li>
                        <li>Provide customer support and handle return/refund requests</li>
                        <li>Personalize your shopping experience and product recommendations</li>
                        <li>Send promotional emails and offers (with your consent — you can unsubscribe anytime)</li>
                        <li>Prevent fraud and ensure website security</li>
                        <li>Analyze website traffic and improve our platform</li>
                    </ul>
                    <div className="policy-info-box gold">
                        <span className="policy-info-box-icon">🔒</span>
                        <span>We <strong>never sell, rent, or trade</strong> your personal information to third parties for marketing purposes.</span>
                    </div>
                </motion.div>

                {/* Data Security */}
                <motion.div className="policy-section-card" {...fadeUp}>
                    <div className="policy-section-header">
                        <div className="policy-section-icon"><FiLock size={20} /></div>
                        <h2 className="policy-section-title">Data Security</h2>
                    </div>
                    <p className="policy-text">
                        We implement industry-standard security measures to protect your data:
                    </p>
                    <ul className="policy-list">
                        <li>256-bit SSL/TLS encryption for all data transmitted between your browser and our servers</li>
                        <li>Payment processing handled entirely by Razorpay (PCI DSS Level 1 compliant) — we never see or store your card details</li>
                        <li>Passwords are hashed using bcrypt and never stored in plain text</li>
                        <li>Regular security audits and vulnerability assessments</li>
                        <li>Access to personal data is restricted to authorized personnel only</li>
                    </ul>
                </motion.div>

                {/* Third Party Sharing */}
                <motion.div className="policy-section-card" {...fadeUp}>
                    <div className="policy-section-header">
                        <div className="policy-section-icon"><FiUsers size={20} /></div>
                        <h2 className="policy-section-title">Third-Party Services</h2>
                    </div>
                    <p className="policy-text">
                        We share limited information with trusted third-party services only when necessary to operate our business:
                    </p>
                    <div className="policy-table-wrap">
                        <table className="policy-table">
                            <thead>
                                <tr>
                                    <th>Service Type</th>
                                    <th>Purpose</th>
                                    <th>Data Shared</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Razorpay</td>
                                    <td>Payment processing</td>
                                    <td>Name, email, payment details</td>
                                </tr>
                                <tr>
                                    <td>Courier Partners</td>
                                    <td>Order delivery</td>
                                    <td>Name, phone, shipping address</td>
                                </tr>
                                <tr>
                                    <td>Email Provider</td>
                                    <td>Order notifications</td>
                                    <td>Email address</td>
                                </tr>
                                <tr>
                                    <td>Analytics (Google)</td>
                                    <td>Website improvement</td>
                                    <td>Anonymized usage data</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="policy-text">
                        All third-party providers are bound by their own privacy policies and data protection obligations.
                    </p>
                </motion.div>

                {/* Cookies */}
                <motion.div className="policy-section-card" {...fadeUp}>
                    <div className="policy-section-header">
                        <div className="policy-section-icon"><FiSettings size={20} /></div>
                        <h2 className="policy-section-title">Cookies & Tracking</h2>
                    </div>
                    <p className="policy-text">
                        We use cookies and similar technologies to enhance your experience:
                    </p>
                    <ul className="policy-list">
                        <li><strong>Essential Cookies:</strong> Required for cart, checkout, and login functionality</li>
                        <li><strong>Preference Cookies:</strong> Remember your settings (theme, language)</li>
                        <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our site</li>
                    </ul>
                    <p className="policy-text">
                        You can manage or disable cookies through your browser settings. Note that disabling essential cookies may affect website functionality.
                    </p>
                </motion.div>

                {/* Your Rights */}
                <motion.div className="policy-section-card" {...fadeUp}>
                    <div className="policy-section-header">
                        <div className="policy-section-icon"><FiShield size={20} /></div>
                        <h2 className="policy-section-title">Your Rights</h2>
                    </div>
                    <p className="policy-text">You have the right to:</p>
                    <ul className="policy-list">
                        <li>Access, update, or delete your personal information via your <Link to="/profile" style={{ color: 'var(--accent)', fontWeight: 600 }}>Profile page</Link></li>
                        <li>Opt out of marketing emails at any time using the unsubscribe link</li>
                        <li>Request a copy of all personal data we hold about you</li>
                        <li>Request complete deletion of your account and associated data</li>
                    </ul>
                    <p className="policy-text">
                        To exercise any of these rights, email us at <a href="mailto:privacy@swissgardenperfumes.com" style={{ color: 'var(--accent)', fontWeight: 600 }}>privacy@swissgardenperfumes.com</a>. We'll respond within 30 days.
                    </p>
                </motion.div>

                {/* Contact */}
                <motion.div className="policy-contact-cta" {...fadeUp}>
                    <h3>Privacy Questions?</h3>
                    <p>If you have any concerns about how we handle your data, don't hesitate to reach out.</p>
                    <div className="policy-contact-links">
                        <a href="mailto:privacy@swissgardenperfumes.com"><FiMail size={14} /> privacy@swissgardenperfumes.com</a>
                        <Link to="/contact"><FiPhone size={14} /> Contact Us</Link>
                    </div>
                </motion.div>
            </div>
        </div>
    </>
);

export default PrivacyPolicy;
