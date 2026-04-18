import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTruck, FiClock, FiMapPin, FiPackage, FiAlertCircle, FiMail, FiPhone } from 'react-icons/fi';
import './Policy.css';

const fadeUp = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5 } };

const ShippingPolicy = () => (
    <>
        <Helmet>
            <title>Shipping Policy | SwissGarden Perfumes</title>
            <meta name="description" content="Learn about shipping timelines, charges, delivery zones, and tracking for SwissGarden Perfumes orders across India." />
        </Helmet>
        <div className="policy-page">
            {/* Hero */}
            <section className="policy-hero">
                <div className="container-sm">
                    <motion.div {...fadeUp}>
                        <span className="section-label">Shipping Policy</span>
                        <h1 className="policy-hero-title">Delivery & Shipping</h1>
                        <div className="gold-divider" />
                        <p className="policy-hero-subtitle">
                            We deliver across India with care, speed, and reliability. Here's everything you need to know about how your order reaches you.
                        </p>
                        <div className="policy-last-updated">
                            <FiClock size={12} /> Last updated: March 2026
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Content */}
            <div className="policy-content">

                {/* Processing Time */}
                <motion.div className="policy-section-card" {...fadeUp}>
                    <div className="policy-section-header">
                        <div className="policy-section-icon"><FiClock size={20} /></div>
                        <h2 className="policy-section-title">Order Processing Time</h2>
                    </div>
                    <p className="policy-text">
                        All orders are processed within <strong>1–2 business days</strong> (Monday–Saturday, excluding public holidays). Orders placed after 5:00 PM IST will be processed the next business day.
                    </p>
                    <p className="policy-text">
                        You will receive a confirmation email with your order number immediately after placing your order, followed by a tracking update once your package is shipped.
                    </p>
                    <div className="policy-info-box gold">
                        <span className="policy-info-box-icon">💡</span>
                        <span>During festive seasons and sale events, processing may take up to <strong>3 business days</strong> due to high order volumes.</span>
                    </div>
                </motion.div>

                {/* Shipping Zones */}
                <motion.div className="policy-section-card" {...fadeUp}>
                    <div className="policy-section-header">
                        <div className="policy-section-icon"><FiMapPin size={20} /></div>
                        <h2 className="policy-section-title">Delivery Timelines & Charges</h2>
                    </div>
                    <p className="policy-text">
                        We currently ship across all states and union territories of India. Delivery timelines vary based on your location:
                    </p>
                    <div className="policy-table-wrap">
                        <table className="policy-table">
                            <thead>
                                <tr>
                                    <th>Zone</th>
                                    <th>Estimated Delivery</th>
                                    <th>Shipping Cost</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Metro Cities (Delhi, Mumbai, Bangalore, etc.)</td>
                                    <td>3 – 5 business days</td>
                                    <td>Free on orders above ₹200</td>
                                </tr>
                                <tr>
                                    <td>Tier-2 Cities (Jaipur, Lucknow, Pune, etc.)</td>
                                    <td>4 – 6 business days</td>
                                    <td>Free on orders above ₹200</td>
                                </tr>
                                <tr>
                                    <td>Rest of India (Rural & Remote areas)</td>
                                    <td>5 – 8 business days</td>
                                    <td>₹15 flat rate</td>
                                </tr>
                                <tr>
                                    <td>Northeast & Island Regions</td>
                                    <td>7 – 10 business days</td>
                                    <td>₹15 flat rate</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="policy-text">
                        <strong>Free shipping</strong> is available on all prepaid orders above ₹200. Cash on Delivery (COD) orders under ₹200 incur a flat ₹15 shipping charge.
                    </p>
                </motion.div>

                {/* Courier Partners */}
                <motion.div className="policy-section-card" {...fadeUp}>
                    <div className="policy-section-header">
                        <div className="policy-section-icon"><FiTruck size={20} /></div>
                        <h2 className="policy-section-title">Courier Partners & Tracking</h2>
                    </div>
                    <p className="policy-text">
                        We partner with trusted logistics providers to ensure safe and timely delivery:
                    </p>
                    <ul className="policy-list">
                        <li>Delhivery</li>
                        <li>Blue Dart</li>
                        <li>India Post (for remote areas)</li>
                        <li>DTDC</li>
                    </ul>
                    <p className="policy-text">
                        Once your order is shipped, you'll receive a <strong>tracking ID via SMS and email</strong>. You can also track your order anytime from your <Link to="/orders" style={{ color: 'var(--accent)', fontWeight: 600 }}>Orders page</Link>.
                    </p>
                </motion.div>

                {/* Packaging */}
                <motion.div className="policy-section-card" {...fadeUp}>
                    <div className="policy-section-header">
                        <div className="policy-section-icon"><FiPackage size={20} /></div>
                        <h2 className="policy-section-title">Packaging & Safety</h2>
                    </div>
                    <p className="policy-text">
                        Every SwissGarden product is carefully packed in <strong>leak-proof, bubble-wrapped packaging</strong> to ensure it reaches you in perfect condition. Our gift-ready boxes make each order feel special.
                    </p>
                    <ul className="policy-list">
                        <li>Leak-proof sealed bottles</li>
                        <li>Multi-layer bubble wrap protection</li>
                        <li>Tamper-evident sealed packaging</li>
                        <li>Branded gift box included with every order</li>
                    </ul>
                </motion.div>

                {/* Important Notes */}
                <motion.div className="policy-section-card" {...fadeUp}>
                    <div className="policy-section-header">
                        <div className="policy-section-icon"><FiAlertCircle size={20} /></div>
                        <h2 className="policy-section-title">Important Notes</h2>
                    </div>
                    <ul className="policy-list policy-list-bullet">
                        <li>Delivery timelines are estimates and may vary due to unforeseen circumstances (weather, strikes, courier delays).</li>
                        <li>Please ensure someone is available at the delivery address to receive the package.</li>
                        <li>For COD orders, please keep the exact amount ready at the time of delivery.</li>
                        <li>If an order is returned due to incorrect address or refusal, the customer may bear the return shipping cost.</li>
                        <li>We currently do <strong>not ship internationally</strong>. International shipping will be available soon.</li>
                    </ul>
                </motion.div>

                {/* Contact */}
                <motion.div className="policy-contact-cta" {...fadeUp}>
                    <h3>Have Questions About Your Delivery?</h3>
                    <p>Our support team is ready to help with any shipping-related queries.</p>
                    <div className="policy-contact-links">
                        <a href="mailto:support@swissgardenperfumes.com"><FiMail size={14} /> support@swissgardenperfumes.com</a>
                        <Link to="/contact"><FiPhone size={14} /> Contact Us</Link>
                    </div>
                </motion.div>
            </div>
        </div>
    </>
);

export default ShippingPolicy;
