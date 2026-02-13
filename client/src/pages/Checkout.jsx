import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FiCheck, FiCreditCard, FiMapPin, FiDollarSign, FiSmartphone, FiTruck } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersAPI, paymentAPI } from '../services/api';
import { getCountries, getStates, getCities } from '../data/locationData';
import toast from 'react-hot-toast';
import './Checkout.css';

const PAYMENT_METHODS = [
    { id: 'cod', label: 'Cash on Delivery', icon: <FiTruck size={22} />, desc: 'Pay when your order arrives at your doorstep' },
    { id: 'razorpay', label: 'Pay Online', icon: <FiCreditCard size={22} />, desc: 'Credit/Debit Card, UPI, Net Banking, Wallets' },
    { id: 'upi', label: 'UPI Payment', icon: <FiSmartphone size={22} />, desc: 'Google Pay, PhonePe, Paytm, BHIM UPI' },
    { id: 'card', label: 'Credit / Debit Card', icon: <FiCreditCard size={22} />, desc: 'Visa, Mastercard, Rupay, Amex' },
];

const Checkout = () => {
    const { cartItems, cartTotal, taxAmount, shippingAmount, orderTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [shipping, setShipping] = useState({
        street: '', landmark: '', country: '', state: '', city: '', zipCode: '',
    });

    // Cascading location data
    const countries = useMemo(() => getCountries(), []);
    const states = useMemo(() => getStates(shipping.country), [shipping.country]);
    const cities = useMemo(() => getCities(shipping.country, shipping.state), [shipping.country, shipping.state]);
    const countryName = useMemo(() => {
        const c = countries.find((c) => c.code === shipping.country);
        return c ? c.name : shipping.country;
    }, [shipping.country, countries]);

    const handleCountryChange = (e) => setShipping({ ...shipping, country: e.target.value, state: '', city: '' });
    const handleStateChange = (e) => setShipping({ ...shipping, state: e.target.value, city: '' });

    const validateStep1 = () => {
        if (!shipping.street || !shipping.country || !shipping.state || !shipping.city || !shipping.zipCode) {
            toast.error('Please fill in all required shipping fields');
            return false;
        }
        return true;
    };

    const handleContinueToPayment = () => {
        if (validateStep1()) setStep(2);
    };

    const handleContinueToReview = () => {
        if (!paymentMethod) {
            toast.error('Please select a payment method');
            return;
        }
        setStep(3);
    };

    // Launch Razorpay Checkout modal
    const launchRazorpay = useCallback(async (order, prefillMethod) => {
        return new Promise((resolve, reject) => {
            const options = {
                key: '', // Will be set from config
                amount: order.amount,
                currency: order.currency || 'INR',
                name: 'GoldBerg Perfumes',
                description: `Order Payment - ${cartItems.length} item(s)`,
                order_id: order.id,
                prefill: {
                    name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
                    email: user?.email || '',
                    contact: user?.phone || '',
                },
                theme: {
                    color: '#D4AF37',
                    backdrop_color: 'rgba(0,0,0,0.85)',
                },
                modal: {
                    ondismiss: () => reject(new Error('Payment cancelled')),
                },
                handler: (response) => resolve(response),
            };

            // Pre-select payment method if specific type chosen
            if (prefillMethod === 'upi') {
                options.config = { display: { blocks: { upi: { name: 'UPI', instruments: [{ method: 'upi' }] } }, sequence: ['block.upi'], preferences: { show_default_blocks: false } } };
            } else if (prefillMethod === 'card') {
                options.config = { display: { blocks: { card: { name: 'Card', instruments: [{ method: 'card' }] } }, sequence: ['block.card'], preferences: { show_default_blocks: false } } };
            }

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', (response) => {
                reject(new Error(response.error?.description || 'Payment failed'));
            });
            rzp.open();
        });
    }, [cartItems.length, user]);

    const handlePlaceOrder = async () => {
        setLoading(true);

        try {
            // Step 1: Create the order in our backend
            const orderData = {
                orderItems: cartItems.map((item) => ({
                    product: item._id,
                    quantity: item.quantity,
                })),
                shippingAddress: {
                    street: shipping.street,
                    landmark: shipping.landmark,
                    city: shipping.city,
                    state: shipping.state,
                    zipCode: shipping.zipCode,
                    country: shipping.country,
                },
                paymentMethod: paymentMethod === 'cod' ? 'cod' : 'razorpay',
            };

            if (paymentMethod === 'cod') {
                // ── COD Order: Create order directly ──
                await ordersAPI.create(orderData);
                clearCart();
                toast.success('Order placed successfully! Pay on delivery.');
                navigate('/orders');
            } else {
                // ── Online Payment: Razorpay flow ──
                // 1. Get Razorpay key
                const configRes = await paymentAPI.getConfig();
                const keyId = configRes.data.keyId;

                // 2. Create Razorpay order
                const paymentRes = await paymentAPI.createOrder({
                    amount: orderTotal,
                    currency: 'INR',
                    receipt: `receipt_${Date.now()}`,
                });
                const razorpayOrder = paymentRes.data.order;

                // 3. Launch Razorpay checkout
                const prefillMethod = paymentMethod === 'upi' ? 'upi' : paymentMethod === 'card' ? 'card' : null;

                // Set key dynamically
                const razorpayResponse = await new Promise((resolve, reject) => {
                    const options = {
                        key: keyId,
                        amount: razorpayOrder.amount,
                        currency: razorpayOrder.currency || 'INR',
                        name: 'GoldBerg Perfumes',
                        description: `Order - ${cartItems.length} item(s)`,
                        order_id: razorpayOrder.id,
                        prefill: {
                            name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
                            email: user?.email || '',
                            contact: user?.phone || '',
                        },
                        theme: { color: '#D4AF37' },
                        modal: { ondismiss: () => reject(new Error('Payment cancelled by user')) },
                        handler: (response) => resolve(response),
                    };

                    // Pre-select method
                    if (prefillMethod === 'upi') {
                        options.config = {
                            display: { blocks: { upi: { name: 'Pay via UPI', instruments: [{ method: 'upi' }] } }, sequence: ['block.upi'], preferences: { show_default_blocks: true } }
                        };
                    } else if (prefillMethod === 'card') {
                        options.config = {
                            display: { blocks: { card: { name: 'Pay via Card', instruments: [{ method: 'card' }] } }, sequence: ['block.card'], preferences: { show_default_blocks: true } }
                        };
                    }

                    const rzp = new window.Razorpay(options);
                    rzp.on('payment.failed', (resp) => reject(new Error(resp.error?.description || 'Payment failed')));
                    rzp.open();
                });

                // 4. Verify payment
                const verifyRes = await paymentAPI.verify({
                    razorpay_order_id: razorpayResponse.razorpay_order_id,
                    razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                    razorpay_signature: razorpayResponse.razorpay_signature,
                });

                if (verifyRes.data.success) {
                    // 5. Create order in our system as paid
                    const { data } = await ordersAPI.create(orderData);

                    // 6. Mark order as paid
                    await ordersAPI.updateToPaid(data.order._id, {
                        id: razorpayResponse.razorpay_payment_id,
                        status: 'completed',
                        updateTime: new Date().toISOString(),
                        emailAddress: user?.email,
                    });

                    clearCart();
                    toast.success('Payment successful! Order confirmed.');
                    navigate('/orders');
                } else {
                    toast.error('Payment verification failed. Please contact support.');
                }
            }
        } catch (error) {
            if (error.message === 'Payment cancelled by user' || error.message === 'Payment cancelled') {
                toast.error('Payment was cancelled');
            } else {
                toast.error(error.response?.data?.message || error.message || 'Failed to place order');
            }
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="page-loader" style={{ paddingTop: '120px' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)' }}>Your bag is empty</h2>
                <button className="btn btn-outline" onClick={() => navigate('/shop')}>Continue Shopping</button>
            </div>
        );
    }

    return (
        <>
            <Helmet><title>Checkout | GoldBerg Perfumes</title></Helmet>
            <div className="checkout-page">
                <div className="container-sm">
                    <h1 className="checkout-title">Checkout</h1>

                    {/* Steps */}
                    <div className="checkout-steps">
                        {['Shipping', 'Payment', 'Review & Place'].map((label, i) => (
                            <div key={label} className={`checkout-step ${step >= i + 1 ? 'active' : ''} ${step > i + 1 ? 'done' : ''}`}>
                                <div className="checkout-step-num">
                                    {step > i + 1 ? <FiCheck size={14} /> : i + 1}
                                </div>
                                <span>{label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="checkout-grid">
                        <div className="checkout-main">

                            {/* ═══ STEP 1: SHIPPING ═══ */}
                            {step === 1 && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="checkout-section">
                                    <h2 className="checkout-section-title"><FiMapPin /> Shipping Address</h2>

                                    <div className="form-group">
                                        <label className="form-label">Street Address *</label>
                                        <input className="form-input" placeholder="e.g. 123 Main Street, Apt 4B"
                                            value={shipping.street}
                                            onChange={(e) => setShipping({ ...shipping, street: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Landmark <span className="form-optional">(Optional)</span></label>
                                        <input className="form-input" placeholder="e.g. Near City Mall, Opposite Park"
                                            value={shipping.landmark}
                                            onChange={(e) => setShipping({ ...shipping, landmark: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Country *</label>
                                        <select className="form-input form-select" value={shipping.country} onChange={handleCountryChange}>
                                            <option value="">Select Country</option>
                                            {countries.map((c) => (
                                                <option key={c.code} value={c.code}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="checkout-row">
                                        <div className="form-group">
                                            <label className="form-label">State / Province *</label>
                                            <select className="form-input form-select" value={shipping.state} onChange={handleStateChange}
                                                disabled={!shipping.country}>
                                                <option value="">{shipping.country ? 'Select State' : 'Select country first'}</option>
                                                {states.map((s) => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">City *</label>
                                            <select className="form-input form-select" value={shipping.city}
                                                onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                                                disabled={!shipping.state}>
                                                <option value="">{shipping.state ? 'Select City' : 'Select state first'}</option>
                                                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-group" style={{ maxWidth: '280px' }}>
                                        <label className="form-label">Zip / Postal Code *</label>
                                        <input className="form-input" placeholder="e.g. 10001" value={shipping.zipCode}
                                            onChange={(e) => setShipping({ ...shipping, zipCode: e.target.value })} />
                                    </div>

                                    <button className="btn btn-primary btn-lg" onClick={handleContinueToPayment}>
                                        Continue to Payment
                                    </button>
                                </motion.div>
                            )}

                            {/* ═══ STEP 2: PAYMENT METHOD ═══ */}
                            {step === 2 && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="checkout-section">
                                    <h2 className="checkout-section-title"><FiDollarSign /> Select Payment Method</h2>

                                    <div className="payment-methods">
                                        {PAYMENT_METHODS.map((method) => (
                                            <div
                                                key={method.id}
                                                className={`payment-method-card ${paymentMethod === method.id ? 'selected' : ''}`}
                                                onClick={() => setPaymentMethod(method.id)}
                                            >
                                                <div className="payment-method-radio">
                                                    <div className={`radio-dot ${paymentMethod === method.id ? 'active' : ''}`} />
                                                </div>
                                                <div className="payment-method-icon">{method.icon}</div>
                                                <div className="payment-method-info">
                                                    <h4>{method.label}</h4>
                                                    <p>{method.desc}</p>
                                                </div>
                                                {method.id === 'cod' && (
                                                    <span className="badge badge-gold">No Extra Charge</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {paymentMethod === 'razorpay' && (
                                        <div className="payment-info-box">
                                            <p>💡 Razorpay supports <strong>Credit/Debit Cards</strong>, <strong>UPI</strong>, <strong>Net Banking</strong>, <strong>Wallets</strong> (PayTM, PhonePe, etc.) — all in one secure checkout.</p>
                                        </div>
                                    )}
                                    {paymentMethod === 'upi' && (
                                        <div className="payment-info-box">
                                            <p>📱 You will be redirected to UPI payment. Supports <strong>Google Pay</strong>, <strong>PhonePe</strong>, <strong>Paytm</strong>, <strong>BHIM</strong>, and all UPI apps.</p>
                                        </div>
                                    )}
                                    {paymentMethod === 'card' && (
                                        <div className="payment-info-box">
                                            <p>💳 Secure card payment powered by Razorpay. Supports <strong>Visa</strong>, <strong>Mastercard</strong>, <strong>Rupay</strong>, <strong>American Express</strong>, and more.</p>
                                        </div>
                                    )}
                                    {paymentMethod === 'cod' && (
                                        <div className="payment-info-box payment-info-cod">
                                            <p>🚚 Pay in cash when your order is delivered. Make sure someone is available to receive and pay at delivery.</p>
                                        </div>
                                    )}

                                    <div className="checkout-nav-buttons">
                                        <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back to Shipping</button>
                                        <button className="btn btn-primary btn-lg" onClick={handleContinueToReview}>
                                            Review Order
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* ═══ STEP 3: REVIEW & PLACE ORDER ═══ */}
                            {step === 3 && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="checkout-section">
                                    <h2 className="checkout-section-title">Review & Place Order</h2>

                                    {/* Items */}
                                    <div className="checkout-items-review">
                                        {cartItems.map((item) => (
                                            <div key={item._id} className="checkout-review-item">
                                                <img src={item.image} alt={item.name} />
                                                <div>
                                                    <h4>{item.name}</h4>
                                                    <p>{item.size} × {item.quantity}</p>
                                                </div>
                                                <span className="checkout-review-price">${(item.price * item.quantity).toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Shipping Summary */}
                                    <div className="checkout-review-box">
                                        <div className="checkout-review-box-header">
                                            <h3><FiMapPin size={14} /> Shipping Address</h3>
                                            <button className="btn btn-ghost btn-sm" onClick={() => setStep(1)}>Edit</button>
                                        </div>
                                        <p>{shipping.street}</p>
                                        {shipping.landmark && <p className="checkout-landmark">Landmark: {shipping.landmark}</p>}
                                        <p>{shipping.city}, {shipping.state} {shipping.zipCode}</p>
                                        <p>{countryName}</p>
                                    </div>

                                    {/* Payment Method Summary */}
                                    <div className="checkout-review-box">
                                        <div className="checkout-review-box-header">
                                            <h3><FiCreditCard size={14} /> Payment Method</h3>
                                            <button className="btn btn-ghost btn-sm" onClick={() => setStep(2)}>Change</button>
                                        </div>
                                        <div className="checkout-payment-selected">
                                            {PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.icon}
                                            <div>
                                                <strong>{PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label}</strong>
                                                <p>{PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.desc}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Place Order */}
                                    <button
                                        className={`btn btn-lg checkout-place-btn ${paymentMethod === 'cod' ? 'btn-outline' : 'btn-primary'}`}
                                        onClick={handlePlaceOrder}
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <span className="checkout-btn-loading">Processing...</span>
                                        ) : paymentMethod === 'cod' ? (
                                            `Place Order — $${orderTotal.toFixed(2)} (Pay on Delivery)`
                                        ) : (
                                            `Pay $${orderTotal.toFixed(2)} via ${PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label}`
                                        )}
                                    </button>

                                    <p className="checkout-secure-text">
                                        🔒 Your payment is secured with 256-bit SSL encryption
                                    </p>
                                </motion.div>
                            )}
                        </div>

                        {/* ═══ ORDER SUMMARY SIDEBAR ═══ */}
                        <div className="checkout-summary">
                            <h3 className="checkout-summary-title">Order Summary</h3>
                            {cartItems.map((item) => (
                                <div key={item._id} className="checkout-summary-item">
                                    <span>{item.name} × {item.quantity}</span>
                                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                            <div className="checkout-summary-divider" />
                            <div className="checkout-summary-row">
                                <span>Subtotal</span><span>${cartTotal.toFixed(2)}</span>
                            </div>
                            <div className="checkout-summary-row">
                                <span>Shipping</span><span>{shippingAmount === 0 ? 'Free' : `$${shippingAmount.toFixed(2)}`}</span>
                            </div>
                            <div className="checkout-summary-row">
                                <span>Tax</span><span>${taxAmount.toFixed(2)}</span>
                            </div>
                            <div className="checkout-summary-divider" />
                            <div className="checkout-summary-row checkout-summary-total">
                                <span>Total</span><span>${orderTotal.toFixed(2)}</span>
                            </div>
                            {paymentMethod && (
                                <div className="checkout-summary-method">
                                    <span>Payment</span>
                                    <span className="badge badge-gold">
                                        {PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label || '—'}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Checkout;
