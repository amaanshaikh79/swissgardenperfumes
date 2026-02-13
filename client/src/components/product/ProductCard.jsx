import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiShoppingBag, FiStar } from 'react-icons/fi';
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
        >
            <Link to={`/product/${product.slug}`} className="product-card">
                <div className="product-card-image">
                    <img
                        src={product.images?.[0]?.url || 'https://via.placeholder.com/400x500?text=Perfume'}
                        alt={product.name}
                        loading="lazy"
                    />
                    {product.compareAtPrice && (
                        <span className="product-card-sale badge badge-gold">Sale</span>
                    )}
                    {product.featured && !product.compareAtPrice && (
                        <span className="product-card-sale badge badge-gold">Featured</span>
                    )}
                    <div className="product-card-actions">
                        <button
                            className={`product-card-action-btn ${inWishlist ? 'in-wishlist' : ''}`}
                            onClick={handleWishlist}
                            aria-label="Add to wishlist"
                        >
                            <FiHeart size={16} fill={inWishlist ? 'currentColor' : 'none'} />
                        </button>
                        <button
                            className="product-card-action-btn"
                            onClick={handleAddToCart}
                            aria-label="Add to cart"
                        >
                            <FiShoppingBag size={16} />
                        </button>
                    </div>
                </div>

                <div className="product-card-body">
                    <span className="product-card-brand">{product.brand}</span>
                    <h3 className="product-card-name">{product.name}</h3>
                    <p className="product-card-category">{product.category} · {product.size}</p>

                    {product.rating > 0 && (
                        <div className="product-card-rating">
                            <FiStar size={12} fill="currentColor" />
                            <span>{product.rating}</span>
                            <span className="product-card-reviews">({product.numReviews})</span>
                        </div>
                    )}

                    <div className="product-card-price">
                        <span className="product-card-current-price">${product.price.toFixed(2)}</span>
                        {product.compareAtPrice && (
                            <span className="product-card-compare-price">
                                ${product.compareAtPrice.toFixed(2)}
                            </span>
                        )}
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default ProductCard;
