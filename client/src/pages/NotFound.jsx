import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiHome, FiShoppingBag } from 'react-icons/fi';
import './NotFound.css';

const NotFound = () => {
    const location = useLocation();

    return (
        <>
            <Helmet>
                <title>404 — Page Not Found | SwissGarden Perfumes</title>
            </Helmet>
            <div className="notfound-page">
                <div className="notfound-container">
                    <motion.div
                        className="notfound-content"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        {/* Decorative scent rings */}
                        <div className="notfound-visual">
                            <div className="notfound-ring ring-1" />
                            <div className="notfound-ring ring-2" />
                            <div className="notfound-ring ring-3" />
                            <span className="notfound-emoji">🌿</span>
                        </div>

                        <div className="notfound-number">404</div>
                        <h1 className="notfound-title">Lost in the Trails</h1>
                        <p className="notfound-desc">
                            The page you're looking for seems to have evaporated like a morning mist.
                            {location.pathname !== '/' && (
                                <><br /><span className="notfound-path">"{location.pathname}"</span> doesn't exist.</>
                            )}
                        </p>

                        <div className="notfound-actions">
                            <Link to="/" className="btn btn-primary btn-lg">
                                <FiHome size={16} /> Go Home
                            </Link>
                            <Link to="/shop" className="btn btn-outline btn-lg">
                                <FiShoppingBag size={16} /> Shop Fragrances
                            </Link>
                        </div>

                        <button
                            className="notfound-back"
                            onClick={() => window.history.back()}
                        >
                            <FiArrowLeft size={14} /> Go back to previous page
                        </button>
                    </motion.div>
                </div>
            </div>
        </>
    );
};

export default NotFound;
