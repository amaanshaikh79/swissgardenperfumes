import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FiHeart, FiShoppingBag, FiStar, FiMinus, FiPlus, FiChevronRight, FiArrowRight, FiRotateCw } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { productsAPI } from '../services/api';
import ProductCard from '../components/product/ProductCard';
import toast from 'react-hot-toast';
import './ProductDetail.css';

const ProductDetail = () => {
    const { slug } = useParams();
    const [product, setProduct] = useState(null);
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [imageRotation, setImageRotation] = useState(0);

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

    const [activeTab, setActiveTab] = useState('story');
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
                setSelectedImage(0);
                setImageRotation(0);
                // Fetch related products
                if (data.product.fragranceFamily) {
                    const relData = await productsAPI.getAll({
                        fragranceFamily: data.product.fragranceFamily,
                        limit: 5,
                    });
                    setRelated(relData.data.products.filter((p) => p._id !== data.product._id).slice(0, 4));
                }
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

    const handle360Rotate = () => {
        setImageRotation((prev) => prev + 90);
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

    // Perfumer's note — generated from description or custom field
    const perfumerNote = product.perfumerNote || (product.description ? product.description.slice(0, 300) : '');

    // Dry-down description
    const dryDown = product.dryDown || 'As the fragrance settles, the base notes emerge slowly — warm, rich, and deeply personal. The dry-down is where this scent truly becomes yours, evolving on your skin over hours into something intimate and unforgettable.';

    return (
        <>
            <Helmet>
                <title>{product.name} | SwissGarden Perfumes</title>
                <meta name="description" content={product.shortDescription || product.description?.slice(0, 160)} />
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
                        {/* ─── Large Image Gallery ─────────────── */}
                        <motion.div
                            className="product-detail-images"
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="product-detail-main-image">
                                <motion.img
                                    src={product.images?.[selectedImage]?.url || 'https://via.placeholder.com/600x800?text=Perfume'}
                                    alt={product.name}
                                    style={{ rotate: imageRotation }}
                                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                                />
                                <button className="product-360-btn" onClick={handle360Rotate} title="360° Rotate">
                                    <FiRotateCw size={18} />
                                    <span>360°</span>
                                </button>
                            </div>
                            {product.images?.length > 1 && (
                                <div className="product-detail-thumbnails">
                                    {product.images.map((img, i) => (
                                        <button
                                            key={i}
                                            className={`product-detail-thumbnail ${selectedImage === i ? 'active' : ''}`}
                                            onClick={() => { setSelectedImage(i); setImageRotation(0); }}
                                        >
                                            <img src={img.url} alt={img.alt || product.name} />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </motion.div>

                        {/* ─── Product Info ─────────────────────── */}
                        <motion.div
                            className="product-detail-info"
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <span className="product-detail-brand">{product.brand}</span>
                            <h1 className="product-detail-name">{product.name}</h1>
                            {product.shortDescription && (
                                <p className="product-detail-tagline">{product.shortDescription}</p>
                            )}

                            {product.moodProfile?.length > 0 && (
                                <div className="mood-profile">
                                    <span className="mood-profile-label">Mood</span>
                                    <div className="mood-profile-tags">
                                        {product.moodProfile.map((mood) => (
                                            <span key={mood} className="mood-tag">{mood}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {product.bestFor && (
                                <div className="best-for-section">
                                    <span className="best-for-label">Best For</span>
                                    <p className="best-for-text">{product.bestFor}</p>
                                </div>
                            )}

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
                                <span className="product-detail-current-price">₹{product.price.toLocaleString('en-IN')}</span>
                                {product.compareAtPrice && (
                                    <span className="product-detail-compare-price">₹{product.compareAtPrice.toLocaleString('en-IN')}</span>
                                )}
                                {product.compareAtPrice && (
                                    <span className="badge badge-gold">
                                        Save ₹{Math.round(product.compareAtPrice - product.price)}
                                    </span>
                                )}
                            </div>

                            {/* ─── Scent Pyramid ───────────────── */}
                            {product.fragranceNotes && (
                                <div className="fragrance-pyramid">
                                    <h4 className="fragrance-pyramid-title">Scent Pyramid</h4>
                                    <div className="fragrance-pyramid-visual">
                                        {product.fragranceNotes.top?.length > 0 && (
                                            <div className="pyramid-tier pyramid-tier--top">
                                                <div className="pyramid-tier-bar" />
                                                <div className="pyramid-tier-content">
                                                    <span className="pyramid-tier-label">Top Notes</span>
                                                    <span className="pyramid-tier-desc">First impression — fades in 15–30 min</span>
                                                    <div className="fragrance-notes-list">
                                                        {product.fragranceNotes.top.map((note) => (
                                                            <span key={note} className="fragrance-note">{note}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {product.fragranceNotes.middle?.length > 0 && (
                                            <div className="pyramid-tier pyramid-tier--heart">
                                                <div className="pyramid-tier-bar" />
                                                <div className="pyramid-tier-content">
                                                    <span className="pyramid-tier-label">Heart Notes</span>
                                                    <span className="pyramid-tier-desc">The soul — emerges after 30 min</span>
                                                    <div className="fragrance-notes-list">
                                                        {product.fragranceNotes.middle.map((note) => (
                                                            <span key={note} className="fragrance-note">{note}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {product.fragranceNotes.base?.length > 0 && (
                                            <div className="pyramid-tier pyramid-tier--base">
                                                <div className="pyramid-tier-bar" />
                                                <div className="pyramid-tier-content">
                                                    <span className="pyramid-tier-label">Base Notes</span>
                                                    <span className="pyramid-tier-desc">The foundation — lasts for hours</span>
                                                    <div className="fragrance-notes-list">
                                                        {product.fragranceNotes.base.map((note) => (
                                                            <span key={note} className="fragrance-note">{note}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ─── Actions ─────────────────────── */}
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
                                    <FiShoppingBag size={18} /> Add to Bag — ₹{(product.price * quantity).toLocaleString('en-IN')}
                                </button>
                                <button
                                    className={`btn btn-icon btn-outline product-detail-wish-btn ${inWishlist ? 'in-wishlist' : ''}`}
                                    onClick={handleWishlist}
                                >
                                    <FiHeart size={18} fill={inWishlist ? 'currentColor' : 'none'} />
                                </button>
                            </div>

                            {/* ─── Format & Tags ──────────────────── */}
                            {(product.format || product.tags?.length > 0) && (
                                <div className="product-format-tags">
                                    {product.tags?.length > 0 && (
                                        <div className="product-tag-strip">
                                            {product.tags.filter(t => ['intense', 'long-wear', 'evening', 'gift', 'daily-wear', 'summer', 'bold', 'romantic', 'clean', 'fresh', 'bestseller'].includes(t.toLowerCase())).slice(0, 4).map((tag) => (
                                                <span key={tag} className="format-tag">{tag.charAt(0).toUpperCase() + tag.slice(1)}</span>
                                            ))}
                                        </div>
                                    )}
                                    {product.format && (
                                        <p className="product-format-line">{product.format}</p>
                                    )}
                                </div>
                            )}

                            {/* ─── Performance Meter ────────────── */}
                            <div className="product-performance-meter">
                                <h4 className="meter-title">How It Wears</h4>
                                <div className="meter-grid">
                                    <div className="meter-item">
                                        <div className="meter-label">
                                            <span>Longevity</span>
                                            <span className="meter-value">{product.longevity || '8-10 Hours'}</span>
                                        </div>
                                        <div className="meter-bar-bg">
                                            <div className="meter-bar-fill" style={{ width: getLongevityWidth(product.longevity) }} />
                                        </div>
                                    </div>
                                    <div className="meter-item">
                                        <div className="meter-label">
                                            <span>Sillage</span>
                                            <span className="meter-value">{product.sillage || 'Moderate'}</span>
                                        </div>
                                        <div className="meter-bar-bg">
                                            <div className="meter-bar-fill" style={{ width: getSillageWidth(product.sillage) }} />
                                        </div>
                                    </div>
                                    <div className="meter-item">
                                        <div className="meter-label">
                                            <span>Intensity</span>
                                            <span className="meter-value">{product.concentration || 'Strong'}</span>
                                        </div>
                                        <div className="meter-bar-bg">
                                            <div className="meter-bar-fill" style={{ width: getIntensityWidth(product.concentration) }} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ─── Meta ─────────────────────────── */}
                            <div className="product-detail-meta">
                                {product.fragranceFamily && (
                                    <div className="meta-item"><span>Family:</span> {product.fragranceFamily}</div>
                                )}
                                {product.stock > 0 ? (
                                    <div className="meta-item"><span className="badge badge-success">In Stock</span></div>
                                ) : (
                                    <span className="badge badge-error">Out of Stock</span>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* ─── Tabs: Story / Dry-Down / Reviews ──────── */}
                <div className="container">
                    <div className="product-tabs-section">
                        <div className="product-tabs-nav">
                            {['story', 'drydown', 'reviews'].map((tab) => (
                                <button
                                    key={tab}
                                    className={`product-tab ${activeTab === tab ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab === 'story' ? "Perfumer's Note" : tab === 'drydown' ? 'How It Wears' : `Reviews (${product.numReviews})`}
                                </button>
                            ))}
                        </div>

                        <div className="product-tab-content">
                            {activeTab === 'story' && (
                                <div className="product-story-content">
                                    <div className="product-story-text">
                                        {(product.perfumerNote || perfumerNote).split(/\r?\n\r?\n|\\n\\n/).map((para, i) => (
                                            <p key={i} className={i === 0 ? 'product-story-lead' : 'product-story-para'}>{para}</p>
                                        ))}
                                    </div>
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
                            )}

                            {activeTab === 'drydown' && (
                                <div className="product-drydown-content">
                                    <h3 className="product-drydown-title">The Dry-Down Experience</h3>
                                    <p className="product-drydown-text">{dryDown}</p>
                                    <div className="product-drydown-timeline">
                                        <div className="drydown-phase">
                                            <span className="drydown-phase-time">0–15 min</span>
                                            <span className="drydown-phase-name">Opening</span>
                                            <p>The top notes burst forward — bright, fresh, and immediate.</p>
                                        </div>
                                        <div className="drydown-phase">
                                            <span className="drydown-phase-time">30 min–2 hr</span>
                                            <span className="drydown-phase-name">Heart</span>
                                            <p>The character of the fragrance reveals itself. This is the scent people notice.</p>
                                        </div>
                                        <div className="drydown-phase">
                                            <span className="drydown-phase-time">2–10+ hr</span>
                                            <span className="drydown-phase-name">Dry-Down</span>
                                            <p>The base notes settle into skin. Warm, deep, and uniquely yours.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'reviews' && (
                                <div className="product-reviews-content">
                                    {isAuthenticated && (
                                        <form className="review-form" onSubmit={handleReviewSubmit}>
                                            <h4>Share Your Experience</h4>
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
                                                placeholder="How does it wear on your skin? What occasions would you wear it?"
                                                value={reviewForm.comment}
                                                onChange={(e) => setReviewForm((p) => ({ ...p, comment: e.target.value }))}
                                                required
                                            />
                                            <div className="review-form-actions">
                                                <button className="btn btn-primary" type="submit" disabled={submitting}>
                                                    {submitting ? 'Submitting...' : 'Submit Review'}
                                                </button>
                                            </div>
                                        </form>
                                    )}
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

                {/* ─── Pairs Well With ─────────────────── */}
                {product.pairsWith?.length > 0 && (
                    <section className="pairs-well-section">
                        <div className="container">
                            <div className="section-header">
                                <span className="section-label">Fragrance Layering</span>
                                <h2 className="section-title">Pairs Well With</h2>
                            </div>
                            <div className="pairs-well-grid">
                                {product.pairsWith.map((pair) => (
                                    <Link key={pair.slug} to={`/product/${pair.slug}`} className="pair-card">
                                        <div className="pair-card-content">
                                            <h3 className="pair-card-name">{pair.name}</h3>
                                            <p className="pair-card-desc">{pair.description}</p>
                                            <span className="pair-card-link">Explore <FiArrowRight size={14} /></span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                            {product.layeringStory && (
                                <div className="layering-story">
                                    <p>{product.layeringStory}</p>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* ─── You May Also Love — Cross-sell ─────────── */}
                {related.length > 0 && (
                    <section className="product-crosssell section">
                        <div className="container">
                            <div className="section-header">
                                <span className="section-label">Complete Your Collection</span>
                                <h2 className="section-title">You May Also Love</h2>
                            </div>
                            <div className="grid-products">
                                {related.map((p, i) => (
                                    <ProductCard key={p._id} product={p} index={i} />
                                ))}
                            </div>
                            <div className="section-cta" style={{ marginTop: 'var(--space-2xl)' }}>
                                <Link to="/shop" className="btn btn-outline btn-lg">
                                    View All <FiArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    </section>
                )}
            </div>
        </>
    );
};

export default ProductDetail;
