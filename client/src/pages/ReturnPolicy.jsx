import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiRotateCcw, FiCheckCircle, FiXCircle, FiAlertTriangle, FiClock, FiMail, FiPhone } from 'react-icons/fi';
import './Policy.css';

const fadeUp = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5 } };

const ReturnPolicy = () => (
    <>
        <Helmet>
            <title>Return & Refund Policy | SwissGarden Perfumes</title>
            <meta name="description" content="SwissGarden Perfumes return, exchange, and refund policy. Learn how to request returns within 7 days of delivery." />
        </Helmet>
        <div className="policy-page">
            {/* Hero */}
            <section className="policy-hero">
                <div className="container-sm">
                    <motion.div {...fadeUp}>
                        <span className="section-label">Return Policy</span>
                        <h1 className="policy-hero-title">Returns & Refunds</h1>
                        <div className="gold-divider" />
                        <p className="policy-hero-subtitle">
                            Your satisfaction is our priority. If you're not happy with your purchase, we're here to make it right.
                        </p>
                        <div className="policy-last-updated">
                            <FiClock size={12} /> Last updated: March 2026
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Content */}
            <div className="policy-content">

                {/* Return Window */}
                <motion.div className="policy-section-card" {...fadeUp}>
                    <div className="policy-section-header">
                        <div className="policy-section-icon"><FiRotateCcw size={20} /></div>
                        <h2 className="policy-section-title">Return Window</h2>
                    </div>
                    <p className="policy-text">
                        We offer a <strong>7-day return window</strong> from the date of delivery. If you're not completely satisfied with your order, you can initiate a return within this period.
                    </p>
                    <div className="policy-info-box gold">
                        <span className="policy-info-box-icon">📦</span>
                        <span>To be eligible for a return, the product must be <strong>unused, unopened, and in its original packaging</strong> with all tags and seals intact.</span>
                    </div>
                </motion.div>

                {/* Eligible for Return */}
                <motion.div className="policy-section-card" {...fadeUp}>
                    <div className="policy-section-header">
                        <div className="policy-section-icon"><FiCheckCircle size={20} /></div>
                        <h2 className="policy-section-title">Eligible for Return</h2>
                    </div>
                    <ul className="policy-list">
                        <li>Product received is damaged, broken, or leaking</li>
                        <li>Wrong product delivered (different fragrance, size, or variant)</li>
                        <li>Product is missing from the order</li>
                        <li>Product received does not match the description on the website</li>
                        <li>Manufacturing defect (e.g., faulty spray mechanism)</li>
                    </ul>
                </motion.div>

                {/* Not Eligible */}
                <motion.div className="policy-section-card" {...fadeUp}>
                    <div className="policy-section-header">
                        <div className="policy-section-icon"><FiXCircle size={20} /></div>
                        <h2 className="policy-section-title">Not Eligible for Return</h2>
                    </div>
                    <ul className="policy-list policy-list-bullet">
                        <li>Products that have been <strong>opened, used, or sprayed</strong></li>
                        <li>Products without original packaging, tags, or seals</li>
                        <li>Items purchased during special sales or marked as "Final Sale"</li>
                        <li>Combo or bundled products if the set is incomplete</li>
                        <li>Returns initiated after the 7-day window</li>
                    </ul>
                    <div className="policy-info-box blue">
                        <span className="policy-info-box-icon">ℹ️</span>
                        <span>Perfume is a personal product. Due to hygiene reasons, we cannot accept returns on items that have been opened or used. We recommend checking the seal and packaging upon delivery.</span>
                    </div>
                </motion.div>

                {/* How to Return */}
                <motion.div className="policy-section-card" {...fadeUp}>
                    <div className="policy-section-header">
                        <div className="policy-section-icon"><FiRotateCcw size={20} /></div>
                        <h2 className="policy-section-title">How to Initiate a Return</h2>
                    </div>
                    <ol className="policy-list policy-list-num">
                        <li>Email us at <a href="mailto:support@swissgardenperfumes.com" style={{ color: 'var(--accent)', fontWeight: 600 }}>support@swissgardenperfumes.com</a> with your order number and reason for return</li>
                        <li>Attach clear photos of the product and packaging (required for damage claims)</li>
                        <li>Our team will review your request within <strong>24–48 hours</strong></li>
                        <li>If approved, we'll arrange pickup or provide return shipping instructions</li>
                        <li>Once we receive and inspect the returned product, your refund will be initiated</li>
                    </ol>
                </motion.div>

                {/* Refund Process */}
                <motion.div className="policy-section-card" {...fadeUp}>
                    <div className="policy-section-header">
                        <div className="policy-section-icon"><FiCheckCircle size={20} /></div>
                        <h2 className="policy-section-title">Refund Process & Timeline</h2>
                    </div>
                    <div className="policy-table-wrap">
                        <table className="policy-table">
                            <thead>
                                <tr>
                                    <th>Payment Method</th>
                                    <th>Refund Method</th>
                                    <th>Timeline</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>UPI / Net Banking / Wallets</td>
                                    <td>Refund to original payment source</td>
                                    <td>5 – 7 business days</td>
                                </tr>
                                <tr>
                                    <td>Credit / Debit Card</td>
                                    <td>Refund to card</td>
                                    <td>7 – 10 business days</td>
                                </tr>
                                <tr>
                                    <td>Cash on Delivery (COD)</td>
                                    <td>Bank transfer (NEFT/IMPS)</td>
                                    <td>7 – 10 business days</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="policy-text">
                        You will receive an email confirmation once your refund has been processed. If you don't receive the refund within the expected timeline, please contact your bank or payment provider first, then reach out to us.
                    </p>
                </motion.div>

                {/* Exchanges */}
                <motion.div className="policy-section-card" {...fadeUp}>
                    <div className="policy-section-header">
                        <div className="policy-section-icon"><FiAlertTriangle size={20} /></div>
                        <h2 className="policy-section-title">Exchanges</h2>
                    </div>
                    <p className="policy-text">
                        We currently <strong>do not offer direct exchanges</strong>. If you'd like a different product, please initiate a return for the original item and place a new order for the product you'd like instead.
                    </p>
                    <div className="policy-info-box green">
                        <span className="policy-info-box-icon">💡</span>
                        <span>Pro tip: Not sure which fragrance to choose? Check out our <Link to="/shop" style={{ color: 'var(--accent)', fontWeight: 600 }}>product descriptions and notes</Link> to find your perfect match before ordering.</span>
                    </div>
                </motion.div>

                {/* Contact */}
                <motion.div className="policy-contact-cta" {...fadeUp}>
                    <h3>Need Help with a Return?</h3>
                    <p>Our support team responds within 24 hours. We'll make sure your experience is seamless.</p>
                    <div className="policy-contact-links">
                        <a href="mailto:support@swissgardenperfumes.com"><FiMail size={14} /> support@swissgardenperfumes.com</a>
                        <Link to="/contact"><FiPhone size={14} /> Contact Us</Link>
                    </div>
                </motion.div>
            </div>
        </div>
    </>
);

export default ReturnPolicy;
