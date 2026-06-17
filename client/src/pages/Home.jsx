import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
    FiArrowRight, FiStar, FiCheck, FiSend, FiChevronLeft, FiChevronRight,
    FiDroplet, FiWind, FiFeather, FiSun
} from 'react-icons/fi';
import ProductCard from '../components/product/ProductCard';
import LazyImage from '../components/common/LazyImage';
import { productsAPI } from '../services/api';
import './Home.css';

const Home = () => {
    const [featured, setFeatured] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [emailSubmitted, setEmailSubmitted] = useState(false);
    const [carouselIndex, setCarouselIndex] = useState(0);
    const [heroSlide, setHeroSlide] = useState(0);
    const heroRef = useRef(null);

    const heroImages = [
        '/Images/Alpine Savage(2).JPG',
        '/Images/Royal Ascent(2).JPG',
        '/Images/Swiss Flora(2).JPG',
        '/Images/Blue Dominion(2).JPG',
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setHeroSlide((prev) => (prev + 1) % heroImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [heroImages.length]);

    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ['start start', 'end start'],
    });
    const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const { data } = await productsAPI.getFeatured();
                setFeatured(data.products || []);
            } catch (error) {
                console.error('Failed to fetch featured products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchFeatured();
    }, []);

    useEffect(() => {
        const fetchAllProducts = async () => {
            try {
                const { data } = await productsAPI.getAll({ limit: 50 });
                setAllProducts(data.products || []);
            } catch (error) {
                console.error('Failed to fetch all products:', error);
            }
        };
        fetchAllProducts();
    }, []);

    const handleEmailSubmit = (e) => {
        e.preventDefault();
        if (email.trim()) {
            setEmailSubmitted(true);
            setEmail('');
            setTimeout(() => setEmailSubmitted(false), 5000);
        }
    };


    const spotlightCollections = [
        {
            name: 'The Noir Edit',
            mood: 'Dark. Mysterious. Unforgettable.',
            image: '/Images/Royal Ascent.JPG',
            link: '/shop?fragranceFamily=Oriental',
        },
        {
            name: 'Garden Botanicals',
            mood: 'Fresh florals meet crisp greens.',
            image: '/Images/Swiss Flora.JPG',
            link: '/shop?fragranceFamily=Floral',
        },
        {
            name: 'Oud Heritage',
            mood: 'Rich. Regal. Timeless.',
            image: '/Images/Alpine Savage.JPG',
            link: '/shop?fragranceFamily=Woody',
        },
    ];

    const craftSteps = [
        { icon: <FiDroplet size={28} />, title: 'Sourced Globally', desc: 'Rare oils from Grasse, Mysore sandalwood, Bulgarian roses, and Cambodian oud — sourced at origin.' },
        { icon: <FiWind size={28} />, title: 'Blended by Hand', desc: 'Each composition is layered by our master perfumer, balanced note by note over weeks of refinement.' },
        { icon: <FiFeather size={28} />, title: 'Climate-Tuned', desc: 'Formulations tested in Indian heat and humidity — so every scent lasts and projects beautifully.' },
        { icon: <FiSun size={28} />, title: 'Bottled with Care', desc: 'Hand-filled, sealed, and inspected. Every bottle is a promise of quality you can smell.' },
    ];

    const reviews = [
        { name: 'Rahul S.', location: 'Mumbai', rating: 5, text: 'Honestly shocked at the quality. The oud one lasts 10+ hours on me. Already ordered 3 more.', tag: 'Repeat Buyer' },
        { name: 'Priya M.', location: 'Delhi', rating: 5, text: 'My friends thought I was wearing a designer brand. This is luxury without the guilt.', tag: 'Most Helpful' },
        { name: 'Arjun K.', location: 'Bangalore', rating: 5, text: 'The date night scent is literally a compliment magnet. Projection and longevity are insane.', tag: 'Verified Purchase' },
        { name: 'Sneha R.', location: 'Hyderabad', rating: 4, text: 'The scent profile is incredibly close to the inspirations. Reordered within a week.', tag: 'Verified Purchase' },
    ];

    const bestsellers = featured.length > 0 ? featured : [];
    const carouselMax = Math.max(0, bestsellers.length - 4);
    const nextSlide = () => setCarouselIndex((prev) => Math.min(prev + 1, carouselMax));
    const prevSlide = () => setCarouselIndex((prev) => Math.max(prev - 1, 0));

    return (
        <>
            <Helmet>
                <title>SwissGarden Perfumes — Luxury Crafted Fragrances | India</title>
                <meta name="description" content="Artisan-crafted luxury fragrances inspired by iconic scents. Rare ingredients, Indian-climate tested. Discover your signature scent." />
            </Helmet>

            {/* ─── Banner Hero ─────────────────────────────────────── */}
            <section className="home-hero" ref={heroRef}>
                <AnimatePresence mode="sync">
                    <motion.div
                        key={heroSlide}
                        className="home-hero-bg"
                        initial={{ opacity: 0, scale: 1.04 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.2, ease: 'easeInOut' }}
                    >
                        <LazyImage
                            src={heroImages[heroSlide]}
                            alt="SwissGarden luxury perfume collection"
                            className="home-hero-img"
                        />
                    </motion.div>
                </AnimatePresence>
                
                <div className="home-hero-overlay"></div>
                
                <motion.div
                    className="home-hero-content"
                    style={{ opacity: heroOpacity }}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, ease: 'easeOut', delay: 0.3 }}
                >
                    <motion.span
                        className="home-hero-label"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.5 }}
                    >
                        THE ART OF FRAGRANCE
                    </motion.span>

                    <motion.h1
                        className="home-hero-title"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.7 }}
                    >
                        Scent is the
                        <br />
                        <em>invisible signature</em>
                        <br />
                        of the soul.
                    </motion.h1>

                    <motion.div
                        className="home-hero-scroll-hint"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 1.2 }}
                    >
                        SCROLL TO DISCOVER
                        <div className="scroll-line"></div>
                    </motion.div>

                    <motion.div
                        className="home-hero-cta"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.9 }}
                    >
                        <Link to="/shop" className="btn btn-light btn-lg">
                            EXPLORE COLLECTION <FiArrowRight size={16} />
                        </Link>
                        <Link to="/fragrance-finder" className="btn btn-outline-light btn-lg">
                            FIND YOUR SCENT
                        </Link>
                    </motion.div>
                </motion.div>
            </section>


            {/* ─── Brand Philosophy ───────────────────────────────── */}
            <section className="home-philosophy">
                <div className="container-sm">
                    <motion.p
                        className="home-philosophy-text"
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-100px' }}
                        transition={{ duration: 0.8 }}
                    >
                        We believe luxury is not a price tag — it is the <em>intention</em> behind every drop, every note, every breath.
                    </motion.p>
                </div>
            </section>

            {/* ─── Craft & Ingredients Storytelling ───────────────── */}
            <section className="home-craft section">
                <div className="container-sm">
                    <div className="section-header">
                        <span className="section-label">The Craft</span>
                        <h2 className="section-title">From Raw Ingredient to Your Skin</h2>
                        <p className="section-subtitle">
                            Each bottle holds months of sourcing, blending, and refinement — a slow craft in a fast world.
                        </p>
                    </div>
                    <div className="home-craft-grid">
                        {craftSteps.map((step, i) => (
                            <motion.div
                                key={step.title}
                                className="home-craft-card"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.12, duration: 0.6 }}
                            >
                                <div className="home-craft-icon">{step.icon}</div>
                                <span className="home-craft-step">0{i + 1}</span>
                                <h3 className="home-craft-title">{step.title}</h3>
                                <p className="home-craft-desc">{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── All Products Grid ───────────────────────────────── */}
            <section className="home-all-products section">
                <div className="container">
                    <div className="section-header">
                        <span className="section-label">Shop</span>
                        <h2 className="section-title">All Products</h2>
                        <p className="section-subtitle">
                            Explore our complete collection of artisan-crafted fragrances
                        </p>
                    </div>
                    {allProducts.length > 0 ? (
                        <div className="home-products-grid">
                            {allProducts.map((product, i) => (
                                <motion.div
                                    key={product._id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.05, duration: 0.4 }}
                                >
                                    <ProductCard product={product} />
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="home-empty-state">
                            <p>No products available at the moment.</p>
                            <Link to="/shop" className="btn btn-primary">Check Shop Page</Link>
                        </div>
                    )}
                </div>
            </section>

            {/* ─── Featured Collection Spotlight ──────────────────── */}
            <section className="home-spotlight section">
                <div className="container">
                    <div className="section-header">
                        <span className="section-label">Collections</span>
                        <h2 className="section-title">Curated for Every Mood</h2>
                    </div>
                    <div className="home-spotlight-grid">
                        {spotlightCollections.map((col, i) => (
                            <motion.div
                                key={col.name}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.15, duration: 0.6 }}
                            >
                                <Link to={col.link} className="home-spotlight-card">
                                    <div className="home-spotlight-image">
                                        <LazyImage src={col.image} alt={col.name} />
                                        <div className="home-spotlight-overlay" />
                                    </div>
                                    <div className="home-spotlight-info">
                                        <h3>{col.name}</h3>
                                        <p>{col.mood}</p>
                                        <span className="home-spotlight-link">
                                            Explore <FiArrowRight size={14} />
                                        </span>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Bestsellers Carousel ───────────────────────────── */}
            <section className="home-bestsellers section section-gray">
                <div className="container">
                    <div className="home-bestsellers-header">
                        <div>
                            <span className="section-label">Most Loved</span>
                            <h2 className="section-title">Bestsellers</h2>
                        </div>
                        {bestsellers.length > 4 && (
                            <div className="home-carousel-nav">
                                <button className="home-carousel-btn" onClick={prevSlide} disabled={carouselIndex === 0}>
                                    <FiChevronLeft size={20} />
                                </button>
                                <button className="home-carousel-btn" onClick={nextSlide} disabled={carouselIndex >= carouselMax}>
                                    <FiChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </div>

                    {loading ? (
                        <div className="page-loader" style={{ minHeight: '30vh' }}>
                            <div className="spinner" />
                        </div>
                    ) : (
                        <div className="home-carousel-track-wrapper">
                            <motion.div
                                className="home-carousel-track"
                                animate={{ x: `-${carouselIndex * 25}%` }}
                                transition={{ type: 'spring', stiffness: 200, damping: 30 }}
                            >
                                {bestsellers.map((product, i) => (
                                    <div className="home-carousel-slide" key={product._id}>
                                        <ProductCard product={product} index={i} />
                                    </div>
                                ))}
                            </motion.div>
                        </div>
                    )}

                    <div className="section-cta">
                        <Link to="/shop" className="btn btn-outline btn-lg">
                            View All Fragrances <FiArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ─── Newsletter + Fragrance Quiz Teaser ────────────── */}
            <section className="home-newsletter section">
                <div className="container-sm">
                    <div className="home-newsletter-grid">
                        <motion.div
                            className="home-newsletter-content"
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <span className="section-label">Stay Close</span>
                            <h2 className="home-newsletter-title">
                                Get <span className="home-newsletter-highlight">10% OFF</span> Your First Order
                            </h2>
                            <p className="home-newsletter-desc">
                                Join 15,000+ fragrance lovers. Receive exclusive launches, behind-the-scenes stories, and early access.
                            </p>
                            {emailSubmitted ? (
                                <div className="email-capture-success">
                                    <FiCheck size={20} />
                                    <span>Welcome! Check your email for your discount code.</span>
                                </div>
                            ) : (
                                <form className="home-newsletter-form" onSubmit={handleEmailSubmit}>
                                    <input
                                        type="email"
                                        className="form-input"
                                        placeholder="Your email address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    <button type="submit" className="btn btn-primary">
                                        Subscribe <FiSend size={14} />
                                    </button>
                                </form>
                            )}
                            <p className="home-newsletter-privacy">No spam. Unsubscribe anytime.</p>
                        </motion.div>

                        <motion.div
                            className="home-quiz-teaser"
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.15 }}
                        >
                            <div className="home-quiz-card">
                                <span className="home-quiz-emoji">&#x1F9ED;</span>
                                <h3 className="home-quiz-title">Not sure where to start?</h3>
                                <p className="home-quiz-desc">
                                    Take our 2-minute Fragrance Finder quiz and discover the scents made for your personality.
                                </p>
                                <Link to="/fragrance-finder" className="btn btn-accent btn-lg btn-block">
                                    Take the Quiz <FiArrowRight size={16} />
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ─── Social Proof ───────────────────────────────────── */}
            <section className="home-reviews section">
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
                        <h2 className="section-title">What Our Community Says</h2>
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
                                            <FiStar key={s} size={14} fill={s <= review.rating ? 'currentColor' : 'none'} />
                                        ))}
                                    </div>
                                    <span className="review-tag">{review.tag}</span>
                                </div>
                                <p className="review-text">"{review.text}"</p>
                                <div className="review-author">
                                    <div className="review-avatar">{review.name.charAt(0)}</div>
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
        </>
    );
};

export default Home;
