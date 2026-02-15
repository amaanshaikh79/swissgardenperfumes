import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingBag, FiStar, FiHeart } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';
import './ProductCard.css';

const ProductCard = ({ product, index = 0 }) => {
    const { isAuthenticated, isInWishlist, toggleWishlist } = useAuth();
    const { addToCart } = useCart();

    const handleWishlist = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) {
            toast.error('Please sign in to add items to your wishlist');
            return;
        }
        try {
            const data = await toggleWishlist(product._id);
            toast.success(data.message);
        } catch {
            toast.error('Failed to update wishlist');
        }
    };

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product);
    };

    const inWishlist = isInWishlist(product._id);

    // Determine badge
    const getBadge = () => {
        if (product.stock <= 5 && product.stock > 0) return { text: 'Low Stock', type: 'urgency' };
        if (product.tags?.includes('bestseller')) return { text: 'Best Seller', type: 'bestseller' };
        if (product.compareAtPrice) return { text: `Save ₹${Math.round(product.compareAtPrice - product.price)}`, type: 'save' };
        if (product.featured) return { text: 'Trending', type: 'trending' };
        return null;
    };

    const badge = getBadge();

    // Inspired reference
    const getInspiredTag = () => {
        if (product.shortDescription) {
            return product.shortDescription;
        }
        return null;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
        >
            <Link to={`/product/${product.slug}`} className="product-card" id={`product-${product._id}`}>
                <div className="product-card-image">
                    <img
                        src={product.images?.[0]?.url || 'https://via.placeholder.com/400x500?text=Perfume'}
                        alt={product.name}
                        loading="lazy"
                    />
                    {badge && (
                        <span className={`product-card-badge product-card-badge--${badge.type}`}>
                            {badge.text}
                        </span>
                    )}
                    <button
                        className={`product-card-wishlist ${inWishlist ? 'in-wishlist' : ''}`}
                        onClick={handleWishlist}
                        aria-label="Add to wishlist"
                    >
                        <FiHeart size={16} fill={inWishlist ? 'currentColor' : 'none'} />
                    </button>
                </div>

                <div className="product-card-body">
                    {getInspiredTag() && (
                        <p className="product-card-inspired">{getInspiredTag()}</p>
                    )}
                    <h3 className="product-card-name">{product.name}</h3>

                    {product.rating > 0 && (
                        <div className="product-card-rating">
                            <div className="product-card-stars">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <FiStar
                                        key={s}
                                        size={12}
                                        fill={s <= Math.round(product.rating) ? 'currentColor' : 'none'}
                                    />
                                ))}
                            </div>
                            <span className="product-card-rating-text">
                                {product.rating} ({product.numReviews})
                            </span>
                        </div>
                    )}

                    <div className="product-card-price-row">
                        <span className="product-card-price">₹{product.price.toLocaleString('en-IN')}</span>
                        {product.compareAtPrice && (
                            <span className="product-card-compare">
                                ₹{product.compareAtPrice.toLocaleString('en-IN')}
                            </span>
                        )}
                    </div>

                    <button
                        className="product-card-add-btn"
                        onClick={handleAddToCart}
                        aria-label="Add to cart"
                    >
                        <FiShoppingBag size={14} />
                        Add to Cart
                    </button>
                </div>
            </Link>
        </motion.div>
    );
};

export default ProductCard;
