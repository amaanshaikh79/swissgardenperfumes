import { useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiPackage, FiArrowRight, FiShoppingBag, FiMapPin, FiCreditCard, FiClock } from 'react-icons/fi';
import './OrderSuccess.css';

const OrderSuccess = () => {
    const { orderId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const { order, paymentId, paymentMethod } = location.state || {};

    // If someone lands here directly without state, redirect to orders
    useEffect(() => {
        if (!order) {
            navigate('/orders', { replace: true });
        }
    }, [order, navigate]);

    if (!order) return null;

    const isCOD = paymentMethod === 'cod';
    const itemCount = order.orderItems?.length || 0;

    return (
        <>
            <Helmet><title>Order Confirmed | swissgarden Perfumes</title></Helmet>
            <div className="success-page">

                {/* ── Animated Tick ─────────────────────────────── */}
                <motion.div
                    className="success-icon-wrap"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.1 }}
                >
                    <div className="success-icon-ring">
                        <FiCheckCircle className="success-icon" />
                    </div>
                </motion.div>

                <motion.div
                    className="success-content"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    {/* ── Headline ─────────────────────────────────── */}
                    <h1 className="success-title">
                        {isCOD ? 'Order Placed!' : 'Payment Successful!'}
                    </h1>
                    <p className="success-subtitle">
                        {isCOD
                            ? 'Your order has been placed successfully. Our team will process it shortly.'
                            : 'Your payment was confirmed and your order is now being processed.'}
                    </p>

                    {/* ── Order Info Cards ─────────────────────────── */}
                    <div className="success-info-grid">
                        <div className="success-info-card">
                            <FiPackage className="success-info-icon" />
                            <div>
                                <span className="success-info-label">Order Number</span>
                                <strong className="success-info-value success-order-num">
                                    {order.orderNumber || `#${orderId?.slice(-8).toUpperCase()}`}
                                </strong>
                            </div>
                        </div>

                        {!isCOD && paymentId && (
                            <div className="success-info-card">
                                <FiCreditCard className="success-info-icon" />
                                <div>
                                    <span className="success-info-label">Payment ID</span>
                                    <strong className="success-info-value success-payment-id">
                                        {paymentId}
                                    </strong>
                                </div>
                            </div>
                        )}

                        <div className="success-info-card">
                            <FiMapPin className="success-info-icon" />
                            <div>
                                <span className="success-info-label">Deliver To</span>
                                <strong className="success-info-value">
                                    {order.shippingAddress?.city}, {order.shippingAddress?.state}
                                </strong>
                            </div>
                        </div>

                        <div className="success-info-card">
                            <FiClock className="success-info-icon" />
                            <div>
                                <span className="success-info-label">Estimated Delivery</span>
                                <strong className="success-info-value">5 – 7 Business Days</strong>
                            </div>
                        </div>
                    </div>

                    {/* ── Ordered Items ─────────────────────────────── */}
                    {order.orderItems && order.orderItems.length > 0 && (
                        <div className="success-items">
                            <h3 className="success-items-title">
                                <FiShoppingBag size={16} />
                                Items Ordered ({itemCount})
                            </h3>
                            <div className="success-items-list">
                                {order.orderItems.map((item, idx) => (
                                    <div key={idx} className="success-item">
                                        {item.image && (
                                            <img src={item.image} alt={item.name} className="success-item-img" />
                                        )}
                                        <div className="success-item-info">
                                            <span className="success-item-name">{item.name}</span>
                                            {item.size && <span className="success-item-meta">{item.size}</span>}
                                        </div>
                                        <div className="success-item-right">
                                            <span className="success-item-qty">× {item.quantity}</span>
                                            <span className="success-item-price">₹{(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Price Summary */}
                            <div className="success-price-summary">
                                <div className="success-price-row">
                                    <span>Items Total</span>
                                    <span>₹{order.itemsPrice?.toFixed(2) || '—'}</span>
                                </div>
                                {order.shippingPrice !== undefined && (
                                    <div className="success-price-row">
                                        <span>Shipping</span>
                                        <span>{order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice.toFixed(2)}`}</span>
                                    </div>
                                )}
                                {order.taxPrice !== undefined && (
                                    <div className="success-price-row">
                                        <span>Tax</span>
                                        <span>₹{order.taxPrice.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="success-price-row success-price-total">
                                    <span>Total Paid</span>
                                    <span>₹{order.totalPrice?.toFixed(2) || '—'}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── COD Notice ────────────────────────────────── */}
                    {isCOD && (
                        <div className="success-cod-notice">
                            🚚 Please keep <strong>₹{order.totalPrice?.toFixed(2)}</strong> ready at the time of delivery.
                        </div>
                    )}

                    {/* ── Email Notice ──────────────────────────────── */}
                    <p className="success-email-note">
                        📧 A confirmation email has been sent to <strong>{order.user?.email || 'your email'}</strong>.
                    </p>

                    {/* ── Action Buttons ────────────────────────────── */}
                    <div className="success-actions">
                        <Link to="/orders" className="btn btn-primary success-btn">
                            Track My Order <FiArrowRight />
                        </Link>
                        <Link to="/shop" className="btn btn-outline success-btn">
                            Continue Shopping
                        </Link>
                    </div>
                </motion.div>
            </div>
        </>
    );
};

export default OrderSuccess;
