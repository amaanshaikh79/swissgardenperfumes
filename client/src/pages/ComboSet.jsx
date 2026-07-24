import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiShoppingBag, FiX } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { productsAPI } from '../services/api';
import toast from 'react-hot-toast';
import './ComboSet.css';

const ComboSet = () => {
    const [products, setProducts] = useState([]);
    const [selectedAttars, setSelectedAttars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    const { addToCart } = useCart();

    const COMBO_PRICE = 2397;
    const SINGLE_PRICE = 799;
    const SAVINGS = (SINGLE_PRICE * 3) - COMBO_PRICE;

    // Hero slideshow images
    const heroImages = [
        '/Images/Combo Set(3).png',
        '/Images/Combo Set(4).PNG',
        '/Images/Combo Set(5).png',
        '/Images/Combo Set(6).PNG',
    ];

    // Auto-advance slideshow
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroImages.length);
        }, 4000); // Change image every 4 seconds
        return () => clearInterval(interval);
    }, [heroImages.length]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data } = await productsAPI.getAll({ category: 'Attar' });
                setProducts(data.products || []);
            } catch (error) {
                console.error('Failed to fetch products:', error);
                toast.error('Failed to load products');
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const handleToggleAttar = (product) => {
        const isSelected = selectedAttars.some(attar => attar._id === product._id);
        
        if (isSelected) {
            // Remove from selection
            setSelectedAttars(selectedAttars.filter(attar => attar._id !== product._id));
        } else {
            // Add to selection if less than 3
            if (selectedAttars.length < 3) {
                setSelectedAttars([...selectedAttars, product]);
            } else {
                toast.error('You can only select 3 attars');
            }
        }
    };

    const isProductSelected = (productId) => {
        return selectedAttars.some(attar => attar._id === productId);
    };

    const canAddToCart = selectedAttars.length === 3;

    const handleAddToCart = () => {
        if (!canAddToCart) {
            toast.error('Please select 3 attars');
            return;
        }

        // Create combo set item with Close Box image
        const comboSetItem = {
            _id: 'combo-set-' + Date.now(),
            name: 'Signature Trio Combo Set',
            image: '/Images/Close%20Box.jpeg',
            price: COMBO_PRICE,
            size: '3 × 10ml',
            slug: 'combo-set',
            quantity: 1,
            isComboSet: true,
            selectedProducts: selectedAttars.map(attar => ({
                id: attar._id,
                name: attar.name,
                image: attar.images?.[0]?.url
            }))
        };

        addToCart(comboSetItem, 1);
        toast.success('Combo Set added to cart!');
        setSelectedAttars([]);
    };

    if (loading) {
        return (
            <div className="page-loader">
                <div className="spinner" />
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>Build Your Signature Trio | SwissGarden Perfumes</title>
                <meta name="description" content="Create your personal fragrance system. Choose any 3 precision attars for ₹2,397. Presented in The Mood Collection emerald gift case with gold foil detailing." />
                <link rel="canonical" href="https://swissgardenperfumes.com/combo-set" />
            </Helmet>

            <div className="combo-page">
                {/* Hero Section with Slideshow */}
                <section className="combo-hero">
                    <AnimatePresence mode="sync">
                        <motion.div
                            key={currentSlide}
                            className="combo-hero-bg"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1.2, ease: 'easeInOut' }}
                        >
                            <img
                                src={heroImages[currentSlide]}
                                alt={`Swiss Garden Perfumes Combo Set ${currentSlide + 1}`}
                                className="combo-hero-video"
                            />
                        </motion.div>
                    </AnimatePresence>
                    <div className="combo-hero-overlay"></div>
                    <div className="container">
                        <motion.div
                            className="combo-hero-content"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h1 className="combo-hero-title">Build Your Signature Trio</h1>
                            <p className="combo-hero-subtitle">Choose any three attars from our collection to create your perfect combination.</p>
                        </motion.div>
                    </div>
                    
                    {/* Slideshow Indicators */}
                    <div className="combo-hero-indicators">
                        {heroImages.map((_, index) => (
                            <button
                                key={index}
                                className={`combo-hero-indicator ${currentSlide === index ? 'active' : ''}`}
                                onClick={() => setCurrentSlide(index)}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </section>

                {/* Product Grid */}
                <section className="combo-products">
                    <div className="container">
                        {/* Selection Counter */}
                        <div className="combo-selection-counter">
                            <h2>Choose Your 3 Attars ({selectedAttars.length}/3 selected)</h2>
                            {canAddToCart && (
                                <button
                                    className="btn btn-primary btn-lg"
                                    onClick={handleAddToCart}
                                >
                                    <FiShoppingBag size={20} />
                                    Add to Cart — ₹{COMBO_PRICE.toLocaleString('en-IN')}
                                </button>
                            )}
                        </div>

                        <div className="combo-products-grid">
                            {products.map((product, index) => (
                                <motion.div
                                    key={product._id}
                                    className={`combo-product-card ${isProductSelected(product._id) ? 'selected' : ''}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05, duration: 0.4 }}
                                >
                                    {isProductSelected(product._id) && (
                                        <div className="combo-product-check">
                                            <FiCheck size={16} />
                                        </div>
                                    )}
                                    <div className="combo-product-image">
                                        <img src={product.images?.[0]?.url || 'https://via.placeholder.com/400x500?text=Attar'} alt={product.images?.[0]?.alt || product.name} loading="lazy" decoding="async" width="400" height="500" />
                                    </div>
                                    <div className="combo-product-info">
                                        <h3 className="combo-product-name">{product.name}</h3>
                                        <p className="combo-product-tags">
                                            {product.fragranceFamily?.toUpperCase()} · {product.gender?.toUpperCase()} · {product.sillage?.toUpperCase()}
                                        </p>
                                        <p className="combo-product-desc">
                                            {product.shortDescription?.split('.')[0]}.
                                        </p>
                                        <div className="combo-product-notes">
                                            {product.fragranceNotes?.top?.slice(0, 2).map((note, i) => (
                                                <span key={i} className="combo-note-tag">{note}</span>
                                            ))}
                                        </div>
                                        <button
                                            className={`btn ${isProductSelected(product._id) ? 'btn-outline' : 'btn-primary'} btn-block combo-choose-btn`}
                                            onClick={() => handleToggleAttar(product)}
                                        >
                                            {isProductSelected(product._id) ? (
                                                <>
                                                    <FiCheck size={16} /> Selected
                                                </>
                                            ) : (
                                                'Choose'
                                            )}
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Info Section */}
                <section className="combo-info">
                    <div className="container-sm">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="combo-info-title">The Signature Trio</h2>
                            <p className="combo-info-desc">
                                The Signature Trio is not a curated sampler. It is a <strong>personal fragrance system</strong> — three precision attars, selected by you, 
                                engineered to work individually and in concert.
                            </p>
                            <p className="combo-info-desc">
                                Each 10ml roll-on arrives in its own distinctive individual box, presented together inside <strong>The Mood Collection gift case</strong>: 
                                a deep emerald sleeve with gold foil detailing, closed flat for a reveal that is part of the experience. The packaging is considered because 
                                we believe the unboxing is part of the product.
                            </p>
                            <p className="combo-info-desc">
                                Wear one attar for a clean, single-note presence. Apply two at different pulse points for layered depth. Use all three across wrist, collar, 
                                and hair for a fragrance that is entirely and only yours. The Signature Trio gives you a wardrobe of scent in one deliberate, portable system.
                            </p>
                            <p className="combo-info-precision"><strong>This is precision, personalised.</strong></p>
                            
                            <div className="combo-whats-included">
                                <h3 className="combo-section-title">What's Included</h3>
                                <ul className="combo-included-list">
                                    <li>Any 3 attars of your choice from The Mood Collection</li>
                                    <li>3 × 10ml precision roll-on attars</li>
                                    <li>Presented in individual branded boxes</li>
                                    <li>Housed in The Mood Collection emerald gift case</li>
                                    <li>Gold foil branding, gift-ready presentation</li>
                                </ul>
                            </div>

                            <div className="combo-gifting-banner">
                                <h3 className="combo-gifting-title">The gift for someone whose taste you respect.</h3>
                                <p className="combo-gifting-desc">
                                    The Signature Trio is the ideal gifting format — personalised enough to feel considered, flexible enough that the recipient 
                                    builds exactly what they want. Available as a ready-gift (three attars pre-selected) or as a gift-your-choice option where 
                                    the recipient makes their own selection.
                                </p>
                            </div>

                            <div className="combo-features">
                                <div className="combo-feature">ANY 3 ATTARS</div>
                                <div className="combo-feature">EMERALD GIFT CASE</div>
                                <div className="combo-feature">INDIVIDUAL BOXES</div>
                                <div className="combo-feature">GOLD FOIL DETAILS</div>
                                <div className="combo-feature">₹2,397 · ₹799 × 3</div>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default ComboSet;
