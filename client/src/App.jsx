import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CartDrawer from './components/cart/CartDrawer';

import ExitIntentPopup from './components/common/ExitIntentPopup';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import { Login, Register } from './pages/Auth';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import Contact from './pages/Contact';
import About from './pages/About';
import AdminDashboard from './pages/Admin';
import OrderSuccess from './pages/OrderSuccess';
import ShippingPolicy from './pages/ShippingPolicy';
import ReturnPolicy from './pages/ReturnPolicy';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsConditions from './pages/TermsConditions';
import NotFound from './pages/NotFound';

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
    const isAuthPage = ['/login', '/register'].includes(location.pathname);

    return (
        <>
            <ScrollToTop />
            <ExitIntentPopup />
            {!isAuthPage && <Navbar />}
            <CartDrawer />
            <main>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/product/:slug" element={<ProductDetail />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/shipping-policy" element={<ShippingPolicy />} />
                    <Route path="/return-policy" element={<ReturnPolicy />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<TermsConditions />} />

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
            </main>
            {!isAuthPage && <Footer />}
        </>
    );
}

export default App;
