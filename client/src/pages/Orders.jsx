import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiPackage, FiClock, FiCheck, FiTruck, FiFileText, FiX, FiDownload, FiPrinter, FiChevronDown, FiChevronUp, FiMapPin, FiRotateCcw, FiXCircle } from 'react-icons/fi';
import { ordersAPI, returnAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Orders.css';

const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount || 0);
};

// Seller details printed on the tax invoice. GSTIN is left blank until the
// company registration number is available — set it to display on invoices.
const SELLER = {
    legalName: 'Golden Buck Private Limited',
    brand: 'SwissGarden Perfumes',
    address: 'C-589 DDA Flat, Pocket 11, Jasola, New Delhi 110025, India',
    email: 'support@swissgardenperfumes.com',
    phone: '+91 9354936369',
    gstin: '', // TODO: set company GSTIN to print on tax invoices
    hsn: '3303', // HSN for perfumes & toilet waters
};

/**
 * Reverse-calculate the GST already contained in a GST-inclusive total.
 * Store prices include 18% GST, so the invoice must EXTRACT the tax component
 * (never add it on top) — the grand total always equals the amount charged.
 * Integer-rupee rounding keeps the breakdown reconciling exactly to the total.
 */
const computeGST = (order) => {
    const grand = Math.round(order.totalPrice || 0);
    const taxable = Math.round(grand / 1.18);
    const gstTotal = grand - taxable;
    const cgst = Math.round(gstTotal / 2);
    const sgst = gstTotal - cgst;
    return { grand, taxable, gstTotal, cgst, sgst };
};

const statusIcons = {
    Processing: <FiClock size={16} />,
    Confirmed: <FiCheck size={16} />,
    Shipped: <FiTruck size={16} />,
    'Out for Delivery': <FiMapPin size={16} />,
    Delivered: <FiPackage size={16} />,
};

const statusColors = {
    Processing: 'gold',
    Confirmed: 'gold',
    Shipped: 'gold',
    'Out for Delivery': 'gold',
    Delivered: 'success',
    Cancelled: 'error',
};

/** Public Shiprocket tracking / verify URL (AWB-based). */
const getShiprocketTrackUrl = (order) => {
    if (order.shiprocket?.trackingUrl) return order.shiprocket.trackingUrl;
    const awb = order.trackingNumber || order.shiprocket?.awbCode;
    if (awb) return `https://shiprocket.co/tracking/${encodeURIComponent(awb)}`;
    return null;
};

/** Progress index for timeline — higher of orderStatus and Shiprocket shippingStatus */
const getShipmentProgressIndex = (order) => {
    const byOrderStatus = {
        Processing: 0,
        Confirmed: 0,
        Shipped: 1,
        'Out for Delivery': 2,
        Delivered: 3,
        Cancelled: -1,
    };
    const byShipping = {
        pending: 0,
        pickup_scheduled: 0,
        in_transit: 1,
        out_for_delivery: 2,
        delivered: 3,
        cancelled: -1,
        rto: -1,
    };
    const a = byOrderStatus[order.orderStatus] ?? 0;
    const b = byShipping[order.shiprocket?.shippingStatus] ?? 0;
    return Math.max(a, b);
};

const Orders = () => {
    const { user } = useAuth();
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

    // Generate tracking timeline based on order + Shiprocket status
    const getTrackingTimeline = (order) => {
        const steps = [
            { key: 'confirmed', label: 'Confirmed', icon: <FiCheck size={16} /> },
            { key: 'shipped', label: 'Shipped', icon: <FiTruck size={16} /> },
            { key: 'outForDelivery', label: 'Out for Delivery', icon: <FiMapPin size={16} /> },
            { key: 'delivered', label: 'Delivered', icon: <FiPackage size={16} /> },
        ];

        const progress = getShipmentProgressIndex(order);
        const placedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
        const shippedDate = order.shiprocket?.statusHistory?.find((h) =>
            ['shipped', 'in_transit'].includes(h.status)
        )?.timestamp;
        const ofdDate = order.shiprocket?.statusHistory?.find((h) => h.status === 'out_for_delivery')?.timestamp;
        const deliveredDate = order.deliveredAt || order.shiprocket?.statusHistory?.find((h) => h.status === 'delivered')?.timestamp;

        const dates = [
            placedDate,
            shippedDate ? new Date(shippedDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : null,
            ofdDate ? new Date(ofdDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : null,
            deliveredDate ? new Date(deliveredDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : null,
        ];

        return steps.map((step, index) => ({
            ...step,
            completed: progress > index,
            current: progress === index,
            date: progress >= index ? dates[index] : null,
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
                    body { font-family: 'Segoe UI', -apple-system, Roboto, sans-serif; padding: 48px 40px; color: #1f2430; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .invoice-container { max-width: 760px; margin: 0 auto; }
                    .invoice-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 32px; margin-bottom: 30px; border-bottom: 3px solid #C8A02A; padding-bottom: 22px; }
                    .invoice-brand { font-size: 1.7rem; font-weight: 800; color: #14141c; letter-spacing: -0.5px; line-height: 1; }
                    .invoice-brand-sub { font-size: 0.66rem; letter-spacing: 4px; color: #C8A02A; text-transform: uppercase; margin-top: 3px; font-weight: 700; }
                    .invoice-seller-meta { font-size: 0.72rem; line-height: 1.7; color: #6b7180; margin-top: 12px; }
                    .invoice-title { text-align: right; flex-shrink: 0; }
                    .invoice-title h2 { font-size: 1.25rem; color: #14141c; letter-spacing: 2px; font-weight: 800; margin-bottom: 12px; }
                    .invoice-title-meta { display: grid; grid-template-columns: auto auto; gap: 4px 12px; font-size: 0.8rem; justify-content: end; }
                    .invoice-title-label { color: #9aa0ac; text-align: right; }
                    .invoice-title-value { color: #1f2430; font-weight: 600; text-align: right; }
                    .invoice-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 26px; }
                    .invoice-meta-box { background: #f7f8fa; border: 1px solid #eceef2; border-radius: 10px; padding: 16px 18px; }
                    .invoice-meta-box h4 { font-size: 0.68rem; text-transform: uppercase; letter-spacing: 1px; color: #9aa0ac; margin-bottom: 8px; font-weight: 700; }
                    .invoice-meta-box p { font-size: 0.82rem; line-height: 1.7; color: #4a5060; }
                    .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
                    .invoice-table th { background: #14141c; padding: 11px 12px; text-align: left; font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.6px; color: #fff; font-weight: 600; }
                    .invoice-table th:first-child { border-radius: 8px 0 0 8px; }
                    .invoice-table th:last-child { border-radius: 0 8px 8px 0; }
                    .invoice-table td { padding: 12px; border-bottom: 1px solid #eef0f3; font-size: 0.84rem; vertical-align: top; }
                    .invoice-table .text-right { text-align: right; }
                    .invoice-table .col-num { width: 34px; color: #9aa0ac; }
                    .invoice-table .col-hsn { width: 64px; color: #6b7180; }
                    .invoice-table .col-qty { width: 52px; }
                    .invoice-item-name { display: block; font-weight: 600; color: #1f2430; }
                    .invoice-item-sub { display: block; font-size: 0.74rem; color: #9aa0ac; margin-top: 2px; }
                    .invoice-summary { display: flex; justify-content: flex-end; gap: 20px; margin-bottom: 24px; flex-wrap: wrap; }
                    .invoice-gst { width: 280px; background: #f7f8fa; border: 1px solid #eceef2; border-radius: 10px; padding: 14px 16px; }
                    .invoice-gst-title { font-size: 0.66rem; text-transform: uppercase; letter-spacing: 0.6px; color: #9aa0ac; font-weight: 700; margin-bottom: 8px; }
                    .invoice-totals { width: 280px; }
                    .invoice-totals-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 0.84rem; color: #4a5060; }
                    .invoice-totals-row.discount { color: #16a34a; }
                    .invoice-totals-row.grand { border-top: 2px solid #14141c; margin-top: 6px; padding-top: 10px; font-size: 1.02rem; font-weight: 800; color: #14141c; }
                    .invoice-totals-row.gst-total { border-top: 1px solid #dfe2e8; margin-top: 4px; padding-top: 8px; font-weight: 700; color: #1f2430; }
                    .invoice-amount-due { display: flex; justify-content: space-between; align-items: center; background: #14141c; color: #fff; padding: 16px 22px; border-radius: 10px; margin-bottom: 28px; }
                    .invoice-amount-due span:first-child { font-size: 0.8rem; letter-spacing: 1px; text-transform: uppercase; color: #C8A02A; font-weight: 600; }
                    .invoice-amount-due span:last-child { font-size: 1.4rem; font-weight: 800; }
                    .invoice-footer { text-align: center; font-size: 0.74rem; color: #9aa0ac; line-height: 1.8; border-top: 1px solid #eef0f3; padding-top: 18px; }
                    .invoice-thanks { font-weight: 600; color: #4a5060; }
                    .invoice-badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 0.66rem; font-weight: 700; letter-spacing: 0.5px; }
                    .badge-paid { background: #e8f8f0; color: #16a34a; }
                    .badge-pending { background: #fef5e7; color: #d97706; }
                    @media print { body { padding: 0; } }
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
            <Helmet>
                <title>My Orders | SwissGarden Perfumes</title>
                <meta name="robots" content="noindex,nofollow" />
                <link rel="canonical" href="https://swissgardenperfumes.com/orders" />
            </Helmet>
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
                                                {order.isPaid
                                                    ? '✓ Paid'
                                                    : order.paymentMethod === 'cod'
                                                      ? '💵 Pay on delivery'
                                                      : '⏳ Payment pending'}
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
                                                    <div style={{ marginBottom: 16, color: '#ccc', fontSize: 14, lineHeight: 1.6 }}>
                                                        {(order.trackingNumber || order.shiprocket?.awbCode) && (
                                                            <div>AWB: <strong style={{ color: '#D4AF37' }}>{order.trackingNumber || order.shiprocket.awbCode}</strong></div>
                                                        )}
                                                        {order.shiprocket?.courierName && (
                                                            <div>Courier: {order.shiprocket.courierName}</div>
                                                        )}
                                                        {order.shiprocket?.shiprocketOrderId && (
                                                            <div>Shiprocket ID: {order.shiprocket.shiprocketOrderId}</div>
                                                        )}
                                                        {getShiprocketTrackUrl(order) ? (
                                                            <div style={{ marginTop: 8 }}>
                                                                <a
                                                                    href={getShiprocketTrackUrl(order)}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="btn btn-ghost btn-sm"
                                                                    style={{ color: '#D4AF37', borderColor: '#D4AF37', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                                                                >
                                                                    <FiTruck size={14} /> Track / verify on Shiprocket
                                                                </a>
                                                            </div>
                                                        ) : order.shiprocket?.shiprocketOrderId ? (
                                                            <div style={{ marginTop: 6, color: '#999', fontSize: 13 }}>
                                                                Tracking link will appear once a courier AWB is assigned in Shiprocket.
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                    {getTrackingTimeline(order).map((step, index, arr) => (
                                                        <div
                                                            key={step.key}
                                                            className={`timeline-step ${step.completed ? 'completed' : ''} ${step.current ? 'current' : ''}`}
                                                        >
                                                            <div className="timeline-icon-wrapper">
                                                                <div className="timeline-icon">
                                                                    {step.completed || step.current ? step.icon : <FiClock size={16} />}
                                                                </div>
                                                                {index < arr.length - 1 && (
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
                {invoiceOrder && (() => {
                  const gst = computeGST(invoiceOrder);
                  const addr = invoiceOrder.shippingAddress || {};
                  const customerName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Customer';
                  return (
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
                                    {/* ── Header: brand + tax-invoice label ── */}
                                    <div className="invoice-header">
                                        <div className="invoice-seller">
                                            <div className="invoice-brand">SwissGarden</div>
                                            <div className="invoice-brand-sub">PERFUMES</div>
                                            <div className="invoice-seller-meta">
                                                {SELLER.legalName}<br />
                                                {SELLER.address}<br />
                                                {SELLER.email} · {SELLER.phone}
                                                {SELLER.gstin && <><br />GSTIN: {SELLER.gstin}</>}
                                            </div>
                                        </div>
                                        <div className="invoice-title">
                                            <h2>TAX INVOICE</h2>
                                            <div className="invoice-title-meta">
                                                <span className="invoice-title-label">Invoice No.</span>
                                                <span className="invoice-title-value">{invoiceOrder.orderNumber}</span>
                                                <span className="invoice-title-label">Date</span>
                                                <span className="invoice-title-value">{new Date(invoiceOrder.createdAt).toLocaleDateString('en-IN', {
                                                    year: 'numeric', month: 'short', day: 'numeric',
                                                })}</span>
                                                <span className="invoice-title-label">Status</span>
                                                <span className="invoice-title-value">
                                                    <span className={`invoice-badge ${invoiceOrder.isPaid ? 'badge-paid' : 'badge-pending'}`}>
                                                        {invoiceOrder.isPaid ? 'PAID' : 'PENDING'}
                                                    </span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ── Parties: Bill To / Payment ── */}
                                    <div className="invoice-meta">
                                        <div className="invoice-meta-box">
                                            <h4>Bill To</h4>
                                            <p>
                                                <strong>{customerName}</strong><br />
                                                {addr.street}<br />
                                                {addr.landmark && <>{addr.landmark}<br /></>}
                                                {addr.city}, {addr.state} {addr.zipCode}<br />
                                                {addr.country}
                                                {addr.phone && <><br />Phone: {addr.phone}</>}
                                            </p>
                                        </div>
                                        <div className="invoice-meta-box">
                                            <h4>Payment Details</h4>
                                            <p>
                                                Method: {invoiceOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online (Razorpay)'}<br />
                                                {invoiceOrder.paidAt && <>Paid on: {new Date(invoiceOrder.paidAt).toLocaleDateString('en-IN')}<br /></>}
                                                Place of Supply: {addr.state || '—'}<br />
                                                HSN: {SELLER.hsn}
                                            </p>
                                        </div>
                                    </div>

                                    {/* ── Items ── */}
                                    <table className="invoice-table">
                                        <thead>
                                            <tr>
                                                <th className="col-num">#</th>
                                                <th>Item Description</th>
                                                <th className="col-hsn">HSN</th>
                                                <th className="text-right">Rate</th>
                                                <th className="text-right col-qty">Qty</th>
                                                <th className="text-right">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {invoiceOrder.orderItems.map((item, idx) => (
                                                <tr key={item._id}>
                                                    <td className="col-num">{idx + 1}</td>
                                                    <td>
                                                        <span className="invoice-item-name">{item.name}</span>
                                                        {item.size && <span className="invoice-item-sub">{item.size}</span>}
                                                    </td>
                                                    <td className="col-hsn">{SELLER.hsn}</td>
                                                    <td className="text-right">{formatINR(item.price)}</td>
                                                    <td className="text-right col-qty">{item.quantity}</td>
                                                    <td className="text-right">{formatINR(item.price * item.quantity)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    {/* ── Totals + GST breakdown ── */}
                                    <div className="invoice-summary">
                                        {/* GST is included in the grand total, shown here as a breakdown */}
                                        <div className="invoice-gst">
                                            <div className="invoice-gst-title">Tax Summary — GST included in total (18%)</div>
                                            <div className="invoice-totals-row">
                                                <span>Taxable Value</span>
                                                <span>{formatINR(gst.taxable)}</span>
                                            </div>
                                            <div className="invoice-totals-row">
                                                <span>CGST @ 9%</span>
                                                <span>{formatINR(gst.cgst)}</span>
                                            </div>
                                            <div className="invoice-totals-row">
                                                <span>SGST @ 9%</span>
                                                <span>{formatINR(gst.sgst)}</span>
                                            </div>
                                            <div className="invoice-totals-row gst-total">
                                                <span>Total GST</span>
                                                <span>{formatINR(gst.gstTotal)}</span>
                                            </div>
                                        </div>

                                        <div className="invoice-totals">
                                            <div className="invoice-totals-row">
                                                <span>Subtotal (incl. GST)</span>
                                                <span>{formatINR(invoiceOrder.itemsPrice)}</span>
                                            </div>
                                            {(invoiceOrder.comboDiscount > 0) && (
                                                <div className="invoice-totals-row discount">
                                                    <span>Combo Discount</span>
                                                    <span>−{formatINR(invoiceOrder.comboDiscount)}</span>
                                                </div>
                                            )}
                                            {(invoiceOrder.couponDiscount > 0) && (
                                                <div className="invoice-totals-row discount">
                                                    <span>Coupon ({invoiceOrder.couponCode})</span>
                                                    <span>−{formatINR(invoiceOrder.couponDiscount)}</span>
                                                </div>
                                            )}
                                            <div className="invoice-totals-row">
                                                <span>Shipping</span>
                                                <span>{invoiceOrder.shippingPrice === 0 ? 'FREE' : formatINR(invoiceOrder.shippingPrice)}</span>
                                            </div>
                                            {(invoiceOrder.codCharge > 0) && (
                                                <div className="invoice-totals-row">
                                                    <span>COD Charge</span>
                                                    <span>+{formatINR(invoiceOrder.codCharge)}</span>
                                                </div>
                                            )}
                                            <div className="invoice-totals-row grand">
                                                <span>Grand Total</span>
                                                <span>{formatINR(gst.grand)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* ── Amount in words / footer ── */}
                                    <div className="invoice-amount-due">
                                        <span>Amount {invoiceOrder.isPaid ? 'Paid' : 'Payable'}</span>
                                        <span>{formatINR(gst.grand)}</span>
                                    </div>

                                    <div className="invoice-footer">
                                        <p className="invoice-thanks">Thank you for shopping with SwissGarden Perfumes.</p>
                                        <p>This is a computer-generated tax invoice and does not require a physical signature.</p>
                                        <p>Prices are inclusive of 18% GST · All amounts in INR (₹) · HSN 3303 (Perfumes)</p>
                                    </div>
                                </div>
                            </div>
                            </motion.div>
                        </div>
                    </>
                  );
                })()}
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
