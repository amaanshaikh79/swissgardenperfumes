import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FiFilter, FiX, FiChevronDown } from 'react-icons/fi';
import ProductCard from '../components/product/ProductCard';
import { productsAPI } from '../services/api';
import './Shop.css';

const CATEGORIES = ['All', 'Eau de Parfum', 'Attar', 'Eau de Toilette', 'Parfum', 'Body Mist', 'Gift Set'];
const GENDERS = ['All', 'Men', 'Women', 'Unisex'];
const FAMILIES = ['All', 'Floral', 'Oriental', 'Woody', 'Fresh', 'Citrus', 'Aquatic', 'Gourmand'];
const OCCASIONS = ['All', 'Office', 'Party', 'Date Night', 'Daily Wear', 'Travel'];
const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'bestselling', label: 'Best Selling' },
    { value: 'name_asc', label: 'A–Z' },
];

const Shop = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [filtersOpen, setFiltersOpen] = useState(false);

    // Filter states from URL
    const category = searchParams.get('category') || 'All';
    const gender = searchParams.get('gender') || 'All';
    const family = searchParams.get('fragranceFamily') || 'All';
    const occasion = searchParams.get('occasion') || 'All';
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
                if (gender !== 'All') params.gender = gender;
                if (family !== 'All') params.fragranceFamily = family;
                if (occasion !== 'All') params.occasion = occasion;
                if (search) params.search = search;
                if (minPrice) params.minPrice = minPrice;
                if (maxPrice) params.maxPrice = maxPrice;

                const { data } = await productsAPI.getAll(params);
                setProducts(data.products);
                setTotal(data.total);
                setPages(data.pages);
            } catch (err) {
                console.error('Failed to fetch products:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [category, gender, family, occasion, sort, search, minPrice, maxPrice, page]);

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

    return (
        <>
            <Helmet>
                <title>Shop Luxury Fragrances | GoldenBuck Perfumes</title>
                <meta name="description" content="Browse our curated collection of luxury perfumes. Filter by category, gender, and fragrance family." />
            </Helmet>

            <div className="shop-page">
                {/* Header */}
                <div className="shop-header">
                    <div className="container">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <span className="section-label">Collection</span>
                            <h1 className="section-title">
                                {search ? `Results for "${search}"` : 'Our Fragrances'}
                            </h1>
                            <p className="shop-results-count">{total} fragrance{total !== 1 ? 's' : ''} found</p>
                        </motion.div>
                    </div>
                </div>

                <div className="container shop-container">
                    {/* Filter Bar */}
                    <div className="shop-filter-bar">
                        <button className="btn btn-ghost shop-filter-toggle" onClick={() => setFiltersOpen(!filtersOpen)}>
                            <FiFilter size={16} /> Filters
                            {hasActiveFilters && <span className="filter-count">•</span>}
                        </button>

                        <div className="shop-sort">
                            <label>Sort by:</label>
                            <select className="form-input form-select shop-sort-select" value={sort} onChange={(e) => updateFilter('sort', e.target.value)}>
                                {SORT_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Filters Panel */}
                    {filtersOpen && (
                        <motion.div
                            className="shop-filters"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <div className="filter-group">
                                <h4 className="filter-group-title">Category</h4>
                                <div className="filter-options">
                                    {CATEGORIES.map((cat) => (
                                        <button
                                            key={cat}
                                            className={`filter-chip ${category === cat ? 'active' : ''}`}
                                            onClick={() => updateFilter('category', cat)}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="filter-group">
                                <h4 className="filter-group-title">Gender</h4>
                                <div className="filter-options">
                                    {GENDERS.map((g) => (
                                        <button
                                            key={g}
                                            className={`filter-chip ${gender === g ? 'active' : ''}`}
                                            onClick={() => updateFilter('gender', g)}
                                        >
                                            {g}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="filter-group">
                                <h4 className="filter-group-title">Occasion</h4>
                                <div className="filter-options">
                                    {OCCASIONS.map((occ) => (
                                        <button
                                            key={occ}
                                            className={`filter-chip ${occasion === occ ? 'active' : ''}`}
                                            onClick={() => updateFilter('occasion', occ)}
                                        >
                                            {occ}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="filter-group">
                                <h4 className="filter-group-title">Fragrance Family</h4>
                                <div className="filter-options">
                                    {FAMILIES.map((f) => (
                                        <button
                                            key={f}
                                            className={`filter-chip ${family === f ? 'active' : ''}`}
                                            onClick={() => updateFilter('fragranceFamily', f)}
                                        >
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="filter-group">
                                <h4 className="filter-group-title">Price Range</h4>
                                <div className="filter-price-range">
                                    <input
                                        type="number"
                                        className="form-input"
                                        placeholder="Min"
                                        value={minPrice}
                                        onChange={(e) => updateFilter('minPrice', e.target.value)}
                                    />
                                    <span>—</span>
                                    <input
                                        type="number"
                                        className="form-input"
                                        placeholder="Max"
                                        value={maxPrice}
                                        onChange={(e) => updateFilter('maxPrice', e.target.value)}
                                    />
                                </div>
                            </div>

                            {hasActiveFilters && (
                                <button className="btn btn-ghost" onClick={clearFilters}>
                                    <FiX size={14} /> Clear All Filters
                                </button>
                            )}
                        </motion.div>
                    )}

                    {/* Products Grid */}
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
                            <div className="grid-products">
                                {products.map((product, i) => (
                                    <ProductCard key={product._id} product={product} index={i} />
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
            </div>
        </>
    );
};

export default Shop;
