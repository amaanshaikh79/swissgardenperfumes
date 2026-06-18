import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FiFilter, FiX, FiArrowRight, FiMapPin } from 'react-icons/fi';
import ProductCard from '../components/product/ProductCard';
import { productsAPI } from '../services/api';
import './Shop.css';

const CATEGORIES = ['All', 'Eau de Parfum', 'Attar', 'Eau de Toilette', 'Parfum', 'Body Mist', 'Gift Set'];
const GENDERS = ['All', 'Gender-Free', 'Men', 'Women'];
const FAMILIES = ['All', 'Floral', 'Oriental', 'Woody', 'Fresh', 'Citrus', 'Aquatic', 'Gourmand'];
const OCCASIONS = ['All', 'Office', 'Party', 'Date Night', 'Daily Wear', 'Travel'];
const INTENSITIES = ['All', 'Light', 'Moderate', 'Strong', 'Intense'];
const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'bestselling', label: 'Best Selling' },
    { value: 'name_asc', label: 'A\u2013Z' },
];

const ingredientOrigins = [
    { name: 'Grasse Rose', origin: 'France', emoji: '\uD83C\uDDEB\uD83C\uDDF7' },
    { name: 'Mysore Sandalwood', origin: 'India', emoji: '\uD83C\uDDEE\uD83C\uDDF3' },
    { name: 'Bulgarian Rose', origin: 'Bulgaria', emoji: '\uD83C\uDDE7\uD83C\uDDEC' },
    { name: 'Cambodian Oud', origin: 'Cambodia', emoji: '\uD83C\uDDF0\uD83C\uDDED' },
    { name: 'Madagascar Vanilla', origin: 'Madagascar', emoji: '\uD83C\uDDF2\uD83C\uDDEC' },
    { name: 'Italian Bergamot', origin: 'Italy', emoji: '\uD83C\uDDEE\uD83C\uDDF9' },
];

const collectionMoods = {
    default: { title: 'The Collection', mood: 'Every scent tells a story. Find the one that speaks yours.' },
    Floral: { title: 'Floral Garden', mood: 'Petals, softness, and sun-warmed elegance.' },
    Oriental: { title: 'The Noir Edit', mood: 'Dark. Mysterious. Unforgettable.' },
    Woody: { title: 'Oud Heritage', mood: 'Rich. Regal. Timeless.' },
    Fresh: { title: 'Aqua Botanicals', mood: 'Crisp greens and morning dew.' },
    Citrus: { title: 'Citrus Sun', mood: 'Bright, zesty, and alive.' },
    Aquatic: { title: 'Ocean Breeze', mood: 'Cool waves and salt air.' },
    Gourmand: { title: 'Sweet Indulgence', mood: 'Warm, cozy, irresistible.' },
};

const Shop = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
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
    const intensity = searchParams.get('intensity') || 'All';
    const sort = searchParams.get('sort') || 'newest';
    const search = searchParams.get('search') || '';
    const minPrice = searchParams.get('minPrice') || '';
    const maxPrice = searchParams.get('maxPrice') || '';

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
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
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [category, gender, family, occasion, intensity, sort, search, minPrice, maxPrice, page]);

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

    const hasActiveFilters = category !== 'All' || gender !== 'All' || family !== 'All' || occasion !== 'All' || intensity !== 'All' || search || minPrice || maxPrice;
    const currentMood = collectionMoods[family] || collectionMoods.default;

    return (
        <>
            <Helmet>
                <title>{currentMood.title} | SwissGarden Perfumes</title>
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
                            <span className="section-label" style={{ color: 'var(--accent-200)' }}>Collection</span>
                            <h1 className="shop-hero-title">
                                {search ? `Results for \u201C${search}\u201D` : currentMood.title}
                            </h1>
                            <p className="shop-hero-mood">{currentMood.mood}</p>
                            <p className="shop-hero-count">{total} fragrance{total !== 1 ? 's' : ''}</p>
                        </motion.div>
                    </div>
                </div>

                {/* ─── Ingredient Origin Map ──────────────────── */}
                <section className="shop-origins">
                    <div className="container">
                        <div className="shop-origins-inner">
                            <div className="shop-origins-label">
                                <FiMapPin size={14} />
                                <span>Sourced from</span>
                            </div>
                            <div className="shop-origins-list">
                                {ingredientOrigins.map((ing) => (
                                    <span key={ing.name} className="shop-origin-tag">
                                        <span className="shop-origin-emoji">{ing.emoji}</span>
                                        {ing.name}
                                    </span>
                                ))}
                            </div>
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
                                <h4 className="filter-group-title">Intensity</h4>
                                <div className="filter-options">
                                    {INTENSITIES.map((int) => (
                                        <button key={int} className={`filter-chip ${intensity === int ? 'active' : ''}`} onClick={() => updateFilter('intensity', int)}>
                                            {int}
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
