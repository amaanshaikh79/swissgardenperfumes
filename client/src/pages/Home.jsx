import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
    FiArrowRight, FiStar, FiCheck, FiShield, FiClock,
    FiTruck, FiDroplet, FiHeart, FiSend, FiPhoneCall
} from 'react-icons/fi';
import ProductCard from '../components/product/ProductCard';
import { productsAPI } from '../services/api';
import './Home.css';

const Home = () => {
    const [featured, setFeatured] = useState([]);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [emailSubmitted, setEmailSubmitted] = useState(false);

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const { data } = await productsAPI.getFeatured();
                setFeatured(data.products);
            } catch (error) {
                console.error('Failed to fetch featured products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchFeatured();
    }, []);

    const handleEmailSubmit = (e) => {
        e.preventDefault();
        if (email.trim()) {
            setEmailSubmitted(true);
            setEmail('');
            setTimeout(() => setEmailSubmitted(false), 5000);
        }
    };

    const moods = [
        { name: 'Fresh & Clean', emoji: '🍋', link: '/shop?family=Fresh', desc: 'Crisp & energetic' },
        { name: 'Bold & Woody', emoji: '🌲', link: '/shop?family=Woody', desc: 'Confidence in a bottle' },
        { name: 'Sweet & Warm', emoji: '🍦', link: '/shop?family=Sweet', desc: 'Cozy & inviting' },
        { name: 'Oud & Intense', emoji: '🦅', link: '/shop?family=Oud', desc: 'Rich & luxurious' },
        { name: 'Office Ready', emoji: '💼', link: '/shop?occasion=Office', desc: 'Professional & subtle' },
        { name: 'Night Out', emoji: '🥂', link: '/shop?occasion=Party', desc: 'Make a statement' },
    ];

    const comparisonItems = [
        { designer: '₹7,500 – ₹12,000', ours: '₹499 – ₹1,299', label: 'Price' },
        { designer: 'Imported pricing', ours: 'Indian optimized', label: 'Pricing Model' },
        { designer: '~20% oil concentration', ours: 'High concentration oils', label: 'Concentration' },
        { designer: 'Expensive branding', ours: 'Smart pricing', label: 'Value' },
    ];

    const whyChooseFeatures = [
        { icon: <FiDroplet size={24} />, title: 'High Oil Concentration', desc: 'Lasts 8-10 hours' },
        { icon: <FiSun size={24} />, title: 'Indian Climate Ready', desc: 'Performs in humidity' },
        { icon: <FiStar size={24} />, title: 'Luxury Profiles', desc: 'Inspired by icons' },
        { icon: <FiCheck size={24} />, title: 'Accessible Pricing', desc: 'luxury for everyone' },
    ];

    const combos = [
        {
            title: 'Buy 2, Save ₹200',
            desc: 'Pick any 2 fragrances and save instantly',
            savings: '₹200',
            tag: 'Most Popular',
            link: '/shop?tag=combo',
        },
        {
            title: 'Buy 3, Save ₹400',
            desc: 'Build your collection with bigger savings',
            savings: '₹400',
            tag: 'Best Value',
            link: '/shop?tag=combo',
        },
        {
            title: 'Gift Sets',
            desc: 'Ready-wrapped premium gift sets',
            savings: 'From ₹999',
            tag: 'Gift Ready',
            link: '/shop?category=Gift Set',
        },
    ];

    const reviews = [
        {
            name: 'Rahul S.',
            location: 'Mumbai',
            rating: 5,
            text: 'Honestly shocked at the quality for this price. The oud one lasts 10+ hours on me. Already ordered 3 more.',
            tag: 'Repeat Buyer',
        },
        {
            name: 'Priya M.',
            location: 'Delhi',
            rating: 5,
            text: 'Got the combo deal — best decision ever. My friends thought I was wearing a designer brand! 🤫',
            tag: 'Most Helpful',
        },
        {
            name: 'Arjun K.',
            location: 'Bangalore',
            rating: 5,
            text: 'COD made it easy to try. Now I\'m a regular. The date night one is literally a compliment magnet.',
            tag: 'Verified Purchase',
        },
        {
            name: 'Sneha R.',
            location: 'Hyderabad',
            rating: 4,
            text: 'The scent profile is incredibly close to the inspirations. Amazing value for the quality — reordered within a week!',
            tag: 'Verified Purchase',
        },
    ];

    const trustFeatures = [
        { icon: <FiClock size={28} />, title: '8–10 Hr Lasting', desc: 'High oil concentration formula' },
        { icon: <FiDroplet size={28} />, title: 'Skin Safe', desc: 'Dermatologically tested' },
        { icon: <FiTruck size={28} />, title: 'COD Available', desc: 'Cash on delivery pan-India' },
        { icon: <FiShield size={28} />, title: 'Secure Payments', desc: 'UPI, Cards, Net Banking' },
        { icon: <FiPhoneCall size={28} />, title: '7 Day Support', desc: 'WhatsApp + Phone support' },
    ];

    return (
        <>
            <Helmet>
                <title>GoldenBuck Perfumes — Luxury Inspired Scents at Smart Prices | India</title>
                <meta name="description" content="Premium fragrance profiles inspired by iconic scents — crafted for everyday wear in India. Shop bestsellers from ₹499. COD Available. 8–10 hour lasting." />
            </Helmet>

            {/* ─── Hero Section ──────────────────────────────────── */}
            <section className="hero">
                <div className="container">
                    <motion.div
                        className="hero-content"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="hero-badge">🇮🇳 Made in India</span>
                        <h1 className="hero-title">
                            Luxury Inspired Scents.
                            <br />
                            <span className="hero-title-accent">Smart Prices.</span>
                        </h1>
                        <p className="hero-subtitle">
                            Inspired interpretations crafted for Indian climate.
                        </p>
                        <div className="hero-buttons">
                            <Link to="/shop?tag=bestseller" className="btn btn-primary btn-lg">
                                Shop Bestsellers <FiArrowRight size={16} />
                            </Link>
                            <Link to="/shop?tag=combo" className="btn btn-outline btn-lg">
                                Explore Combos
                            </Link>
                        </div>
                        <div className="hero-price-tag">
                            Starting at <span className="hero-price">₹499</span>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ─── Bestsellers Section ─────────────────────────────── */}
            <section className="section" id="bestsellers">
                <div className="container">
                    <div className="section-header">
                        <span className="section-label">Most Loved</span>
                        <h2 className="section-title">Bestsellers</h2>
                        <p className="section-subtitle">
                            Our most reordered scents — trusted by thousands of smart buyers across India.
                        </p>
                    </div>

                    {loading ? (
                        <div className="page-loader" style={{ minHeight: '30vh' }}>
                            <div className="spinner" />
                        </div>
                    ) : (
                        <div className="grid-products">
                            {featured.slice(0, 4).map((product, i) => (
                                <ProductCard key={product._id} product={product} index={i} />
                            ))}
                        </div>
                    )}

                    <div className="section-cta">
                        <Link to="/shop" className="btn btn-outline btn-lg">
                            View All Fragrances <FiArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ─── Shop by Mood ───────────────────────────────── */}
            <section className="section section-gray">
                <div className="container">
                    <div className="section-header">
                        <span className="section-label">Find Your Vibe</span>
                        <h2 className="section-title">Shop by Mood</h2>
                    </div>
                    <div className="categories-grid">
                        {moods.map((mood, i) => (
                            <motion.div
                                key={mood.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.06 }}
                            >
                                <Link to={mood.link} className="category-tile">
                                    <span className="category-tile-emoji">{mood.emoji}</span>
                                    <h3 className="category-tile-name">{mood.name}</h3>
                                    <p className="category-tile-desc">{mood.desc}</p>
                                    <FiArrowRight className="category-tile-arrow" size={16} />
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Why Choose GoldenBuck ──────────────────────────── */}
            <section className="section">
                <div className="container">
                    <div className="section-header">
                        <span className="section-label">The GoldenBuck Standard</span>
                        <h2 className="section-title">Why Choose GoldenBuck?</h2>
                    </div>
                    <div className="why-choose-grid">
                        {whyChooseFeatures.map((feature, i) => (
                            <motion.div
                                key={feature.title}
                                className="trust-feature"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08 }}
                            >
                                <div className="trust-feature-icon" style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>
                                    {feature.icon}
                                </div>
                                <h4 className="trust-feature-title" style={{ color: 'var(--text-primary)', fontSize: '1.1rem' }}>{feature.title}</h4>
                                <p className="trust-feature-desc" style={{ color: 'var(--text-secondary)' }}>{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Comparison Section (High Conversion) ───────────── */}
            <section className="section comparison-section">
                <div className="container">
                    <div className="section-header">
                        <span className="section-label">Smart Comparison</span>
                        <h2 className="section-title">Smell Premium. Spend Smart.</h2>
                        <p className="section-subtitle">
                            Same quality fragrance profiles. Fraction of the price. Made for India.
                        </p>
                    </div>

                    <div className="comparison-table">
                        <div className="comparison-header">
                            <div className="comparison-label-col"></div>
                            <div className="comparison-col comparison-col--designer">
                                <span className="comparison-col-title">Designer Brands</span>
                            </div>
                            <div className="comparison-col comparison-col--ours">
                                <span className="comparison-col-title">GoldenBuck ✨</span>
                            </div>
                        </div>
                        {comparisonItems.map((item, i) => (
                            <motion.div
                                key={item.label}
                                className="comparison-row"
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="comparison-label-col">
                                    <span className="comparison-label">{item.label}</span>
                                </div>
                                <div className="comparison-col comparison-col--designer">
                                    <span className="comparison-value comparison-value--bad">{item.designer}</span>
                                </div>
                                <div className="comparison-col comparison-col--ours">
                                    <span className="comparison-value comparison-value--good">
                                        <FiCheck size={14} /> {item.ours}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                        <div className="comparison-cta">
                            <Link to="/shop" className="btn btn-primary btn-lg">
                                Shop Smart Now <FiArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Combo Deals Section ─────────────────────────────── */}
            <section className="section section-gray" id="combos">
                <div className="container">
                    <div className="section-header">
                        <span className="section-label">Save More</span>
                        <h2 className="section-title">Combo Deals</h2>
                        <p className="section-subtitle">
                            Build your fragrance collection and save big. More you buy, more you save.
                        </p>
                    </div>
                    <div className="combos-grid">
                        {combos.map((combo, i) => (
                            <motion.div
                                key={combo.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Link to={combo.link} className="combo-card">
                                    <span className="combo-tag">{combo.tag}</span>
                                    <h3 className="combo-title">{combo.title}</h3>
                                    <p className="combo-desc">{combo.desc}</p>
                                    <div className="combo-savings">
                                        <span className="combo-savings-label">SAVE</span>
                                        <span className="combo-savings-amount">{combo.savings}</span>
                                    </div>
                                    <span className="combo-cta">
                                        Shop Now <FiArrowRight size={14} />
                                    </span>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Social Proof Section ────────────────────────────── */}
            <section className="section" id="reviews">
                <div className="container">
                    <div className="section-header">
                        <div className="rating-display">
                            <span className="rating-number">4.7</span>
                            <div className="rating-stars">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <FiStar key={s} size={18} fill={s <= 4 ? 'currentColor' : 'none'} />
                                ))}
                            </div>
                            <span className="rating-count">2,400+ Reviews</span>
                        </div>
                        <h2 className="section-title">What Customers Say</h2>
                        <div className="reorder-tag">
                            <FiHeart size={14} /> Most Reordered Scents
                        </div>
                    </div>

                    <div className="reviews-grid">
                        {reviews.map((review, i) => (
                            <motion.div
                                key={i}
                                className="review-card"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08 }}
                            >
                                <div className="review-card-top">
                                    <div className="review-stars">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <FiStar
                                                key={s}
                                                size={14}
                                                fill={s <= review.rating ? 'currentColor' : 'none'}
                                            />
                                        ))}
                                    </div>
                                    <span className="review-tag">{review.tag}</span>
                                </div>
                                <p className="review-text">"{review.text}"</p>
                                <div className="review-author">
                                    <div className="review-avatar">
                                        {review.name.charAt(0)}
                                    </div>
                                    <div>
                                        <span className="review-name">{review.name}</span>
                                        <span className="review-location">{review.location}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Trust Section ───────────────────────────────────── */}
            <section className="section section-dark">
                <div className="container">
                    <div className="trust-grid">
                        {trustFeatures.map((feature, i) => (
                            <motion.div
                                key={feature.title}
                                className="trust-feature"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08 }}
                            >
                                <div className="trust-feature-icon">{feature.icon}</div>
                                <h4 className="trust-feature-title">{feature.title}</h4>
                                <p className="trust-feature-desc">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Email Capture Section ───────────────────────────── */}
            <section className="section email-capture-section">
                <div className="container">
                    <motion.div
                        className="email-capture"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="email-capture-badge">🎁 EXCLUSIVE OFFER</span>
                        <h2 className="email-capture-title">
                            Get <span className="email-capture-highlight">10% OFF</span> Your First Order
                        </h2>
                        <p className="email-capture-desc">
                            Join 15,000+ smart fragrance lovers. Get exclusive deals, early access & more.
                        </p>
                        {emailSubmitted ? (
                            <div className="email-capture-success">
                                <FiCheck size={20} />
                                <span>Welcome! Check your email for your 10% discount code.</span>
                            </div>
                        ) : (
                            <form className="email-capture-form" onSubmit={handleEmailSubmit}>
                                <input
                                    type="email"
                                    className="email-capture-input"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <button type="submit" className="btn btn-primary">
                                    Get 10% Off <FiSend size={14} />
                                </button>
                            </form>
                        )}
                        <p className="email-capture-privacy">No spam. Unsubscribe anytime.</p>
                    </motion.div>
                </div>
            </section>
        </>
    );
};

export default Home;
