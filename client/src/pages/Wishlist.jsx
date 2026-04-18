import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiShoppingCart, FiTrash2, FiArrowRight, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/product/ProductCard';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import './Wishlist.css';

const Wishlist = () => {
    const { user, refreshUser } = useAuth();
    const { addToCart } = useCart();
    const [removing, setRemoving] = useState(null);
    const [addingToCart, setAddingToCart] = useState(null);

    useEffect(() => { refreshUser(); }, [refreshUser]);

    const wishlistItems = user?.wishlist || [];

    const handleRemove = async (productId) => {
        setRemoving(productId);
        try {
            await authAPI.toggleWishlist(productId);
            await refreshUser();
            toast.success('Removed from wishlist');
        } catch {
            toast.error('Failed to remove item');
        } finally {
            setRemoving(null);
        }
    };

    const handleAddToCart = (product) => {
        setAddingToCart(product._id);
        try {
            addToCart(product, 1);
        } catch {
            toast.error('Failed to add to cart');
        } finally {
            setTimeout(() => setAddingToCart(null), 800);
        }
    };

    return (
        <>
            <Helmet>
                <title>My Wishlist | SwissGarden Perfumes</title>
                <meta name="description" content="Your saved fragrances — shop your wishlist anytime." />
            </Helmet>
            <div className="wishlist-page">
                <div className="container-sm">
                    {/* Header */}
                    <motion.div
                        className="wishlist-header"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="wishlist-header-icon">
                            <FiHeart size={28} />
                        </div>
                        <div>
                            <h1 className="wishlist-title">My Wishlist</h1>
                            <p className="wishlist-count">
                                {wishlistItems.length === 0
                                    ? 'No saved fragrances yet'
                                    : `${wishlistItems.length} saved fragrance${wishlistItems.length !== 1 ? 's' : ''}`}
                            </p>
                        </div>
                    </motion.div>

                    {/* Empty State */}
                    {wishlistItems.length === 0 ? (
                        <motion.div
                            className="wishlist-empty"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <div className="wishlist-empty-icon">
                                <FiHeart size={64} />
                            </div>
                            <h2>Your wishlist is empty</h2>
                            <p>Save fragrances you love and come back to them anytime.</p>
                            <Link to="/shop" className="btn btn-primary btn-lg">
                                Browse Fragrances <FiArrowRight size={16} />
                            </Link>
                            <div className="wishlist-empty-hint">
                                <span>Tap the ♡ icon on any product to save it here</span>
                            </div>
                        </motion.div>
                    ) : (
                        <>
                            {/* Wishlist Grid */}
                            <div className="wishlist-grid">
                                <AnimatePresence>
                                    {wishlistItems.map((product, i) => (
                                        <motion.div
                                            key={product._id}
                                            className="wishlist-item-card"
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ delay: i * 0.07 }}
                                            layout
                                        >
                                            {/* Remove Button */}
                                            <button
                                                className="wishlist-remove-btn"
                                                onClick={() => handleRemove(product._id)}
                                                disabled={removing === product._id}
                                                aria-label="Remove from wishlist"
                                            >
                                                {removing === product._id ? (
                                                    <div className="spinner-xs" />
                                                ) : (
                                                    <FiX size={16} />
                                                )}
                                            </button>

                                            {/* Product Image */}
                                            <Link to={`/product/${product.slug}`} className="wishlist-item-img-link">
                                                <div className="wishlist-item-img">
                                                    {product.images?.[0] ? (
                                                        <img src={product.images[0]} alt={product.name} loading="lazy" />
                                                    ) : (
                                                        <div className="wishlist-img-placeholder">
                                                            <FiHeart size={32} />
                                                        </div>
                                                    )}
                                                </div>
                                            </Link>

                                            {/* Product Info */}
                                            <div className="wishlist-item-body">
                                                {product.brand && (
                                                    <span className="wishlist-item-brand">{product.brand}</span>
                                                )}
                                                <Link to={`/product/${product.slug}`} className="wishlist-item-name">
                                                    {product.name}
                                                </Link>
                                                {product.size && (
                                                    <span className="wishlist-item-size">{product.size}</span>
                                                )}

                                                {/* Price */}
                                                <div className="wishlist-item-price-row">
                                                    <span className="wishlist-item-price">
                                                        ₹{product.price?.toLocaleString('en-IN')}
                                                    </span>
                                                    {product.comparePrice && product.comparePrice > product.price && (
                                                        <span className="wishlist-item-compare">
                                                            ₹{product.comparePrice?.toLocaleString('en-IN')}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Stock Status */}
                                                {product.stock <= 0 && (
                                                    <span className="badge badge-error" style={{ fontSize: '0.7rem', marginBottom: '0.5rem', display: 'inline-flex' }}>
                                                        Out of Stock
                                                    </span>
                                                )}

                                                {/* Actions */}
                                                <div className="wishlist-item-actions">
                                                    <button
                                                        className="btn btn-primary btn-sm wishlist-cart-btn"
                                                        onClick={() => handleAddToCart(product)}
                                                        disabled={addingToCart === product._id || product.stock <= 0}
                                                    >
                                                        {addingToCart === product._id ? (
                                                            <div className="spinner-xs" />
                                                        ) : (
                                                            <>
                                                                <FiShoppingCart size={14} />
                                                                Add to Cart
                                                            </>
                                                        )}
                                                    </button>
                                                    <button
                                                        className="btn btn-ghost btn-sm wishlist-remove-text-btn"
                                                        onClick={() => handleRemove(product._id)}
                                                        disabled={removing === product._id}
                                                    >
                                                        <FiTrash2 size={13} />
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            {/* Bottom CTA */}
                            <motion.div
                                className="wishlist-bottom-cta"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                <Link to="/shop" className="btn btn-outline">
                                    Continue Shopping <FiArrowRight size={15} />
                                </Link>
                            </motion.div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default Wishlist;
