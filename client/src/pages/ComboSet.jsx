import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FiCheck, FiShoppingBag, FiX } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { productsAPI } from '../services/api';
import LazyVideo from '../components/common/LazyVideo';
import toast from 'react-hot-toast';
import './ComboSet.css';

const ComboSet = () => {
    const [products, setProducts] = useState([]);
    const [selectedAttars, setSelectedAttars] = useState([null, null, null]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    const COMBO_PRICE = 1499;
    const SINGLE_PRICE = 499;
    const SAVINGS = (SINGLE_PRICE * 3) - COMBO_PRICE;

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

    const handleSelectAttar = (slotIndex, product) => {
        const newSelection = [...selectedAttars];
        newSelection[slotIndex] = product;
        setSelectedAttars(newSelection);
    };

    const handleRemoveAttar = (slotIndex) => {
        const newSelection = [...selectedAttars];
        newSelection[slotIndex] = null;
        setSelectedAttars(newSelection);
    };

    const isProductSelected = (productId) => {
        return selectedAttars.some(attar => attar?._id === productId);
    };

    const allSlotsFilledCount = selectedAttars.filter(attar => attar !== null).length;
    const canAddToCart = allSlotsFilledCount === 3;

    const handleAddToCart = () => {
        if (!canAddToCart) {
            toast.error('Please select all 3 attars');
            return;
        }

        // Create a combo product
        const comboProduct = {
            _id: `combo-${Date.now()}`,
            name: 'SwissGarden Trio Combo',
            price: COMBO_PRICE,
            images: [{ url: selectedAttars[0].images[0].url, alt: 'Trio Combo' }],
            isCombo: true,
            comboItems: selectedAttars.map(attar => ({
                id: attar._id,
                name: attar.name,
                image: attar.images[0].url
            }))
        };

        addToCart(comboProduct);
        toast.success('Trio combo added to cart!');
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
                <meta name="description" content="Create your personal fragrance system. Choose any 3 precision attars for ₹1,499. Presented in The Mood Collection emerald gift case with gold foil detailing." />
            </Helmet>

            <div className="combo-page">
                {/* Hero Section */}
                <section className="combo-hero">
                    <div className="combo-hero-bg">
                        <LazyVideo
                            src="/Video/Swiss%20Flora.mp4"
                            className="combo-hero-video"
                            autoPlay
                            loop
                            muted
                            playsInline
                        />
                    </div>
                    <div className="combo-hero-overlay"></div>
                    <div className="container">
                        <motion.div
                            className="combo-hero-content"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h1 className="combo-hero-title">Build Your Signature Trio</h1>
                            <p className="combo-hero-subtitle">Three attars. One identity. Choose any three from the collection and make the combination yours.</p>
                        </motion.div>
                    </div>
                </section>

                {/* Selection Slots */}
                <section className="combo-selection">
                    <div className="container">
                        <div className="combo-slots">
                            {[0, 1, 2].map((slotIndex) => (
                                <motion.div
                                    key={slotIndex}
                                    className="combo-slot"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: slotIndex * 0.1, duration: 0.5 }}
                                >
                                    <div className="combo-slot-header">
                                        <span className="combo-slot-label">ATTAR {String(slotIndex + 1).padStart(2, '0')}</span>
                                        <span className="combo-slot-instruction">Select Your Three Attars</span>
                                    </div>
                                    <div className="combo-slot-content">
                                        {selectedAttars[slotIndex] ? (
                                            <div className="combo-selected-attar">
                                                <button
                                                    className="combo-remove-btn"
                                                    onClick={() => handleRemoveAttar(slotIndex)}
                                                >
                                                    <FiX size={16} />
                                                </button>
                                                <img
                                                    src={selectedAttars[slotIndex].images[0].url}
                                                    alt={selectedAttars[slotIndex].name}
                                                    className="combo-selected-image"
                                                />
                                                <h4 className="combo-selected-name">{selectedAttars[slotIndex].name}</h4>
                                            </div>
                                        ) : (
                                            <div className="combo-empty-slot">
                                                <div className="combo-empty-icon">+</div>
                                                <p>Select an attar</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Add to Cart Button */}
                        <div className="combo-add-section">
                            <div className="combo-price-info">
                                <div className="combo-price-main">₹{COMBO_PRICE.toLocaleString('en-IN')}</div>
                                <div className="combo-price-detail">₹499 × 3</div>
                            </div>
                            <button
                                className={`btn btn-primary btn-lg combo-add-btn ${!canAddToCart ? 'disabled' : ''}`}
                                onClick={handleAddToCart}
                                disabled={!canAddToCart}
                            >
                                <FiShoppingBag size={20} />
                                Add to Cart ({allSlotsFilledCount}/3 selected)
                            </button>
                            {canAddToCart && (
                                <p className="combo-cart-confirmation">Your Signature Trio has been added.</p>
                            )}
                        </div>
                    </div>
                </section>

                {/* Product Grid */}
                <section className="combo-products">
                    <div className="container">
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
                                        <img src={product.images[0].url} alt={product.name} />
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
                                        <div className="combo-product-actions">
                                            {[0, 1, 2].map((slotIndex) => (
                                                <button
                                                    key={slotIndex}
                                                    className={`combo-select-btn ${selectedAttars[slotIndex]?._id === product._id ? 'active' : ''}`}
                                                    onClick={() => handleSelectAttar(slotIndex, product)}
                                                    disabled={isProductSelected(product._id) && selectedAttars[slotIndex]?._id !== product._id}
                                                >
                                                    {selectedAttars[slotIndex]?._id === product._id ? (
                                                        <>
                                                            <FiCheck size={14} /> Slot {slotIndex + 1}
                                                        </>
                                                    ) : (
                                                        `Select for Slot ${slotIndex + 1}`
                                                    )}
                                                </button>
                                            ))}
                                        </div>
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
                                <div className="combo-feature">₹1,499 · ₹499 × 3</div>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default ComboSet;
