import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
    FiArrowRight, FiStar, FiCheck, FiSend, FiChevronLeft, FiChevronRight
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

    const heroVideos = [
        '/Video/Alpine Savage.mp4',
        '/Video/Royal Ascent.mp4',
        '/Video/Swiss Flora.mp4',
        '/Video/Blue Dominion.mp4',
        '/Video/Citrus Reverie.mp4',
        '/Video/Glacier Splash.mp4',
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setHeroSlide((prev) => (prev + 1) % heroVideos.length);
        }, 8000); // Change video every 8 seconds
        return () => clearInterval(interval);
    }, [heroVideos.length]);

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
            name: 'Royal Ascent',
            mood: 'Dark. Mysterious. Unforgettable.',
            image: '/Images/Royal Ascent.JPG',
            link: '/shop?fragranceFamily=Oriental',
        },
        {
            name: 'Swiss Flora',
            mood: 'Fresh florals meet crisp greens.',
            image: '/Images/Swiss Flora.JPG',
            link: '/shop?fragranceFamily=Floral',
        },
        {
            name: 'Alpine Savage',
            mood: 'Rich. Regal. Timeless.',
            image: '/Images/Alpine Savage.JPG',
            link: '/shop?fragranceFamily=Woody',
        },
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
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: 'easeInOut' }}
                    >
                        <video
                            src={heroVideos[heroSlide]}
                            className="home-hero-video"
                            autoPlay
                            loop
                            muted
                            playsInline
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
                        Swiss precision. Indian craft. The Mood Collection — non-alcoholic, long-lasting, yours.
                    </motion.span>

                    <motion.h1
                        className="home-hero-title"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.7 }}
                    >
                        Craft Your <em>Signature.</em>
                    </motion.h1>

                    <motion.p
                        className="home-hero-subtitle"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.85 }}
                    >
                        Six precision roll-on attars. One collection built around who you are.
                    </motion.p>

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
                            SHOP THE COLLECTION <FiArrowRight size={16} />
                        </Link>
                        <Link to="/fragrance-finder" className="btn btn-outline-light btn-lg">
                            BUILD YOUR TRIO
                        </Link>
                    </motion.div>
                </motion.div>
            </section>


            {/* ─── Introductory Strip ──────────────────────────────── */}
            <section className="home-philosophy">
                <div className="container-sm">
                    <motion.h2
                        className="home-philosophy-heading"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-100px' }}
                        transition={{ duration: 0.7 }}
                    >
                        Three lines. One identity.
                    </motion.h2>
                    <motion.p
                        className="home-philosophy-text"
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-100px' }}
                        transition={{ duration: 0.8, delay: 0.15 }}
                    >
                        Swiss Garden Perfumes was built on a single conviction — that fragrance at any price point can be precise, intentional, and deeply personal. The Mood Collection translates that conviction into six attars: each one a distinct mood, engineered to last, formulated without alcohol, and delivered in a roll-on that puts the scent exactly where you intend it.
                    </motion.p>
                    <motion.p
                        className="home-philosophy-closing"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-100px' }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                    >
                        This is not a shelf fragrance. This is yours.
                    </motion.p>
                </div>
            </section>

            {/* ─── Value Pillars Strip ──────────────────────────────── */}
            <section className="home-pillars section">
                <div className="container">
                    <div className="home-pillars-grid">
                        <motion.div
                            className="home-pillar"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h3 className="home-pillar-title">Precision Formula</h3>
                            <p className="home-pillar-desc">
                                Every attar follows a structured three-act note pyramid — top, heart, base — crafted for progression and longevity.
                            </p>
                        </motion.div>
                        <motion.div
                            className="home-pillar"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.12 }}
                        >
                            <h3 className="home-pillar-title">Non-Alcoholic</h3>
                            <p className="home-pillar-desc">
                                No alcohol means no harsh opening. The scent settles close to the skin and evolves with your body heat across the day.
                            </p>
                        </motion.div>
                        <motion.div
                            className="home-pillar"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.24 }}
                        >
                            <h3 className="home-pillar-title">Roll-On Control</h3>
                            <p className="home-pillar-desc">
                                A precision roll-on applies scent exactly where intended — pulse points, wrist, collar — no spray waste, no overuse.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ─── Collection Preview Banner ───────────────────────── */}
            <section className="home-collection-banner section">
                <div className="container-sm">
                    <motion.div
                        className="home-collection-banner-inner"
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="home-collection-banner-title">Six Attars. Every Mood.</h2>
                        <p className="home-collection-banner-text">
                            From the cool clarity of Glacier Splash to the commanding warmth of Royal Ascent — each fragrance in The Mood Collection is a complete expression. Wear one. Layer two. Make the combination yours.
                        </p>
                        <Link to="/shop" className="btn btn-accent btn-lg home-collection-banner-cta">
                            Explore The Collection <FiArrowRight size={16} />
                        </Link>
                    </motion.div>
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

            {/* ─── Trio / Gifting Teaser ───────────────────────────── */}
            <section className="home-trio-teaser section">
                <div className="container-sm">
                    <motion.div
                        className="home-trio-teaser-inner"
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="home-trio-teaser-title">Choose Three. Call It Yours.</h2>
                        <p className="home-trio-teaser-text">
                            The Signature Trio lets you build a personal fragrance wardrobe from any three attars in the collection. Gift it. Keep it. Own it completely.
                        </p>
                        <Link to="/fragrance-finder" className="btn btn-outline btn-lg home-trio-teaser-cta">
                            Build Your Trio <FiArrowRight size={16} />
                        </Link>
                    </motion.div>
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
