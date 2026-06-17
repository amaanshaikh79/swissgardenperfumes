import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useCallback, lazy, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CartDrawer from './components/cart/CartDrawer';

import ExitIntentPopup from './components/common/ExitIntentPopup';
import SplashScreen from './components/common/SplashScreen';
import AIChatbox from './components/common/AIChatbox';

// Eager load critical pages
import Home from './pages/Home';
import { Login, Register } from './pages/Auth';

// Lazy load other pages
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Orders = lazy(() => import('./pages/Orders'));
const Profile = lazy(() => import('./pages/Profile'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Contact = lazy(() => import('./pages/Contact'));
const About = lazy(() => import('./pages/About'));
const FragranceFinder = lazy(() => import('./pages/FragranceFinder'));
const AdminDashboard = lazy(() => import('./pages/Admin'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const ShippingPolicy = lazy(() => import('./pages/ShippingPolicy'));
const ReturnPolicy = lazy(() => import('./pages/ReturnPolicy'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsConditions = lazy(() => import('./pages/TermsConditions'));
const OAuthCallback = lazy(() => import('./pages/OAuthCallback'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Loading fallback component
const PageLoader = () => (
    <div className="page-loader" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
    </div>
);

// Scroll to top on every route change
const ScrollToTop = () => {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [pathname]);
    return null;
};

// Protected Route component
const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="page-loader">
                <div className="spinner" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (adminOnly && user?.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return children;
};

function App() {
    const location = useLocation();
    const isAuthPage = ['/login', '/register', '/auth/callback'].includes(location.pathname);
    const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem('sg_splash_shown'));

    const handleSplashComplete = useCallback(() => {
        setShowSplash(false);
        sessionStorage.setItem('sg_splash_shown', '1');
    }, []);

    return (
        <>
            <AnimatePresence>
                {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
            </AnimatePresence>
            <ScrollToTop />
            <ExitIntentPopup />
            {!isAuthPage && <Navbar />}
            <CartDrawer />
            <main>
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/shop" element={<Shop />} />
                        <Route path="/product/:slug" element={<ProductDetail />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/fragrance-finder" element={<FragranceFinder />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/shipping-policy" element={<ShippingPolicy />} />
                        <Route path="/return-policy" element={<ReturnPolicy />} />
                        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                        <Route path="/terms" element={<TermsConditions />} />
                        <Route path="/auth/callback" element={<OAuthCallback />} />

                        {/* Protected Routes */}
                        <Route path="/checkout" element={
                            <ProtectedRoute><Checkout /></ProtectedRoute>
                        } />
                        <Route path="/orders" element={
                            <ProtectedRoute><Orders /></ProtectedRoute>
                        } />
                        <Route path="/profile" element={
                            <ProtectedRoute><Profile /></ProtectedRoute>
                        } />
                        <Route path="/wishlist" element={
                            <ProtectedRoute><Wishlist /></ProtectedRoute>
                        } />
                        <Route path="/order-success/:orderId" element={
                            <ProtectedRoute><OrderSuccess /></ProtectedRoute>
                        } />

                        {/* Admin Routes */}
                        <Route path="/admin" element={
                            <ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>
                        } />

                        {/* 404 */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </Suspense>
            </main>
            {!isAuthPage && <Footer />}
            {!isAuthPage && <AIChatbox />}
        </>
    );
}

export default App;
