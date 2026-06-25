import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FiFilter, FiX, FiArrowRight } from 'react-icons/fi';
import ProductCard from '../components/product/ProductCard';
import { productsAPI } from '../services/api';
import './Shop.css';

const CATEGORIES = ['All', 'Eau de Parfum', 'Attar', 'Eau de Toilette', 'Parfum', 'Body Mist', 'Gift Set'];
const GENDERS = ['All', 'Gender-Free', 'Men', 'Women'];
const FAMILIES = ['All', 'Floral', 'Oriental', 'Woody', 'Fresh', 'Citrus', 'Aquatic', 'Gourmand'];
const OCCASIONS = ['All', 'Office', 'Party', 'Date Night', 'Daily Wear', 'Travel'];
const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'bestselling', label: 'Best Selling' },
    { value: 'name_asc', label: 'A\u2013Z' },
];


const collectionMoods = {
    default: { title: 'The Collection', mood: 'Every scent tells a story. Find the one that speaks yours.' },
    Floral: { title: 'Swiss Flora', mood: 'Warm, Alpine , and sun-warmed elegance.' },
    Oriental: { title: 'Royal Ascent', mood: 'Dark. Mysterious. Unforgettable.' },
    Woody: { title: 'Alpine Savage', mood: 'Rich. Regal. Timeless.' },
    Fresh: { title: 'Aqua Botanicals', mood: 'Crisp greens and morning dew.' },
    Citrus: { title: 'Citrus Sun', mood: 'Bright, zesty, and alive.' },
    Aquatic: { title: 'Ocean Breeze', mood: 'Cool waves and salt air.' },
    Gourmand: { title: 'Sweet Indulgence', mood: 'Warm, cozy, irresistible.' },
};

const Shop = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [hoveredProduct, setHoveredProduct] = useState(null);

    // Filter states from URL
    const category = searchParams.get('category') || 'All';
    const gender = searchParams.get('gender') || 'All';
    const family = searchParams.get('fragranceFamily') || 'All';
    const occasion = searchParams.get('occasion') || 'All';
    const sort = searchParams.get('sort') || 'newest';
    const search = searchParams.get('search') || '';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = { page, limit: 12, sort };
            if (category !== 'All') params.category = category;
            if (gender !== 'All') params.gender = gender === 'Gender-Free' ? 'Unisex' : gender;
            if (family !== 'All') params.fragranceFamily = family;
            if (occasion !== 'All') params.occasion = occasion;
            if (search) params.search = search;
            if (minPrice) params.minPrice = minPrice;
            if (maxPrice) params.maxPrice = maxPrice;

            const { data } = await productsAPI.getAll(params);
            setProducts(data.products || []);
            setTotal(data.total || 0);
            setPages(data.pages || 1);
        } catch (err) {
            console.error('Failed to fetch products:', err);
            setError('We could not load fragrances right now. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [category, gender, family, occasion, sort, search, minPrice, maxPrice, page]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const updateFilter = (key, value) => {
        const newParams = new URLSearchParams(searchParams);
        if (value === 'All' || value === '') {
            newParams.delete(key);
        } else {
            newParams.set(key, value);
        }
        setSearchParams(newParams);
        setPage(1);
    };

    const clearFilters = () => {
        setSearchParams({});
        setPage(1);
    };

    const hasActiveFilters = category !== 'All' || gender !== 'All' || family !== 'All' || occasion !== 'All' || search || minPrice || maxPrice;
    const currentMood = collectionMoods[family] || collectionMoods.default;

    const pageTitle = search
        ? `Search: ${search} | SwissGarden Perfumes`
        : (family !== 'All'
            ? `${currentMood.title} – ${family} Attars | SwissGarden Perfumes`
            : 'Shop All Attars & Luxury Perfumes | SwissGarden Perfumes');

    return (
        <>
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={`${currentMood.mood} Browse our curated collection of luxury perfumes.`} />
            </Helmet>

            <div className="shop-page">
                {/* ─── Collection Hero ─────────────────────────── */}
                <div className="shop-hero">
                    <div className="shop-hero-bg">
                        <div className="shop-hero-overlay" />
                    </div>
                    <div className="container">
                        <motion.div
                            className="shop-hero-content"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7 }}
                        >
                            <span className="section-label" style={{ color: 'var(--accent-200)' }}>The Mood Collection</span>
                            <h1 className="shop-hero-title">
                                {search ? `Results for \u201C${search}\u201D` : 'Six Attars. Six Moods. One Standard.'}
                            </h1>
                            <p className="shop-hero-mood">
                                {search ? currentMood.mood : 'Every fragrance in The Mood Collection is formulated to the same uncompromising standard — a structured note pyramid, non-alcoholic precision base, and roll-on delivery — and expresses a completely distinct emotional register. There is no hierarchy in this collection. There is only the mood you choose to wear today.'}
                            </p>
                        </motion.div>
                    </div>
                </div>

                {/* ─── Collection Overview Strips ──────────────── */}
                <section className="shop-overview">
                    <div className="container">
                        <div className="shop-overview-grid">
                            <motion.div
                                className="shop-overview-block"
                                initial={{ opacity: 0, y: 25 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                <h3 className="shop-overview-title">Collection Grid</h3>
                                <p className="shop-overview-text">
                                    Below each product you will find its mood profile, its note structure, and the occasions it is engineered for. Every attar in the collection pairs with at least two others. The Scent Pairing Guide on this site shows you every recommended combination.
                                </p>
                            </motion.div>
                            <motion.div
                                className="shop-overview-block"
                                initial={{ opacity: 0, y: 25 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.12 }}
                            >
                                <h3 className="shop-overview-title">Format & Formula</h3>
                                <ul className="shop-overview-specs">
                                    <li><strong>Format:</strong> 10ml precision roll-on attar</li>
                                    <li><strong>Base:</strong> Non-alcoholic carrier oil</li>
                                    <li><strong>Concentration:</strong> Long-lasting attar concentration</li>
                                    <li><strong>Application:</strong> Roll directly onto pulse points — inner wrist, base of throat, behind ear, inner elbow</li>
                                    <li><strong>Wear:</strong> Full-day progression from top note through base</li>
                                </ul>
                            </motion.div>
                        </div>
                    </div>
                </section>

                <div className="container shop-container">
                    {/* ─── Filter Bar ─────────────────────────── */}
                    <div className="shop-filter-bar">
                        <div className="shop-filter-bar-left">
                            <button className="btn btn-ghost shop-filter-toggle" onClick={() => setFiltersOpen(!filtersOpen)}>
                                <FiFilter size={16} /> Filters
                                {hasActiveFilters && <span className="filter-count">\u2022</span>}
                            </button>
                            {hasActiveFilters && (
                                <button className="btn btn-ghost shop-clear-btn" onClick={clearFilters}>
                                    <FiX size={14} /> Clear
                                </button>
                            )}
                        </div>

                        <div className="shop-sort">
                            <label>Sort by:</label>
                            <select className="form-input form-select shop-sort-select" value={sort} onChange={(e) => updateFilter('sort', e.target.value)}>
                                {SORT_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* ─── Filters Panel ──────────────────────── */}
                    {filtersOpen && (
                        <motion.div
                            className="shop-filters"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <div className="filter-group">
                                <h4 className="filter-group-title">Fragrance Family</h4>
                                <div className="filter-options">
                                    {FAMILIES.map((f) => (
                                        <button key={f} className={`filter-chip ${family === f ? 'active' : ''}`} onClick={() => updateFilter('fragranceFamily', f)}>
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="filter-group">
                                <h4 className="filter-group-title">Occasion</h4>
                                <div className="filter-options">
                                    {OCCASIONS.map((occ) => (
                                        <button key={occ} className={`filter-chip ${occasion === occ ? 'active' : ''}`} onClick={() => updateFilter('occasion', occ)}>
                                            {occ}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="filter-group">
                                <h4 className="filter-group-title">Gender-Free</h4>
                                <div className="filter-options">
                                    {GENDERS.map((g) => (
                                        <button key={g} className={`filter-chip ${gender === g ? 'active' : ''}`} onClick={() => updateFilter('gender', g)}>
                                            {g}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="filter-group">
                                <h4 className="filter-group-title">Category</h4>
                                <div className="filter-options">
                                    {CATEGORIES.map((cat) => (
                                        <button key={cat} className={`filter-chip ${category === cat ? 'active' : ''}`} onClick={() => updateFilter('category', cat)}>
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="filter-group">
                                <h4 className="filter-group-title">Price Range</h4>
                                <div className="filter-price-range">
                                    <input type="number" className="form-input" placeholder="Min" value={minPrice} onChange={(e) => updateFilter('minPrice', e.target.value)} />
                                    <span>\u2014</span>
                                    <input type="number" className="form-input" placeholder="Max" value={maxPrice} onChange={(e) => updateFilter('maxPrice', e.target.value)} />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ─── Products Grid with Hover Notes ─────── */}
                    {loading ? (
                        <div className="page-loader">
                            <div className="spinner" />
                            <span className="page-loader-text">Loading fragrances...</span>
                        </div>
                    ) : error ? (
                        <div className="shop-empty">
                            <h3>Something went wrong</h3>
                            <p>{error}</p>
                            <button className="btn btn-outline" onClick={fetchProducts}>Retry</button>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="shop-empty">
                            <h3>No fragrances found</h3>
                            <p>Try adjusting your filters or search terms.</p>
                            <button className="btn btn-outline" onClick={clearFilters}>Clear Filters</button>
                        </div>
                    ) : (
                        <>
                            <div className="grid-products shop-grid-enhanced">
                                {products.map((product, i) => (
                                    <div
                                        key={product._id}
                                        className="shop-product-wrapper"
                                        onMouseEnter={() => setHoveredProduct(product._id)}
                                        onMouseLeave={() => setHoveredProduct(null)}
                                    >
                                        <ProductCard product={product} index={i} />
                                        {/* Hover-reveal scent notes */}
                                        {hoveredProduct === product._id && product.fragranceNotes && (
                                            <motion.div
                                                className="shop-hover-notes"
                                                initial={{ opacity: 0, y: 6 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                {product.fragranceNotes.top?.length > 0 && (
                                                    <div className="shop-hover-note-row">
                                                        <span className="shop-hover-note-label">Top</span>
                                                        <span>{product.fragranceNotes.top.slice(0, 3).join(', ')}</span>
                                                    </div>
                                                )}
                                                {product.fragranceNotes.middle?.length > 0 && (
                                                    <div className="shop-hover-note-row">
                                                        <span className="shop-hover-note-label">Heart</span>
                                                        <span>{product.fragranceNotes.middle.slice(0, 3).join(', ')}</span>
                                                    </div>
                                                )}
                                                {product.fragranceNotes.base?.length > 0 && (
                                                    <div className="shop-hover-note-row">
                                                        <span className="shop-hover-note-label">Base</span>
                                                        <span>{product.fragranceNotes.base.slice(0, 3).join(', ')}</span>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {pages > 1 && (
                                <div className="shop-pagination">
                                    {[...Array(pages)].map((_, i) => (
                                        <button
                                            key={i}
                                            className={`pagination-btn ${page === i + 1 ? 'active' : ''}`}
                                            onClick={() => {
                                                setPage(i + 1);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* ─── Collection Story ────────────────────────── */}
                <section className="shop-story">
                    <div className="container-sm">
                        <motion.div
                            className="shop-story-content"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <span className="section-label">The SwissGarden Way</span>
                            <h2 className="shop-story-title">Grouped by Mood, Not Just Category</h2>
                            <p className="shop-story-text">
                                We don't believe fragrance fits neatly into boxes. Each scent in our collection is crafted around
                                an emotion, a memory, a moment. Whether you're looking for confidence before a meeting, warmth
                                on a winter evening, or something that makes strangers turn around — we've built a scent for that.
                            </p>
                            <Link to="/fragrance-finder" className="btn btn-outline btn-lg">
                                Find Your Perfect Match <FiArrowRight size={16} />
                            </Link>
                        </motion.div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default Shop;
