import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FiMail, FiMapPin, FiPhone, FiSend } from 'react-icons/fi';
import { contactAPI } from '../services/api';
import toast from 'react-hot-toast';
import './Contact.css';

const Contact = () => {
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await contactAPI.submit(form);
            toast.success('Message sent successfully!');
            setForm({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send message');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Contact Us | swissgarden Perfumes</title>
                <meta name="description" content="Get in touch with swissgarden Perfumes. We'd love to hear from you." />
            </Helmet>
            <div className="contact-page">
                <div className="container-sm">
                    <div className="section-header">
                        <span className="section-label">Get in Touch</span>
                        <h1 className="section-title">Contact Us</h1>
                        <div className="gold-divider" />
                        <p className="section-subtitle">
                            Have a question or need assistance? Our team is here to help you discover your perfect fragrance.
                        </p>
                    </div>

                    <div className="contact-grid">
                        <motion.form
                            className="contact-form"
                            onSubmit={handleSubmit}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <div className="form-group">
                                <label className="form-label">Name</label>
                                <input className="form-input" placeholder="Your full name" required
                                    value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input type="email" className="form-input" placeholder="your@email.com" required
                                    value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Subject</label>
                                <input className="form-input" placeholder="How can we help?" required
                                    value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Message</label>
                                <textarea className="form-input form-textarea" placeholder="Tell us more..." required
                                    value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                            </div>
                            <button className="btn btn-primary btn-lg" type="submit" disabled={loading}>
                                <FiSend size={16} /> {loading ? 'Sending...' : 'Send Message'}
                            </button>
                        </motion.form>

                        <motion.div className="contact-info" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <div className="contact-info-item">
                                <div className="contact-info-icon"><FiMapPin size={20} /></div>
                                <div>
                                    <h4>Visit Us</h4>
                                    <p>5th Avenue, Suite 1200<br />New York, NY 10022</p>
                                </div>
                            </div>
                            <div className="contact-info-item">
                                <div className="contact-info-icon"><FiPhone size={20} /></div>
                                <div>
                                    <h4>Call Us</h4>
                                    <p>+1 (212) 555-0187</p>
                                </div>
                            </div>
                            <div className="contact-info-item">
                                <div className="contact-info-icon"><FiMail size={20} /></div>
                                <div>
                                    <h4>Email Us</h4>
                                    <p>Contact@swissgardenperfumes.com</p>
                                </div>
                            </div>
                            <div className="contact-hours">
                                <h4>Business Hours</h4>
                                <p>Mon – Fri: 9:00 AM – 7:00 PM<br />Sat: 10:00 AM – 5:00 PM<br />Sun: Closed</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Contact;
