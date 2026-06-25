import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiPackage, FiClock, FiCheck, FiTruck, FiFileText, FiX, FiDownload, FiPrinter, FiChevronDown, FiChevronUp, FiMapPin, FiRotateCcw, FiXCircle } from 'react-icons/fi';
import { ordersAPI, returnAPI } from '../services/api';
import './Orders.css';

const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount || 0);
};

const statusIcons = {
    Processing: <FiClock size={16} />,
    Confirmed: <FiCheck size={16} />,
    Shipped: <FiTruck size={16} />,
    Delivered: <FiPackage size={16} />,
};

const statusColors = {
    Processing: 'gold',
    Confirmed: 'gold',
    Shipped: 'gold',
    Delivered: 'success',
    Cancelled: 'error',
};

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [invoiceOrder, setInvoiceOrder] = useState(null);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [showReturnForm, setShowReturnForm] = useState(null);
    const [returnForm, setReturnForm] = useState({
        orderId: '',
        returnItems: [],
        returnReason: '',
        description: '',
        refundMethod: 'original_payment',
        refundAmount: 0,
    });
    const [returns, setReturns] = useState([]);
    const invoiceRef = useRef(null);

    // Generate tracking timeline based on order status
    const getTrackingTimeline = (order) => {
        const steps = [
            { key: 'confirmed', label: 'Confirmed', icon: <FiCheck size={16} /> },
            { key: 'shipped', label: 'Shipped', icon: <FiTruck size={16} /> },
            { key: 'outForDelivery', label: 'Out for Delivery', icon: <FiMapPin size={16} /> },
            { key: 'delivered', label: 'Delivered', icon: <FiPackage size={16} /> },
        ];

        const statusIndex = {
            'Processing': 0,
            'Confirmed': 1,
            'Shipped': 2,
            'Out for Delivery': 3,
            'Delivered': 4,
        };

        const currentIndex = statusIndex[order.orderStatus] || 0;

        // Calculate dates for each step (using createdAt as base)
        const baseDate = new Date(order.createdAt);
        const stepDates = steps.map((step, index) => {
            if (index < currentIndex) {
                // Past step - add some time to base date
                const date = new Date(baseDate);
                date.setDate(date.getDate() + index);
                return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
            } else if (index === currentIndex - 1 && order.orderStatus !== 'Processing') {
                // Current step - use actual order date
                return new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
            }
            return null;
        });

        return steps.map((step, index) => ({
            ...step,
            completed: index < currentIndex,
            current: index === currentIndex - 1,
            date: stepDates[index],
        }));
    };

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await ordersAPI.getMy();
                setOrders(data.orders);
            } catch (err) {
                console.error('Failed to fetch orders:', err);
            } finally {
                setLoading(false);
            }
        };

        const fetchReturns = async () => {
            try {
                const { data } = await returnAPI.getMy();
                setReturns(data.returns || []);
            } catch (err) {
                console.error('Failed to fetch returns:', err);
            }
        };

        fetchOrders();
        fetchReturns();
    }, []);

    const handleCancelOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) return;
        try {
            await ordersAPI.cancel(orderId);
            setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, orderStatus: 'Cancelled' } : o)));
            toast.success('Order cancelled successfully');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to cancel order');
        }
    };

    const handleOpenReturnForm = (order) => {
        setShowReturnForm(order._id);
        setReturnForm({
            orderId: order._id,
            returnItems: order.orderItems.map((item) => ({
                product: item.product,
                name: item.name,
                quantity: item.quantity,
                reason: '',
                condition: 'unopened',
            })),
            returnReason: '',
            description: '',
            refundMethod: 'original_payment',
            refundAmount: order.totalPrice,
        });
    };

    const handleSubmitReturn = async (e) => {
        e.preventDefault();
        try {
            await returnAPI.create(returnForm);
            toast.success('Return request submitted successfully');
            setShowReturnForm(null);
            // Refresh returns
            const { data } = await returnAPI.getMy();
            setReturns(data.returns || []);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit return request');
        }
    };

    const handlePrintInvoice = () => {
        const printContent = invoiceRef.current;
        if (!printContent) return;
        const win = window.open('', '_blank');
        win.document.write(`
            <html>
            <head>
                <title>Invoice - ${invoiceOrder.orderNumber}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #1a1a1a; }
                    .invoice-container { max-width: 700px; margin: 0 auto; }
                    .invoice-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; border-bottom: 2px solid #1a1a2e; padding-bottom: 20px; }
                    .invoice-brand { font-size: 1.6rem; font-weight: 700; color: #1a1a2e; letter-spacing: -0.5px; }
                    .invoice-brand-sub { font-size: 0.7rem; letter-spacing: 3px; color: #666; text-transform: uppercase; }
                    .invoice-title { text-align: right; }
                    .invoice-title h2 { font-size: 1.4rem; color: #1a1a2e; }
                    .invoice-title p { font-size: 0.8rem; color: #666; margin-top: 4px; }
                    .invoice-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px; }
                    .invoice-meta-box h4 { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1px; color: #999; margin-bottom: 6px; }
                    .invoice-meta-box p { font-size: 0.85rem; line-height: 1.6; }
                    .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
                    .invoice-table th { background: #f5f5f7; padding: 10px 12px; text-align: left; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.5px; color: #666; border-bottom: 1px solid #e0e0e0; }
                    .invoice-table td { padding: 12px; border-bottom: 1px solid #f0f0f0; font-size: 0.85rem; }
                    .invoice-table .text-right { text-align: right; }
                    .invoice-totals { margin-left: auto; width: 260px; }
                    .invoice-totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 0.85rem; color: #555; }
                    .invoice-totals-row.total { border-top: 2px solid #1a1a2e; margin-top: 8px; padding-top: 10px; font-size: 1.05rem; font-weight: 700; color: #1a1a2e; }
                    .invoice-totals-row.discount { color: #2ecc71; }
                    .invoice-footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 0.75rem; color: #999; }
                    .invoice-badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 0.7rem; font-weight: 600; }
                    .badge-paid { background: #e8f8f0; color: #27ae60; }
                    .badge-pending { background: #fef5e7; color: #f39c12; }
                </style>
            </head>
            <body>${printContent.innerHTML}</body>
            </html>
        `);
        win.document.close();
        win.print();
    };

    if (loading) {
        return <div className="page-loader" style={{ paddingTop: '120px' }}><div className="spinner" /></div>;
    }

    return (
        <>
            <Helmet><title>My Orders | SwissGarden Perfumes</title></Helmet>
            <div className="orders-page">
                <div className="container-sm">
                    <h1 className="page-title">My Orders</h1>
                    {orders.length === 0 ? (
                        <div className="orders-empty">
                            <FiPackage size={48} />
                            <p>No orders yet. Start exploring our collection!</p>
                        </div>
                    ) : (
                        <div className="orders-list">
                            {orders.map((order, i) => (
                                <motion.div
                                    key={order._id}
                                    className="order-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                >
                                    <div className="order-card-header">
                                        <div>
                                            <h3 className="order-number">{order.orderNumber}</h3>
                                            <span className="order-date">
                                                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                    year: 'numeric', month: 'long', day: 'numeric',
                                                })}
                                            </span>
                                        </div>
                                        <span className={`badge badge-${statusColors[order.orderStatus] || 'gold'}`}>
                                            {statusIcons[order.orderStatus]} {order.orderStatus}
                                        </span>
                                    </div>

                                    <div className="order-items-preview">
                                        {order.orderItems.map((item) => (
                                            <div key={item._id} className="order-item-mini">
                                                {item.image && <img src={item.image} alt={item.name} />}
                                                <div>
                                                    <span className="order-item-name">{item.name}</span>
                                                    <span className="order-item-qty">
                                                        {item.size && `${item.size} · `}Qty: {item.quantity}
                                                    </span>
                                                </div>
                                                <span className="order-item-price">{formatINR(item.price * item.quantity)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="order-card-footer">
                                        <div className="order-footer-left">
                                            <span className="order-total">Total: <strong>{formatINR(order.totalPrice)}</strong></span>
                                            <span className="order-payment-method">
                                                {order.paymentMethod === 'cod' ? '💵 Cash on Delivery' : '💳 Paid Online'}
                                            </span>
                                        </div>
                                        <div className="order-footer-right">
                                            <span className={`badge ${order.isPaid ? 'badge-success' : 'badge-warning'}`}>
                                                {order.isPaid ? '✓ Paid' : '⏳ Pending'}
                                            </span>
                                            {order.orderStatus !== 'Cancelled' && ['Processing', 'Confirmed'].includes(order.orderStatus) && (
                                                <button
                                                    className="btn btn-ghost btn-sm order-cancel-btn"
                                                    onClick={() => handleCancelOrder(order._id)}
                                                >
                                                    <FiXCircle size={14} /> Cancel
                                                </button>
                                            )}
                                            {order.orderStatus === 'Delivered' && (
                                                <button
                                                    className="btn btn-ghost btn-sm order-return-btn"
                                                    onClick={() => handleOpenReturnForm(order)}
                                                >
                                                    <FiRotateCcw size={14} /> Return
                                                </button>
                                            )}
                                            <button
                                                className="btn btn-ghost btn-sm order-invoice-btn"
                                                onClick={() => setInvoiceOrder(order)}
                                            >
                                                <FiFileText size={14} /> Invoice
                                            </button>
                                            <button
                                                className="btn btn-ghost btn-sm order-track-btn"
                                                onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                                            >
                                                {expandedOrder === order._id ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                                                Track
                                            </button>
                                        </div>
                                    </div>

                                    {/* Order Tracking Timeline */}
                                    <AnimatePresence>
                                        {expandedOrder === order._id && (
                                            <motion.div
                                                className="order-tracking-timeline"
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <div className="tracking-timeline">
                                                    {getTrackingTimeline(order).map((step, index) => (
                                                        <div
                                                            key={step.key}
                                                            className={`timeline-step ${step.completed ? 'completed' : ''} ${step.current ? 'current' : ''}`}
                                                        >
                                                            <div className="timeline-icon-wrapper">
                                                                <div className="timeline-icon">
                                                                    {step.completed || step.current ? step.icon : <FiClock size={16} />}
                                                                </div>
                                                                {index < getTrackingTimeline(order).length - 1 && (
                                                                    <div className="timeline-line" />
                                                                )}
                                                            </div>
                                                            <div className="timeline-content">
                                                                <h4 className="timeline-label">{step.label}</h4>
                                                                {step.date && <span className="timeline-date">{step.date}</span>}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* ═══ Returns Section ═══ */}
                    {returns.length > 0 && (
                        <div style={{ marginTop: '48px' }}>
                            <h2 style={{ marginBottom: '20px', fontSize: '24px' }}>My Return Requests</h2>
                            <div className="orders-list">
                                {returns.map((ret, i) => (
                                    <motion.div
                                        key={ret._id}
                                        className="order-card"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.08 }}
                                    >
                                        <div className="order-card-header">
                                            <div>
                                                <h3 className="order-number">Return Request</h3>
                                                <span className="order-date">
                                                    {new Date(ret.createdAt).toLocaleDateString('en-IN', {
                                                        year: 'numeric', month: 'long', day: 'numeric',
                                                    })}
                                                </span>
                                            </div>
                                            <span className={`badge badge-${ret.status === 'completed' ? 'success' : ret.status === 'approved' ? 'success' : ret.status === 'rejected' ? 'error' : 'gold'}`}>
                                                {ret.status.charAt(0).toUpperCase() + ret.status.slice(1)}
                                            </span>
                                        </div>
                                        <div className="order-items-preview">
                                            <div className="order-item-mini">
                                                <div>
                                                    <span className="order-item-name">Refund Amount: {formatINR(ret.refundAmount)}</span>
                                                    <span className="order-item-qty">Refund Method: {ret.refundMethod.replace('_', ' ')}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="order-card-footer">
                                            <div className="order-footer-left">
                                                <span className="order-total">Reason: <strong>{ret.returnReason.replace('_', ' ')}</strong></span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ═══ Invoice Modal ═══ */}
            <AnimatePresence>
                {invoiceOrder && (
                    <>
                        <motion.div
                            className="invoice-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setInvoiceOrder(null)}
                        />
                        <div className="invoice-modal-wrapper">
                            <motion.div
                                className="invoice-modal"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.25 }}
                            >
                            <div className="invoice-modal-header">
                                <h3><FiFileText size={18} /> Invoice</h3>
                                <div className="invoice-modal-actions">
                                    <button className="btn btn-ghost btn-sm" onClick={handlePrintInvoice}>
                                        <FiPrinter size={14} /> Print
                                    </button>
                                    <button className="invoice-modal-close" onClick={() => setInvoiceOrder(null)}>
                                        <FiX size={20} />
                                    </button>
                                </div>
                            </div>
                            <div className="invoice-modal-body" ref={invoiceRef}>
                                <div className="invoice-container">
                                    {/* Header */}
                                    <div className="invoice-header">
                                        <div>
                                            <div className="invoice-brand">SwissGarden</div>
                                            <div className="invoice-brand-sub">PERFUMES</div>
                                        </div>
                                        <div className="invoice-title">
                                            <h2>INVOICE</h2>
                                            <p>{invoiceOrder.orderNumber}</p>
                                            <p>{new Date(invoiceOrder.createdAt).toLocaleDateString('en-IN', {
                                                year: 'numeric', month: 'short', day: 'numeric',
                                            })}</p>
                                        </div>
                                    </div>

                                    {/* Meta */}
                                    <div className="invoice-meta">
                                        <div className="invoice-meta-box">
                                            <h4>Shipping Address</h4>
                                            <p>
                                                {invoiceOrder.shippingAddress.street}<br />
                                                {invoiceOrder.shippingAddress.landmark && <>{invoiceOrder.shippingAddress.landmark}<br /></>}
                                                {invoiceOrder.shippingAddress.city}, {invoiceOrder.shippingAddress.state} {invoiceOrder.shippingAddress.zipCode}<br />
                                                {invoiceOrder.shippingAddress.country}
                                            </p>
                                        </div>
                                        <div className="invoice-meta-box">
                                            <h4>Payment</h4>
                                            <p>
                                                Method: {invoiceOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online (Razorpay)'}<br />
                                                Status: <span className={`invoice-badge ${invoiceOrder.isPaid ? 'badge-paid' : 'badge-pending'}`}>
                                                    {invoiceOrder.isPaid ? 'Paid' : 'Pending'}
                                                </span>
                                                {invoiceOrder.paidAt && <><br />Paid on: {new Date(invoiceOrder.paidAt).toLocaleDateString('en-IN')}</>}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Items Table */}
                                    <table className="invoice-table">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Item</th>
                                                <th>Size</th>
                                                <th className="text-right">Price</th>
                                                <th className="text-right">Qty</th>
                                                <th className="text-right">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {invoiceOrder.orderItems.map((item, idx) => (
                                                <tr key={item._id}>
                                                    <td>{idx + 1}</td>
                                                    <td>{item.name}</td>
                                                    <td>{item.size || '—'}</td>
                                                    <td className="text-right">{formatINR(item.price)}</td>
                                                    <td className="text-right">{item.quantity}</td>
                                                    <td className="text-right">{formatINR(item.price * item.quantity)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {/* Totals */}
                                    <div className="invoice-totals">
                                        <div className="invoice-totals-row">
                                            <span>Subtotal</span>
                                            <span>{formatINR(invoiceOrder.itemsPrice)}</span>
                                        </div>
                                        <div className="invoice-totals-row">
                                            <span>Shipping</span>
                                            <span>{invoiceOrder.shippingPrice === 0 ? 'FREE' : formatINR(invoiceOrder.shippingPrice)}</span>
                                        </div>
                                        {(invoiceOrder.comboDiscount > 0) && (
                                            <div className="invoice-totals-row discount">
                                                <span>Combo Discount</span>
                                                <span>−{formatINR(invoiceOrder.comboDiscount)}</span>
                                            </div>
                                        )}
                                        {(invoiceOrder.codCharge > 0) && (
                                            <div className="invoice-totals-row">
                                                <span>COD Charge</span>
                                                <span>+{formatINR(invoiceOrder.codCharge)}</span>
                                            </div>
                                        )}
                                        {(invoiceOrder.couponDiscount > 0) && (
                                            <div className="invoice-totals-row discount">
                                                <span>Coupon ({invoiceOrder.couponCode})</span>
                                                <span>−{formatINR(invoiceOrder.couponDiscount)}</span>
                                            </div>
                                        )}
                                        <div className="invoice-totals-row total">
                                            <span>Total</span>
                                            <span>{formatINR(invoiceOrder.totalPrice)}</span>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="invoice-footer">
                                        <p>Thank you for shopping with SwissGarden Perfumes!</p>
                                        <p style={{ marginTop: '4px' }}>GST included in MRP • All prices in INR (₹)</p>
                                    </div>
                                </div>
                            </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>

            {/* ═══ Return Request Modal ═══ */}
            <AnimatePresence>
                {showReturnForm && (
                    <>
                        <motion.div
                            className="invoice-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowReturnForm(null)}
                        />
                        <div className="invoice-modal-wrapper">
                            <motion.div
                                className="invoice-modal"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.25 }}
                            >
                            <div className="invoice-modal-header">
                                <h3><FiRotateCcw size={18} /> Return Request</h3>
                                <button className="invoice-modal-close" onClick={() => setShowReturnForm(null)}>
                                    <FiX size={20} />
                                </button>
                            </div>
                            <div className="invoice-modal-body">
                                <form onSubmit={handleSubmitReturn}>
                                    <div className="form-group" style={{ marginBottom: '16px' }}>
                                        <label>Return Reason *</label>
                                        <select
                                            value={returnForm.returnReason}
                                            onChange={(e) => setReturnForm({ ...returnForm, returnReason: e.target.value })}
                                            required
                                        >
                                            <option value="">Select a reason</option>
                                            <option value="wrong_item">Wrong item received</option>
                                            <option value="damaged">Item damaged</option>
                                            <option value="not_as_described">Not as described</option>
                                            <option value="changed_mind">Changed my mind</option>
                                            <option value="defective">Defective product</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div className="form-group" style={{ marginBottom: '16px' }}>
                                        <label>Description</label>
                                        <textarea
                                            placeholder="Please provide details about your return..."
                                            rows="3"
                                            value={returnForm.description}
                                            onChange={(e) => setReturnForm({ ...returnForm, description: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group" style={{ marginBottom: '16px' }}>
                                        <label>Refund Method *</label>
                                        <select
                                            value={returnForm.refundMethod}
                                            onChange={(e) => setReturnForm({ ...returnForm, refundMethod: e.target.value })}
                                            required
                                        >
                                            <option value="original_payment">Original Payment Method</option>
                                            <option value="store_credit">Store Credit</option>
                                            <option value="bank_transfer">Bank Transfer</option>
                                        </select>
                                    </div>
                                    <div className="form-group" style={{ marginBottom: '16px' }}>
                                        <label>Refund Amount</label>
                                        <input
                                            type="number"
                                            value={returnForm.refundAmount}
                                            readOnly
                                            style={{ background: 'var(--bg-secondary)' }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                                        <button type="button" className="btn btn-ghost" onClick={() => setShowReturnForm(null)}>
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn btn-primary">
                                            Submit Return Request
                                        </button>
                                    </div>
                                </form>
                            </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Orders;
