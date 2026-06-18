import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FiCheck, FiShoppingBag, FiX } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { productsAPI } from '../services/api';
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
                <title>Trio Combo - Choose Any 3 Attars | SwissGarden Perfumes</title>
                <meta name="description" content="Create your perfect trio. Choose any 3 attars for ₹1,499. Save ₹0 on our signature collection." />
            </Helmet>

            <div className="combo-page">
                {/* Hero Section */}
                <section className="combo-hero">
                    <div className="container">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h1 className="combo-hero-title">sgp-trio-combo</h1>
                            <p className="combo-hero-subtitle">Choose Any 3 Attars</p>
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
                                        <span className="combo-slot-instruction">Choose below</span>
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
                                <div className="combo-price-save">Save ₹{SAVINGS} vs single</div>
                            </div>
                            <button
                                className={`btn btn-primary btn-lg combo-add-btn ${!canAddToCart ? 'disabled' : ''}`}
                                onClick={handleAddToCart}
                                disabled={!canAddToCart}
                            >
                                <FiShoppingBag size={20} />
                                Add Trio to Cart ({allSlotsFilledCount}/3)
                            </button>
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
                            <h2 className="combo-info-title">The Signature Collection</h2>
                            <p className="combo-info-desc">
                                The Signature Collection is not a sampler. It is a <strong>curated fragrance system</strong> — three precision attars chosen by you, 
                                engineered to work individually and in concert. Each 10ml roll-on is crafted without alcohol, so the scent settles close to the skin, 
                                evolving with your body heat across the day. Whether you reach for a single note in the morning or layer two at pulse points and a third 
                                through your hair, the Signature Trio gives you a wardrobe of scent in one deliberately small package.
                            </p>
                            <p className="combo-info-desc">
                                Swiss Garden Perfumes was built on one conviction: <strong>luxury in fragrance is precision, not price.</strong> Every attar in this 
                                collection is formulated to the same exacting standard — a structured three-act pyramid, long-wearing concentration, and a roll-on format 
                                designed for control. Choose three. Make them yours.
                            </p>
                            <div className="combo-features">
                                <div className="combo-feature">CHOOSE ANY 3</div>
                                <div className="combo-feature">CHOOSE YOUR OWN COMBINATION</div>
                                <div className="combo-feature">ALL-DAY WEAR</div>
                                <div className="combo-feature">SKIN-SAFE FORMULA</div>
                                <div className="combo-feature">₹1,499 · SAVE ₹-2 VS SINGLE </div>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default ComboSet;
