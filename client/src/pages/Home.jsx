import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FiArrowRight, FiStar, FiTruck, FiShield, FiGift } from 'react-icons/fi';
import ProductCard from '../components/product/ProductCard';
import { productsAPI } from '../services/api';
import './Home.css';

const Home = () => {
    const [featured, setFeatured] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const perks = [
        { icon: <FiTruck size={24} />, title: 'Free Shipping', desc: 'On orders over $200' },
        { icon: <FiShield size={24} />, title: 'Authenticity', desc: '100% genuine products' },
        { icon: <FiGift size={24} />, title: 'Luxury Packaging', desc: 'Gift-ready presentation' },
        { icon: <FiStar size={24} />, title: 'Exclusive Access', desc: 'Limited edition releases' },
    ];

    return (
        <>
            <Helmet>
                <title>GoldenBuck Perfumes — Luxury Fragrances | Home</title>
                <meta name="description" content="Discover exquisite luxury fragrances crafted for the discerning connoisseur. GoldenBuck Perfumes — where every scent tells a story." />
            </Helmet>

            {/* ─── Hero Section ──────────────────────────────────── */}
            <section className="hero">
                <div className="hero-bg" />
                <div className="hero-particles">
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="particle" style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${3 + Math.random() * 4}s`,
                        }} />
                    ))}
                </div>
                <div className="container hero-content">
                    <motion.div
                        className="hero-text"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="hero-label">The Art of Perfumery</span>
                        <h1 className="hero-title">
                            Discover Your
                            <span className="hero-title-accent"> Signature </span>
                            Scent
                        </h1>
                        <p className="hero-subtitle">
                            Immerse yourself in a world of exquisite luxury fragrances,
                            meticulously crafted from the finest ingredients sourced across the globe.
                        </p>
                        <div className="hero-buttons">
                            <Link to="/shop" className="btn btn-primary btn-lg">
                                Explore Collection <FiArrowRight size={16} />
                            </Link>
                            <Link to="/about" className="btn btn-outline btn-lg">
                                Our Story
                            </Link>
                        </div>
                    </motion.div>

                    <motion.div
                        className="hero-visual"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.3 }}
                    >
                        <div className="hero-image-wrapper">
                            <img
                                src="https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80"
                                alt="Luxury Perfume"
                                className="hero-image"
                            />
                            <div className="hero-image-glow" />
                        </div>
                    </motion.div>
                </div>

                <div className="hero-scroll-indicator">
                    <div className="scroll-line" />
                </div>
            </section>

            {/* ─── Perks Strip ───────────────────────────────────── */}
            <section className="perks-section">
                <div className="container">
                    <div className="perks-grid">
                        {perks.map((perk, i) => (
                            <motion.div
                                key={perk.title}
                                className="perk-item"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="perk-icon">{perk.icon}</div>
                                <div>
                                    <h4 className="perk-title">{perk.title}</h4>
                                    <p className="perk-desc">{perk.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Featured Products ─────────────────────────────── */}
            <section className="section">
                <div className="container">
                    <div className="section-header">
                        <span className="section-label">Curated Selection</span>
                        <h2 className="section-title">Featured Fragrances</h2>
                        <div className="gold-divider" />
                        <p className="section-subtitle">
                            Discover our most coveted creations — masterfully blended compositions
                            that embody luxury, elegance, and timeless sophistication.
                        </p>
                    </div>

                    {loading ? (
                        <div className="page-loader" style={{ minHeight: '30vh' }}>
                            <div className="spinner" />
                        </div>
                    ) : (
                        <div className="grid-products">
                            {featured.slice(0, 8).map((product, i) => (
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

            {/* ─── Brand Story Section ───────────────────────────── */}
            <section className="story-section">
                <div className="container">
                    <div className="story-grid">
                        <motion.div
                            className="story-image"
                            initial={{ opacity: 0, x: -40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                        >
                            <img
                                src="https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=600&q=80"
                                alt="The Art of Perfumery"
                            />
                        </motion.div>
                        <motion.div
                            className="story-content"
                            initial={{ opacity: 0, x: 40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                        >
                            <span className="section-label">Our Heritage</span>
                            <h2 className="section-title" style={{ textAlign: 'left' }}>
                                A Legacy of Luxury
                            </h2>
                            <div className="gold-divider" style={{ margin: '1.5rem 0' }} />
                            <p className="story-text">
                                Since 1987, GoldenBuck Perfumes has been at the forefront of luxury fragrance creation.
                                Our master perfumers travel the world to source the rarest ingredients — from the ancient
                                oud forests of Laos to the rose fields of Grasse, France.
                            </p>
                            <p className="story-text">
                                Each fragrance in our collection is a work of art, painstakingly composed over months to
                                achieve perfect harmony between notes. We believe that scent is the most intimate form
                                of self-expression — a silent signature that speaks volumes.
                            </p>
                            <Link to="/about" className="btn btn-outline">
                                Discover Our Story <FiArrowRight size={14} />
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ─── Categories ────────────────────────────────────── */}
            <section className="section">
                <div className="container">
                    <div className="section-header">
                        <span className="section-label">Collections</span>
                        <h2 className="section-title">Shop by Category</h2>
                        <div className="gold-divider" />
                    </div>
                    <div className="categories-grid">
                        {[
                            { name: 'For Her', image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=400&q=80', link: '/shop?gender=Women' },
                            { name: 'For Him', image: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&q=80', link: '/shop?gender=Men' },
                            { name: 'Gift Sets', image: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400&q=80', link: '/shop?category=Gift Set' },
                            { name: 'Unisex', image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400&q=80', link: '/shop?gender=Unisex' },
                        ].map((cat, i) => (
                            <motion.div
                                key={cat.name}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Link to={cat.link} className="category-card">
                                    <img src={cat.image} alt={cat.name} />
                                    <div className="category-card-overlay">
                                        <h3 className="category-card-title">{cat.name}</h3>
                                        <span className="category-card-cta">
                                            Shop Now <FiArrowRight size={14} />
                                        </span>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Newsletter ────────────────────────────────────── */}
            <section className="newsletter-section">
                <div className="container">
                    <motion.div
                        className="newsletter-content"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="section-label">Stay Connected</span>
                        <h2 className="section-title">Join the GoldenBuck Circle</h2>
                        <p className="section-subtitle">
                            Be the first to discover new launches, exclusive offers, and the stories behind our most coveted creations.
                        </p>
                        <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="email"
                                className="newsletter-input"
                                placeholder="Enter your email address"
                            />
                            <button type="submit" className="btn btn-primary">
                                Subscribe
                            </button>
                        </form>
                    </motion.div>
                </div>
            </section>
        </>
    );
};

export default Home;
