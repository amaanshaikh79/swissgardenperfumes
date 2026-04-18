import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiFileText, FiShoppingBag, FiCreditCard, FiAlertTriangle, FiShield, FiEdit3, FiClock, FiMail, FiPhone } from 'react-icons/fi';
import './Policy.css';

const fadeUp = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5 } };

const TermsConditions = () => (
    <>
        <Helmet>
            <title>Terms & Conditions | SwissGarden Perfumes</title>
            <meta name="description" content="Read the terms and conditions governing the use of SwissGarden Perfumes website and purchase of our products." />
        </Helmet>
        <div className="policy-page">
            {/* Hero */}
            <section className="policy-hero">
                <div className="container-sm">
                    <motion.div {...fadeUp}>
                        <span className="section-label">Legal</span>
                        <h1 className="policy-hero-title">Terms & Conditions</h1>
                        <div className="gold-divider" />
                        <p className="policy-hero-subtitle">
                            By using our website and purchasing our products, you agree to the following terms. Please read them carefully.
                        </p>
                        <div className="policy-last-updated">
                            <FiClock size={12} /> Last updated: March 2026
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Content */}
            <div className="policy-content">

                {/* General Terms */}
                <motion.div className="policy-section-card" {...fadeUp}>
                    <div className="policy-section-header">
                        <div className="policy-section-icon"><FiFileText size={20} /></div>
                        <h2 className="policy-section-title">General Terms</h2>
                    </div>
                    <p className="policy-text">
                        Welcome to SwissGarden Perfumes ("we", "our", "us"). By accessing or using our website at <strong>swissgardenperfumes.com</strong>, you agree to be bound by these Terms & Conditions and all applicable laws and regulations.
                    </p>
                    <ul className="policy-list policy-list-bullet">
                        <li>You must be at least <strong>18 years of age</strong> to make a purchase on this website, or have consent from a parent/guardian.</li>
                        <li>By creating an account, you confirm that the information you provide is accurate, current, and complete.</li>
                        <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                        <li>We reserve the right to refuse service, terminate accounts, or cancel orders at our discretion.</li>
                    </ul>
                </motion.div>

                {/* Products & Pricing */}
                <motion.div className="policy-section-card" {...fadeUp}>
                    <div className="policy-section-header">
                        <div className="policy-section-icon"><FiShoppingBag size={20} /></div>
                        <h2 className="policy-section-title">Products & Pricing</h2>
                    </div>
                    <ul className="policy-list policy-list-bullet">
                        <li>All product descriptions, images, and specifications are as accurate as possible. However, slight variations in color or packaging may occur due to photography, screen settings, or batch differences.</li>
                        <li>Prices are listed in <strong>Indian Rupees (₹)</strong> and are inclusive of applicable taxes unless stated otherwise.</li>
                        <li>We reserve the right to modify prices, offers, and discounts at any time without prior notice.</li>
                        <li>In the event of a pricing error, we reserve the right to cancel the order and issue a full refund.</li>
                        <li>Product availability is subject to stock. We may limit quantities per order during high-demand periods.</li>
                    </ul>
                    <div className="policy-info-box gold">
                        <span className="policy-info-box-icon">💡</span>
                        <span>SwissGarden Perfumes are <strong>inspired interpretations</strong> and are not affiliated with, endorsed by, or identical to any designer brands referenced in fragrance notes or descriptions.</span>
                    </div>
                </motion.div>

                {/* Orders & Payment */}
                <motion.div className="policy-section-card" {...fadeUp}>
                    <div className="policy-section-header">
                        <div className="policy-section-icon"><FiCreditCard size={20} /></div>
                        <h2 className="policy-section-title">Orders & Payment</h2>
                    </div>
                    <ul className="policy-list policy-list-bullet">
                        <li>Placing an order constitutes an offer to purchase. We may accept or decline your order at our discretion.</li>
                        <li>All online payments are processed securely through <strong>Razorpay</strong>. We accept UPI, Credit/Debit Cards, Net Banking, and Wallets.</li>
                        <li>Cash on Delivery (COD) is available across India for eligible orders.</li>
                        <li>Once an order is placed and payment is confirmed, it cannot be modified. You may cancel the order as per our cancellation policy.</li>
                        <li>We are not responsible for payment failures caused by issues with your bank, UPI app, or card provider.</li>
                    </ul>
                </motion.div>

                {/* Cancellations */}
                <motion.div className="policy-section-card" {...fadeUp}>
                    <div className="policy-section-header">
                        <div className="policy-section-icon"><FiAlertTriangle size={20} /></div>
                        <h2 className="policy-section-title">Cancellation Policy</h2>
                    </div>
                    <p className="policy-text">
                        You may cancel an order <strong>before it has been shipped</strong>. Once the order is dispatched, cancellation is not possible — you may initiate a return instead after delivery.
                    </p>
                    <ul className="policy-list">
                        <li>To cancel, email us at <a href="mailto:support@swissgardenperfumes.com" style={{ color: 'var(--accent)', fontWeight: 600 }}>support@swissgardenperfumes.com</a> with your order number</li>
                        <li>Prepaid orders: Full refund within 5–7 business days to the original payment method</li>
                        <li>COD orders: Cancelled at no cost before dispatch</li>
                    </ul>
                </motion.div>

                {/* Intellectual Property */}
                <motion.div className="policy-section-card" {...fadeUp}>
                    <div className="policy-section-header">
                        <div className="policy-section-icon"><FiShield size={20} /></div>
                        <h2 className="policy-section-title">Intellectual Property</h2>
                    </div>
                    <p className="policy-text">
                        All content on this website — including but not limited to text, graphics, logos, product images, UI design, and source code — is the intellectual property of SwissGarden Perfumes and is protected by Indian copyright and trademark laws.
                    </p>
                    <ul className="policy-list policy-list-bullet">
                        <li>You may not reproduce, distribute, modify, or create derivative works from any content without our written consent.</li>
                        <li>The "SwissGarden" name, logo, and brand identity are trademarks of SwissGarden Perfumes.</li>
                        <li>User-generated content (reviews, comments) remains your property, but you grant us a non-exclusive license to display it on our platform.</li>
                    </ul>
                </motion.div>

                {/* Limitation of Liability */}
                <motion.div className="policy-section-card" {...fadeUp}>
                    <div className="policy-section-header">
                        <div className="policy-section-icon"><FiAlertTriangle size={20} /></div>
                        <h2 className="policy-section-title">Limitation of Liability</h2>
                    </div>
                    <ul className="policy-list policy-list-bullet">
                        <li>SwissGarden Perfumes shall not be liable for any indirect, incidental, or consequential damages arising from the use of our website or products.</li>
                        <li>We are not responsible for allergic reactions. Please review fragrance notes and ingredients before purchase. Perform a patch test if you have sensitive skin.</li>
                        <li>Our liability for any claim is limited to the purchase price of the product in question.</li>
                        <li>We do not guarantee uninterrupted access to our website and are not liable for downtime caused by server issues, maintenance, or third-party services.</li>
                    </ul>
                </motion.div>

                {/* Changes */}
                <motion.div className="policy-section-card" {...fadeUp}>
                    <div className="policy-section-header">
                        <div className="policy-section-icon"><FiEdit3 size={20} /></div>
                        <h2 className="policy-section-title">Changes to These Terms</h2>
                    </div>
                    <p className="policy-text">
                        We reserve the right to update or modify these Terms & Conditions at any time. Changes will be posted on this page with an updated "Last updated" date. Your continued use of the website after changes constitutes acceptance of the new terms.
                    </p>
                    <div className="policy-info-box blue">
                        <span className="policy-info-box-icon">📢</span>
                        <span>We recommend reviewing this page periodically. For material changes, we may notify registered users via email.</span>
                    </div>
                </motion.div>

                {/* Governing Law */}
                <motion.div className="policy-section-card" {...fadeUp}>
                    <div className="policy-section-header">
                        <div className="policy-section-icon"><FiFileText size={20} /></div>
                        <h2 className="policy-section-title">Governing Law & Jurisdiction</h2>
                    </div>
                    <p className="policy-text">
                        These Terms & Conditions are governed by and construed in accordance with the <strong>laws of India</strong>. Any disputes arising from these terms or your use of our website shall be subject to the exclusive jurisdiction of the courts in <strong>Delhi, India</strong>.
                    </p>
                </motion.div>

                {/* Contact */}
                <motion.div className="policy-contact-cta" {...fadeUp}>
                    <h3>Questions About Our Terms?</h3>
                    <p>If anything is unclear, we're happy to explain. Reach out to our team anytime.</p>
                    <div className="policy-contact-links">
                        <a href="mailto:legal@swissgardenperfumes.com"><FiMail size={14} /> legal@swissgardenperfumes.com</a>
                        <Link to="/contact"><FiPhone size={14} /> Contact Us</Link>
                    </div>
                </motion.div>
            </div>
        </div>
    </>
);

export default TermsConditions;
