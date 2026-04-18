import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiMapPin, FiPhone, FiSend, FiChevronDown, FiMessageSquare, FiClock, FiInstagram } from 'react-icons/fi';
import { contactAPI } from '../services/api';
import toast from 'react-hot-toast';
import './Contact.css';

const FAQS = [
    {
        q: 'How long do your fragrances last?',
        a: 'Our perfumes are formulated with high concentration oils specifically for Indian climate. Most scents last 8–10 hours on the skin and even longer on fabric.'
    },
    {
        q: 'Do you offer Cash on Delivery?',
        a: 'Yes! We offer COD (Cash on Delivery) across all major cities and towns in India. No advance payment required.'
    },
    {
        q: 'Can I return or exchange my order?',
        a: 'We accept returns within 7 days of delivery if the product is unused and in original packaging. Contact us via WhatsApp or email to initiate.'
    },
    {
        q: 'How long does delivery take?',
        a: 'Standard delivery takes 4–7 business days. Express delivery (2–3 days) is available in select cities. You\'ll receive tracking details by SMS and email.'
    },
    {
        q: 'Are your perfumes safe for sensitive skin?',
        a: 'Our formulas are crafted with skin-safe ingredients. We recommend doing a patch test before application. If you have specific allergies, contact us before ordering.'
    },
    {
        q: 'Do you offer gift wrapping?',
        a: 'Yes! Gift wrapping is available for all orders. Simply select the gift wrap option at checkout. We can also include a personalized message card.'
    },
];

const Contact = () => {
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [openFaq, setOpenFaq] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await contactAPI.submit(form);
            toast.success('Message sent! We\'ll reply within 24 hours.');
            setForm({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send message. Try WhatsApp!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Contact Us | SwissGarden Perfumes</title>
                <meta name="description" content="Get in touch with SwissGarden Perfumes. We reply within 24 hours — email, phone, or WhatsApp." />
            </Helmet>
            <div className="contact-page-new">
                {/* ── Header ── */}
                <div className="contact-hero">
                    <div className="container-sm">
                        <motion.div
                            className="contact-hero-content"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <span className="section-label">Get in Touch</span>
                            <h1 className="contact-hero-title">We'd Love to Hear from You</h1>
                            <div className="gold-divider" />
                            <p className="contact-hero-sub">
                                Questions about fragrance? Order help? Our team replies within 24 hours.
                            </p>
                        </motion.div>
                    </div>
                </div>

                {/* ── Info Cards ── */}
                <div className="contact-info-strip">
                    <div className="container-sm">
                        <div className="contact-info-cards">
                            {[
                                { icon: <FiPhone size={22} />, title: 'Call Us', detail: '+91 98765 43210', sub: 'Mon–Sat, 9AM–7PM' },
                                { icon: <FiMail size={22} />, title: 'Email Us', detail: 'contact@swissgardenperfumes.com', sub: 'Reply within 24 hours' },
                                { icon: <FiMapPin size={22} />, title: 'Visit Us', detail: 'Aerocity, New Delhi', sub: 'Worldmark 1, Suite 502' },
                                { icon: <FiInstagram size={22} />, title: 'WhatsApp', detail: '+91 98765 43210', sub: 'Quick support & orders' },
                            ].map((card, i) => (
                                <motion.div
                                    key={card.title}
                                    className="contact-info-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                >
                                    <div className="contact-info-card-icon">{card.icon}</div>
                                    <h3>{card.title}</h3>
                                    <p className="contact-info-card-detail">{card.detail}</p>
                                    <p className="contact-info-card-sub">{card.sub}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Form + Side Info ── */}
                <div className="contact-main-section">
                    <div className="container-sm">
                        <div className="contact-main-grid">
                            {/* Form */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <div className="contact-form-card">
                                    <div className="contact-form-header">
                                        <FiMessageSquare size={20} />
                                        <h2>Send Us a Message</h2>
                                    </div>
                                    <form className="contact-form-inner" onSubmit={handleSubmit}>
                                        <div className="contact-form-row">
                                            <div className="form-group">
                                                <label className="form-label">Your Name</label>
                                                <input
                                                    className="form-input"
                                                    placeholder="Rahul Sharma"
                                                    required
                                                    value={form.name}
                                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Email Address</label>
                                                <input
                                                    type="email"
                                                    className="form-input"
                                                    placeholder="you@email.com"
                                                    required
                                                    value={form.email}
                                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Subject</label>
                                            <select
                                                className="form-input form-select"
                                                value={form.subject}
                                                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                                required
                                            >
                                                <option value="">Select a topic...</option>
                                                <option value="Order Query">Order Query</option>
                                                <option value="Fragrance Advice">Fragrance Advice</option>
                                                <option value="Return / Exchange">Return / Exchange</option>
                                                <option value="Bulk / Corporate Order">Bulk / Corporate Order</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Message</label>
                                            <textarea
                                                className="form-input form-textarea"
                                                placeholder="Tell us how we can help you..."
                                                required
                                                value={form.message}
                                                onChange={(e) => setForm({ ...form, message: e.target.value })}
                                                style={{ minHeight: '140px' }}
                                            />
                                        </div>
                                        <button
                                            className="btn btn-primary btn-block"
                                            type="submit"
                                            disabled={loading}
                                        >
                                            {loading ? 'Sending...' : <><FiSend size={15} /> Send Message</>}
                                        </button>
                                    </form>
                                </div>
                            </motion.div>

                            {/* Side Info */}
                            <motion.div
                                className="contact-side-info"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                            >
                                {/* Hours */}
                                <div className="contact-hours-card">
                                    <div className="contact-hours-header">
                                        <FiClock size={18} />
                                        <h3>Business Hours</h3>
                                    </div>
                                    <div className="contact-hours-list">
                                        {[
                                            { day: 'Monday – Friday', hours: '9:00 AM – 7:00 PM' },
                                            { day: 'Saturday', hours: '10:00 AM – 5:00 PM' },
                                            { day: 'Sunday', hours: 'Closed' },
                                        ].map((item) => (
                                            <div key={item.day} className="contact-hours-row">
                                                <span className="contact-hours-day">{item.day}</span>
                                                <span className="contact-hours-time">{item.hours}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* WhatsApp CTA */}
                                <a
                                    href="https://wa.me/919876543210?text=Hello%20SwissGarden%2C%20I%20have%20a%20question"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="contact-whatsapp-btn"
                                >
                                    <span className="contact-wa-icon">💬</span>
                                    <div>
                                        <span className="contact-wa-title">Chat on WhatsApp</span>
                                        <span className="contact-wa-sub">Fastest way to reach us</span>
                                    </div>
                                </a>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* ── FAQ Section ── */}
                <div className="contact-faq-section">
                    <div className="container-sm">
                        <div className="section-header">
                            <span className="section-label">FAQ</span>
                            <h2 className="section-title">Frequently Asked Questions</h2>
                            <div className="gold-divider" />
                        </div>
                        <div className="faq-list">
                            {FAQS.map((faq, i) => (
                                <motion.div
                                    key={i}
                                    className={`faq-item ${openFaq === i ? 'open' : ''}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <button
                                        className="faq-question"
                                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    >
                                        <span>{faq.q}</span>
                                        <FiChevronDown
                                            size={18}
                                            className={`faq-chevron ${openFaq === i ? 'rotated' : ''}`}
                                        />
                                    </button>
                                    <AnimatePresence>
                                        {openFaq === i && (
                                            <motion.div
                                                className="faq-answer"
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.25 }}
                                            >
                                                <p>{faq.a}</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Contact;
