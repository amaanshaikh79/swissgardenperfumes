import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FiHeart, FiShoppingBag, FiStar, FiMinus, FiPlus, FiChevronRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { productsAPI } from '../services/api';
import toast from 'react-hot-toast';
import './ProductDetail.css';

const ProductDetail = () => {
    const { slug } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);

    const getLongevityWidth = (val) => {
        if (!val) return '70%';
        if (val.includes('12+')) return '100%';
        if (val.includes('8-12')) return '85%';
        if (val.includes('6-8')) return '65%';
        return '50%';
    };

    const getSillageWidth = (val) => {
        if (!val) return '50%';
        if (val === 'Enormous') return '100%';
        if (val === 'Strong') return '80%';
        if (val === 'Moderate') return '60%';
        return '40%';
    };

    const getIntensityWidth = (val) => {
        if (!val) return '60%';
        if (val === 'Intense') return '100%';
        if (val === 'Strong') return '80%';
        if (val === 'Moderate') return '60%';
        return '40%';
    };
    const [activeTab, setActiveTab] = useState('description');
    const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
    const [submitting, setSubmitting] = useState(false);
    const { isAuthenticated, isInWishlist, toggleWishlist } = useAuth();
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const { data } = await productsAPI.getBySlug(slug);
                setProduct(data.product);
            } catch (error) {
                console.error('Failed to fetch product:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [slug]);

    const handleAddToCart = () => {
        if (product) addToCart(product, quantity);
    };

    const handleWishlist = async () => {
        if (!isAuthenticated) {
            toast.error('Please sign in to add to wishlist');
            return;
        }
        try {
            const data = await toggleWishlist(product._id);
            toast.success(data.message);
        } catch {
            toast.error('Failed to update wishlist');
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            toast.error('Please sign in to leave a review');
            return;
        }
        setSubmitting(true);
        try {
            const { data } = await productsAPI.addReview(product._id, reviewForm);
            setProduct(data.product);
            setReviewForm({ rating: 5, title: '', comment: '' });
            toast.success('Review submitted!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="page-loader" style={{ paddingTop: '100px' }}>
                <div className="spinner" />
                <span className="page-loader-text">Loading...</span>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="page-loader" style={{ paddingTop: '100px' }}>
                <h2>Product not found</h2>
                <Link to="/shop" className="btn btn-outline">Back to Shop</Link>
            </div>
        );
    }

    const inWishlist = isInWishlist(product._id);

    return (
        <>
            <Helmet>
                <title>{product.name} | GoldenBuck Perfumes</title>
                <meta name="description" content={product.shortDescription || product.description.slice(0, 160)} />
            </Helmet>

            <div className="product-detail-page">
                {/* Breadcrumb */}
                <div className="container">
                    <nav className="breadcrumb">
                        <Link to="/">Home</Link>
                        <FiChevronRight size={12} />
                        <Link to="/shop">Shop</Link>
                        <FiChevronRight size={12} />
                        <span>{product.name}</span>
                    </nav>
                </div>

                {/* Main Product */}
                <div className="container">
                    <div className="product-detail-grid">
                        {/* Images */}
                        <motion.div
                            className="product-detail-images"
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="product-detail-main-image">
                                <img
                                    src={product.images?.[0]?.url || 'https://via.placeholder.com/600x800?text=Perfume'}
                                    alt={product.name}
                                />
                            </div>
                            {product.images?.length > 1 && (
                                <div className="product-detail-thumbnails">
                                    {product.images.map((img, i) => (
                                        <div key={i} className="product-detail-thumbnail">
                                            <img src={img.url} alt={img.alt || product.name} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>

                        {/* Info */}
                        <motion.div
                            className="product-detail-info"
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <span className="product-detail-brand">{product.brand}</span>
                            <h1 className="product-detail-name">{product.name}</h1>
                            <p className="product-detail-category">
                                {product.category} · {product.size} · {product.gender}
                            </p>

                            {product.rating > 0 && (
                                <div className="product-detail-rating">
                                    <div className="stars">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <FiStar
                                                key={star}
                                                size={16}
                                                fill={star <= Math.round(product.rating) ? 'currentColor' : 'none'}
                                                className={star <= Math.round(product.rating) ? '' : 'empty'}
                                            />
                                        ))}
                                    </div>
                                    <span>{product.rating} ({product.numReviews} review{product.numReviews !== 1 ? 's' : ''})</span>
                                </div>
                            )}

                            <div className="product-detail-price">
                                <span className="product-detail-current-price">${product.price.toFixed(2)}</span>
                                {product.compareAtPrice && (
                                    <span className="product-detail-compare-price">${product.compareAtPrice.toFixed(2)}</span>
                                )}
                                {product.compareAtPrice && (
                                    <span className="badge badge-gold">
                                        Save ${(product.compareAtPrice - product.price).toFixed(0)}
                                    </span>
                                )}
                            </div>

                            <p className="product-detail-short-desc">
                                {product.shortDescription || product.description.slice(0, 200)}
                            </p>

                            {/* Fragrance Notes */}
                            {product.fragranceNotes && (
                                <div className="fragrance-pyramid">
                                    <h4 className="fragrance-pyramid-title">Fragrance Notes</h4>
                                    <div className="fragrance-layers">
                                        {product.fragranceNotes.top?.length > 0 && (
                                            <div className="fragrance-layer">
                                                <span className="fragrance-layer-label">Top</span>
                                                <div className="fragrance-notes-list">
                                                    {product.fragranceNotes.top.map((note) => (
                                                        <span key={note} className="fragrance-note">{note}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {product.fragranceNotes.middle?.length > 0 && (
                                            <div className="fragrance-layer">
                                                <span className="fragrance-layer-label">Heart</span>
                                                <div className="fragrance-notes-list">
                                                    {product.fragranceNotes.middle.map((note) => (
                                                        <span key={note} className="fragrance-note">{note}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {product.fragranceNotes.base?.length > 0 && (
                                            <div className="fragrance-layer">
                                                <span className="fragrance-layer-label">Base</span>
                                                <div className="fragrance-notes-list">
                                                    {product.fragranceNotes.base.map((note) => (
                                                        <span key={note} className="fragrance-note">{note}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="product-detail-actions">
                                <div className="product-detail-qty">
                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>
                                        <FiMinus size={16} />
                                    </button>
                                    <span>{quantity}</span>
                                    <button onClick={() => setQuantity(quantity + 1)}>
                                        <FiPlus size={16} />
                                    </button>
                                </div>
                                <button className="btn btn-primary btn-lg product-detail-add-btn" onClick={handleAddToCart}>
                                    <FiShoppingBag size={18} /> Add to Bag — ${(product.price * quantity).toFixed(2)}
                                </button>
                                <button
                                    className={`btn btn-icon btn-outline product-detail-wish-btn ${inWishlist ? 'in-wishlist' : ''}`}
                                    onClick={handleWishlist}
                                >
                                    <FiHeart size={18} fill={inWishlist ? 'currentColor' : 'none'} />
                                </button>
                            </div>

                            {/* Performance Meter */}
                            <div className="product-performance-meter">
                                <h4 className="meter-title">Performance & Sillage</h4>
                                <div className="meter-grid">
                                    <div className="meter-item">
                                        <div className="meter-label">
                                            <span>Longevity</span>
                                            <span className="meter-value">{product.longevity || '8-10 Hours'}</span>
                                        </div>
                                        <div className="meter-bar-bg">
                                            <div
                                                className="meter-bar-fill"
                                                style={{ width: getLongevityWidth(product.longevity) }}
                                            />
                                        </div>
                                    </div>
                                    <div className="meter-item">
                                        <div className="meter-label">
                                            <span>Sillage</span>
                                            <span className="meter-value">{product.sillage || 'Moderate'}</span>
                                        </div>
                                        <div className="meter-bar-bg">
                                            <div
                                                className="meter-bar-fill"
                                                style={{ width: getSillageWidth(product.sillage) }}
                                            />
                                        </div>
                                    </div>
                                    <div className="meter-item">
                                        <div className="meter-label">
                                            <span>Intensity</span>
                                            <span className="meter-value">{product.concentration || 'Strong'}</span>
                                        </div>
                                        <div className="meter-bar-bg">
                                            <div
                                                className="meter-bar-fill"
                                                style={{ width: getIntensityWidth(product.concentration) }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Meta Info (Simplified) */}
                            <div className="product-detail-meta">
                                {product.fragranceFamily && (
                                    <div className="meta-item"><span>Family:</span> {product.fragranceFamily}</div>
                                )}
                                {product.stock > 0 ? (
                                    <div className="meta-item">
                                        <span className="badge badge-success">In Stock</span>
                                    </div>
                                ) : (
                                    <span className="badge badge-error">Out of Stock</span>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="container" style={{ marginBottom: 'var(--space-3xl)' }}>
                    <div className="product-faq-section" style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <h3 className="section-title" style={{ fontSize: '1.5rem', marginBottom: '20px', textAlign: 'center' }}>Scale & Common Questions</h3>
                        <div className="faq-grid" style={{ display: 'grid', gap: '16px' }}>
                            <details className="faq-item">
                                <summary>How long does shipping take?</summary>
                                <p>We usually ship within 24 hours. Delivery takes 3-5 business days across India.</p>
                            </details>
                            <details className="faq-item">
                                <summary>Is Cash on Delivery available?</summary>
                                <p>Yes! We offer COD on all orders across 20,000+ pincodes in India.</p>
                            </details>
                            <details className="faq-item">
                                <summary>What is the return policy?</summary>
                                <p>We offer a 7-day return policy for damaged or incorrect items. Please record an unboxing video for smooth processing.</p>
                            </details>
                            <details className="faq-item">
                                <summary>Are these original perfumes?</summary>
                                <p>These are high-quality <strong>inspired</strong> fragrances. We use premium imported oils to match the scent profile of expensive designer brands at a fraction of the cost.</p>
                            </details>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="container">
                    <div className="product-tabs-section">
                        <div className="product-tabs-nav">
                            {['description', 'reviews'].map((tab) => (
                                <button
                                    key={tab}
                                    className={`product-tab ${activeTab === tab ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab === 'description' ? 'Description' : `Reviews (${product.numReviews})`}
                                </button>
                            ))}
                        </div>

                        <div className="product-tab-content">
                            {activeTab === 'description' ? (
                                <div className="product-description-content">
                                    <p>{product.description}</p>
                                    {product.occasion?.length > 0 && (
                                        <div className="product-tags-section">
                                            <h4>Best for</h4>
                                            <div className="product-tag-list">
                                                {product.occasion.map((o) => (
                                                    <span key={o} className="badge badge-gold">{o}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {product.season?.length > 0 && (
                                        <div className="product-tags-section">
                                            <h4>Season</h4>
                                            <div className="product-tag-list">
                                                {product.season.map((s) => (
                                                    <span key={s} className="badge badge-gold">{s}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="product-reviews-content">
                                    {/* Review Form */}
                                    {isAuthenticated && (
                                        <form className="review-form" onSubmit={handleReviewSubmit}>
                                            <h4>Leave a Review</h4>
                                            <div className="review-rating-input">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setReviewForm((p) => ({ ...p, rating: star }))}
                                                    >
                                                        <FiStar
                                                            size={20}
                                                            fill={star <= reviewForm.rating ? '#D4AF37' : 'none'}
                                                            color="#D4AF37"
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="Review title (optional)"
                                                value={reviewForm.title}
                                                onChange={(e) => setReviewForm((p) => ({ ...p, title: e.target.value }))}
                                            />
                                            <textarea
                                                className="form-input form-textarea"
                                                placeholder="Share your experience with this fragrance..."
                                                value={reviewForm.comment}
                                                onChange={(e) => setReviewForm((p) => ({ ...p, comment: e.target.value }))}
                                                required
                                            />
                                            <div className="review-form-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                                                <button type="button" className="btn btn-outline btn-sm" onClick={() => toast('Photo upload coming soon!')}>
                                                    <span style={{ marginRight: '8px' }}>📷</span> Add Photo
                                                </button>
                                                <button className="btn btn-primary" type="submit" disabled={submitting}>
                                                    {submitting ? 'Submitting...' : 'Submit Review'}
                                                </button>
                                            </div>
                                        </form>
                                    )}

                                    {/* Review List */}
                                    {product.reviews?.length > 0 ? (
                                        <div className="reviews-list">
                                            {product.reviews.map((review, i) => (
                                                <div key={i} className="review-item">
                                                    <div className="review-header">
                                                        <div className="review-user">
                                                            <div className="review-avatar">
                                                                {review.user?.firstName?.[0] || 'U'}
                                                            </div>
                                                            <div>
                                                                <span className="review-user-name">
                                                                    {review.user?.firstName} {review.user?.lastName}
                                                                </span>
                                                                <div className="stars">
                                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                                        <FiStar
                                                                            key={star}
                                                                            size={12}
                                                                            fill={star <= review.rating ? 'currentColor' : 'none'}
                                                                            className={star <= review.rating ? '' : 'empty'}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <span className="review-date">
                                                            {new Date(review.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    {review.title && <h5 className="review-title">{review.title}</h5>}
                                                    <p className="review-comment">{review.comment}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="reviews-empty">No reviews yet. Be the first to share your experience!</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProductDetail;
