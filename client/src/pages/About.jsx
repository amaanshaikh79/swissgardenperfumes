import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiDroplet, FiGlobe, FiAward, FiArrowRight, FiUsers, FiPackage, FiStar } from 'react-icons/fi';
import './About.css';

const About = () => {
    const values = [
        { icon: <FiDroplet size={24} />, title: 'Finest Ingredients', desc: 'We source the rarest, most exquisite raw materials from across the globe — from oud in the Middle East to florals from India\'s own valleys.' },
        { icon: <FiHeart size={24} />, title: 'Crafted with Passion', desc: 'Every fragrance is a labor of love, composed with patience and an eye for detail that takes weeks to perfect.' },
        { icon: <FiGlobe size={24} />, title: 'Made for India', desc: 'Our formulas are climate-adapted — tested to perform beautifully in India\'s humidity, heat, and diverse conditions.' },
        { icon: <FiAward size={24} />, title: 'Accessible Luxury', desc: 'Luxury fragrance shouldn\'t be reserved for a few. We bring premium quality to every budget without compromise.' },
    ];

    const stats = [
        { number: '15K+', label: 'Happy Customers', icon: <FiUsers size={20} /> },
        { number: '50+', label: 'Unique Fragrances', icon: <FiDroplet size={20} /> },
        { number: '4.7★', label: 'Avg. Rating', icon: <FiStar size={20} /> },
        { number: '2,400+', label: 'Reviews', icon: <FiPackage size={20} /> },
    ];

    const timeline = [
        { year: '2026', title: 'Founded in Delhi', desc: 'SwissGarden Perfumes was born in the heart of Delhi with a simple dream — luxury fragrance for everyone.' },
        { year: '2026', title: 'First Collection', desc: 'Our debut collection of 12 fragrances sold out within weeks, proving the demand for quality at smart prices.' },
        { year: '2026', title: 'Pan-India Shipping', desc: 'Expanded delivery to every corner of India — from metros to Tier-2 cities — with COD support.' },
        { year: '2026', title: '15,000+ Customers', desc: 'Reached a community of over 15,000 fragrance lovers who trust SwissGarden for their signature scent.' },
    ];

    const team = [
        { name: 'Amaan', role: 'Founder & Head Perfumer', emoji: '🌿', bio: 'Passionate about fragrances from a young age, Amaan built SwissGarden to make luxury accessible to all Indians.' },
        { name: 'Fragrance Team', role: 'Master Blenders', emoji: '⚗️', bio: 'Our team of expert blenders craft each scent with precision, ensuring every bottle is a masterpiece.' },
    ];

    return (
        <>
            <Helmet>
                <title>Our Story | SwissGarden Perfumes</title>
                <meta name="description" content="Discover the story behind SwissGarden Perfumes — luxury inspired fragrances crafted in Delhi for every Indian." />
            </Helmet>
            <div className="about-page">
                {/* ── Hero ── */}
                <section className="about-hero-section">
                    <div className="container-sm">
                        <motion.div
                            className="about-hero-content"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <span className="section-label">Our Story</span>
                            <h1 className="about-hero-title">The Art of SwissGarden</h1>
                            <div className="gold-divider" />
                            <p className="about-hero-subtitle">
                                Born in Delhi. Crafted for India. Loved Everywhere.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* ── Brand Story ── */}
                <section className="about-story-section">
                    <div className="container-sm">
                        <div className="about-story-grid">
                            <motion.div
                                className="about-story-text"
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                <span className="section-label">Who We Are</span>
                                <h2 className="about-story-title">Luxury Fragrance,<br />Made for Every Indian</h2>
                                <p>
                                    Founded in 2026 in the heart of Delhi, SwissGarden Perfumes was created with one powerful belief — that luxury fragrance should not be a privilege of the few. We believe that a beautiful scent is an expression of your identity, your mood, and your confidence.
                                </p>
                                <p>
                                    Every perfume in our collection is carefully crafted using high-concentration fragrance oils sourced from around the world — rich oud from the Middle East, fresh lavender from France, delicate roses from Bulgaria, and warm vanilla from Madagascar. Combined with Indian expertise, each bottle is a sensory masterpiece.
                                </p>
                                <p>
                                    Our philosophy is simple: you deserve to smell extraordinary without spending a fortune. SwissGarden brings you inspired interpretations of iconic fragrances, adapted for Indian skin and climate — so every spray lasts, every time.
                                </p>
                                <Link to="/shop" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
                                    Shop Our Collection <FiArrowRight size={16} />
                                </Link>
                            </motion.div>

                            <motion.div
                                className="about-story-visual"
                                initial={{ opacity: 0, x: 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                            >
                                <div className="about-visual-card">
                                    <div className="about-visual-icon">🌿</div>
                                    <h3>SwissGarden Promise</h3>
                                    <ul className="about-promise-list">
                                        {[
                                            'High oil concentration — 8–10 hr lasting',
                                            'Indian climate tested & approved',
                                            'Inspired by iconic luxury scents',
                                            'Accessible pricing — from ₹499',
                                            'COD available pan-India',
                                            'No harmful chemicals',
                                            '7-day customer support',
                                        ].map((item) => (
                                            <li key={item}>
                                                <span className="about-promise-check">✓</span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* ── Stats ── */}
                <section className="about-stats-section">
                    <div className="container">
                        <div className="about-stats-grid">
                            {stats.map((stat, i) => (
                                <motion.div
                                    key={stat.label}
                                    className="about-stat-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <div className="about-stat-icon">{stat.icon}</div>
                                    <div className="about-stat-number">{stat.number}</div>
                                    <div className="about-stat-label">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Values ── */}
                <section className="about-values-section">
                    <div className="container-sm">
                        <div className="section-header">
                            <span className="section-label">What Drives Us</span>
                            <h2 className="section-title">Our Core Values</h2>
                            <div className="gold-divider" />
                        </div>
                        <div className="about-values-grid-new">
                            {values.map((val, i) => (
                                <motion.div
                                    key={val.title}
                                    className="about-value-card-new"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <div className="about-value-icon-new">{val.icon}</div>
                                    <h3>{val.title}</h3>
                                    <p>{val.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── Timeline ── */}
                <section className="about-timeline-section">
                    <div className="container-sm">
                        <div className="section-header">
                            <span className="section-label">Our Journey</span>
                            <h2 className="section-title">How We Got Here</h2>
                            <div className="gold-divider" />
                        </div>
                        <div className="about-timeline">
                            {timeline.map((item, i) => (
                                <motion.div
                                    key={i}
                                    className="about-timeline-item"
                                    initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.12 }}
                                >
                                    <div className="about-timeline-dot">
                                        <span>{item.year}</span>
                                    </div>
                                    <div className="about-timeline-content">
                                        <h3>{item.title}</h3>
                                        <p>{item.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── CTA ── */}
                <section className="about-cta-section">
                    <div className="container-sm">
                        <motion.div
                            className="about-cta-box"
                            initial={{ opacity: 0, scale: 0.97 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                        >
                            <span className="section-label">Join the SwissGarden Family</span>
                            <h2>Find Your Signature Scent</h2>
                            <p>Over 15,000 customers have found their perfect fragrance. It's your turn.</p>
                            <div className="about-cta-buttons">
                                <Link to="/shop" className="btn btn-white btn-lg">
                                    Shop Now <FiArrowRight size={16} />
                                </Link>
                                <Link to="/contact" className="btn btn-outline-accent btn-lg" style={{ borderColor: 'rgba(255,255,255,0.5)', color: '#fff' }}>
                                    Contact Us
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default About;
