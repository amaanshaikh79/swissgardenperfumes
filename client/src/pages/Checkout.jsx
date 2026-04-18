import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiCreditCard, FiMapPin, FiSmartphone, FiTruck, FiLock, FiAlertCircle } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersAPI, paymentAPI } from '../services/api';
import { getCountries, getStates, getCities } from '../data/locationData';
import toast from 'react-hot-toast';
import './Checkout.css';

const PAYMENT_METHODS = [
    {
        id: 'cod',
        label: 'Cash on Delivery',
        icon: <FiTruck size={22} />,
        desc: 'Pay when your order arrives at your doorstep',
    },
    {
        id: 'razorpay',
        label: 'Pay Online',
        icon: <FiCreditCard size={22} />,
        desc: 'Credit/Debit Card, UPI, Net Banking, Wallets',
    },
    {
        id: 'upi',
        label: 'UPI Payment',
        icon: <FiSmartphone size={22} />,
        desc: 'Google Pay, PhonePe, Paytm, BHIM UPI',
    },
    {
        id: 'card',
        label: 'Credit / Debit Card',
        icon: <FiCreditCard size={22} />,
        desc: 'Visa, Mastercard, Rupay, Amex',
    },
];

const Checkout = () => {
    const { cartItems, cartTotal, taxAmount, shippingAmount, comboDiscount, orderTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [paymentError, setPaymentError] = useState('');
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
        if (!shipping.street.trim()) { toast.error('Please enter your street address'); return false; }
        if (!shipping.country) { toast.error('Please select your country'); return false; }
        if (!shipping.state) { toast.error('Please select your state'); return false; }
        if (!shipping.city) { toast.error('Please select your city'); return false; }
        if (!shipping.zipCode.trim()) { toast.error('Please enter your zip/postal code'); return false; }
        return true;
    };

    const handleContinueToPayment = () => { if (validateStep1()) setStep(2); };
    const handleContinueToReview = () => {
        if (!paymentMethod) { toast.error('Please select a payment method'); return; }
        setPaymentError('');
        setStep(3);
    };

    // ── Launch Razorpay modal ──────────────────────────────────────
    const launchRazorpay = (keyId, razorpayOrder, prefillMethod) => {
        return new Promise((resolve, reject) => {
            const options = {
                key: keyId,
                amount: razorpayOrder.amount,  // already in paise from backend
                currency: razorpayOrder.currency || 'INR',
                name: 'swissgarden Perfumes',
                description: `Order — ${cartItems.length} item${cartItems.length > 1 ? 's' : ''}`,
                order_id: razorpayOrder.id,
                prefill: {
                    name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
                    email: user?.email || '',
                    contact: user?.phone || '',
                },
                theme: {
                    color: '#D4AF37',
                },
                modal: {
                    ondismiss: () => reject(new Error('PAYMENT_CANCELLED')),
                    animation: true,
                },
                handler: (response) => resolve(response),
            };

            // Pre-select payment method in Razorpay checkout
            if (prefillMethod === 'upi') {
                options.config = {
                    display: {
                        blocks: { upi: { name: 'Pay via UPI', instruments: [{ method: 'upi' }] } },
                        sequence: ['block.upi'],
                        preferences: { show_default_blocks: true },
                    },
                };
            } else if (prefillMethod === 'card') {
                options.config = {
                    display: {
                        blocks: { card: { name: 'Pay via Card', instruments: [{ method: 'card' }] } },
                        sequence: ['block.card'],
                        preferences: { show_default_blocks: true },
                    },
                };
            }

            // Ensure Razorpay SDK is loaded
            if (!window.Razorpay) {
                return reject(new Error('Razorpay SDK failed to load. Please refresh the page.'));
            }

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', (resp) => {
                const msg = resp.error?.description || 'Payment failed';
                reject(new Error(`PAYMENT_FAILED:${msg}`));
            });
            rzp.open();
        });
    };

    // ── Place Order ────────────────────────────────────────────────
    const handlePlaceOrder = async () => {
        if (loading) return;
        setLoading(true);
        setPaymentError('');

        const orderPayload = {
            orderItems: cartItems.map((item) => ({
                product: item._id,
                quantity: item.quantity,
            })),
            shippingAddress: {
                street: shipping.street.trim(),
                landmark: shipping.landmark.trim(),
                city: shipping.city,
                state: shipping.state,
                zipCode: shipping.zipCode.trim(),
                country: shipping.country,
            },
            paymentMethod: paymentMethod === 'cod' ? 'cod' : 'razorpay',
        };

        try {
            // ── COD Flow ─────────────────────────────────────────
            if (paymentMethod === 'cod') {
                const { data } = await ordersAPI.create(orderPayload);
                clearCart();
                toast.success('Order placed! Pay on delivery.');
                navigate(`/order-success/${data.order._id}`, {
                    state: { order: data.order, paymentMethod: 'cod' },
                    replace: true,
                });
                return;
            }

            // ── Online Payment Flow (Razorpay) ────────────────────
            // Step 1: Get live Razorpay key from backend
            const configRes = await paymentAPI.getConfig();
            if (!configRes.data.success) {
                throw new Error(configRes.data.message || 'Payment gateway not available');
            }
            const keyId = configRes.data.keyId;

            // Step 2: Create Razorpay order on backend (returns amount in paise)
            const paymentRes = await paymentAPI.createOrder({
                amount: orderTotal,
                currency: 'INR',
                receipt: `rcpt_${Date.now()}`,
            });
            const razorpayOrder = paymentRes.data.order;

            // Step 3: Open Razorpay modal
            const prefillMethod = paymentMethod === 'upi' ? 'upi' : paymentMethod === 'card' ? 'card' : null;
            const razorpayResponse = await launchRazorpay(keyId, razorpayOrder, prefillMethod);

            // Step 4: Verify payment signature on backend
            const verifyRes = await paymentAPI.verify({
                razorpay_order_id: razorpayResponse.razorpay_order_id,
                razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                razorpay_signature: razorpayResponse.razorpay_signature,
            });

            if (!verifyRes.data.success) {
                throw new Error('Payment verification failed. Please contact support.');
            }

            // Step 5: Create order in our database
            const { data: orderData } = await ordersAPI.create(orderPayload);

            // Step 6: Mark order as paid
            await ordersAPI.updateToPaid(orderData.order._id, {
                id: razorpayResponse.razorpay_payment_id,
                status: 'completed',
                updateTime: new Date().toISOString(),
                emailAddress: user?.email,
            });

            clearCart();
            toast.success('Payment successful! Order confirmed. 🎉');
            navigate(`/order-success/${orderData.order._id}`, {
                state: {
                    order: orderData.order,
                    paymentId: razorpayResponse.razorpay_payment_id,
                    paymentMethod: paymentMethod,
                },
                replace: true,
            });
        } catch (error) {
            if (error.message === 'PAYMENT_CANCELLED') {
                toast('Payment cancelled', { icon: '🚫' });
            } else if (error.message?.startsWith('PAYMENT_FAILED:')) {
                const reason = error.message.replace('PAYMENT_FAILED:', '');
                setPaymentError(reason);
                toast.error(`Payment failed: ${reason}`);
            } else {
                const msg = error.response?.data?.message || error.message || 'Something went wrong. Please try again.';
                setPaymentError(msg);
                toast.error(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    // ── Empty cart state ───────────────────────────────────────────
    if (cartItems.length === 0) {
        return (
            <div className="page-loader" style={{ paddingTop: '120px' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1rem' }}>Your bag is empty</h2>
                <button className="btn btn-outline" onClick={() => navigate('/shop')}>Continue Shopping</button>
            </div>
        );
    }

    const selectedMethod = PAYMENT_METHODS.find((m) => m.id === paymentMethod);

    return (
        <>
            <Helmet><title>Checkout | swissgarden Perfumes</title></Helmet>
            <div className="checkout-page">
                <div className="container-sm">
                    <h1 className="checkout-title">Checkout</h1>

                    {/* Progress Steps */}
                    <div className="checkout-steps">
                        {['Shipping', 'Payment', 'Review & Place'].map((label, i) => (
                            <div
                                key={label}
                                className={`checkout-step ${step >= i + 1 ? 'active' : ''} ${step > i + 1 ? 'done' : ''}`}
                            >
                                <div className="checkout-step-num">
                                    {step > i + 1 ? <FiCheck size={14} /> : i + 1}
                                </div>
                                <span>{label}</span>
                            </div>
                        ))}
                    </div>

                    <div className="checkout-grid">
                        <div className="checkout-main">
                            <AnimatePresence mode="wait">

                                {/* ═══ STEP 1: SHIPPING ADDRESS ═══ */}
                                {step === 1 && (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.25 }}
                                        className="checkout-section"
                                    >
                                        <h2 className="checkout-section-title"><FiMapPin /> Shipping Address</h2>

                                        <div className="form-group">
                                            <label className="form-label">Street Address *</label>
                                            <input
                                                className="form-input"
                                                placeholder="e.g. 123 Main Street, Apt 4B"
                                                value={shipping.street}
                                                onChange={(e) => setShipping({ ...shipping, street: e.target.value })}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">
                                                Landmark <span className="form-optional">(Optional)</span>
                                            </label>
                                            <input
                                                className="form-input"
                                                placeholder="e.g. Near City Mall, Opposite Park"
                                                value={shipping.landmark}
                                                onChange={(e) => setShipping({ ...shipping, landmark: e.target.value })}
                                            />
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
                                                <select
                                                    className="form-input form-select"
                                                    value={shipping.state}
                                                    onChange={handleStateChange}
                                                    disabled={!shipping.country}
                                                >
                                                    <option value="">{shipping.country ? 'Select State' : 'Select country first'}</option>
                                                    {states.map((s) => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">City *</label>
                                                <select
                                                    className="form-input form-select"
                                                    value={shipping.city}
                                                    onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                                                    disabled={!shipping.state}
                                                >
                                                    <option value="">{shipping.state ? 'Select City' : 'Select state first'}</option>
                                                    {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="form-group" style={{ maxWidth: '280px' }}>
                                            <label className="form-label">Zip / Postal Code *</label>
                                            <input
                                                className="form-input"
                                                placeholder="e.g. 400001"
                                                value={shipping.zipCode}
                                                onChange={(e) => setShipping({ ...shipping, zipCode: e.target.value })}
                                            />
                                        </div>

                                        <button className="btn btn-primary btn-lg" onClick={handleContinueToPayment}>
                                            Continue to Payment →
                                        </button>
                                    </motion.div>
                                )}

                                {/* ═══ STEP 2: PAYMENT METHOD ═══ */}
                                {step === 2 && (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.25 }}
                                        className="checkout-section"
                                    >
                                        <h2 className="checkout-section-title"><FiCreditCard /> Select Payment Method</h2>

                                        <div className="payment-methods">
                                            {PAYMENT_METHODS.map((method) => (
                                                <div
                                                    key={method.id}
                                                    className={`payment-method-card ${paymentMethod === method.id ? 'selected' : ''}`}
                                                    onClick={() => setPaymentMethod(method.id)}
                                                    role="radio"
                                                    aria-checked={paymentMethod === method.id}
                                                    tabIndex={0}
                                                    onKeyDown={(e) => e.key === 'Enter' && setPaymentMethod(method.id)}
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

                                        <AnimatePresence>
                                            {paymentMethod === 'razorpay' && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="payment-info-box"
                                                >
                                                    <p>💡 Razorpay supports <strong>Credit/Debit Cards</strong>, <strong>UPI</strong>, <strong>Net Banking</strong>, <strong>Wallets</strong> (PayTM, PhonePe, etc.) — all in one secure checkout.</p>
                                                </motion.div>
                                            )}
                                            {paymentMethod === 'upi' && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="payment-info-box"
                                                >
                                                    <p>📱 You will be redirected to UPI payment. Supports <strong>Google Pay</strong>, <strong>PhonePe</strong>, <strong>Paytm</strong>, <strong>BHIM</strong>, and all UPI apps.</p>
                                                </motion.div>
                                            )}
                                            {paymentMethod === 'card' && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="payment-info-box"
                                                >
                                                    <p>💳 Secure card payment powered by Razorpay. Supports <strong>Visa</strong>, <strong>Mastercard</strong>, <strong>Rupay</strong>, <strong>American Express</strong>, and more.</p>
                                                </motion.div>
                                            )}
                                            {paymentMethod === 'cod' && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="payment-info-box payment-info-cod"
                                                >
                                                    <p>🚚 Pay in cash when your order is delivered. Make sure someone is available to receive and pay at delivery.</p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <div className="checkout-nav-buttons">
                                            <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back to Shipping</button>
                                            <button className="btn btn-primary btn-lg" onClick={handleContinueToReview}>
                                                Review Order →
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* ═══ STEP 3: REVIEW & PLACE ORDER ═══ */}
                                {step === 3 && (
                                    <motion.div
                                        key="step3"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ duration: 0.25 }}
                                        className="checkout-section"
                                    >
                                        <h2 className="checkout-section-title">Review & Place Order</h2>

                                        {/* Cart Items Review */}
                                        <div className="checkout-items-review">
                                            {cartItems.map((item) => (
                                                <div key={item._id} className="checkout-review-item">
                                                    <img src={item.image} alt={item.name} />
                                                    <div>
                                                        <h4>{item.name}</h4>
                                                        <p>{item.size} × {item.quantity}</p>
                                                    </div>
                                                    <span className="checkout-review-price">
                                                        ₹{(item.price * item.quantity).toFixed(2)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Shipping Address Review */}
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

                                        {/* Payment Method Review */}
                                        <div className="checkout-review-box">
                                            <div className="checkout-review-box-header">
                                                <h3><FiCreditCard size={14} /> Payment Method</h3>
                                                <button className="btn btn-ghost btn-sm" onClick={() => setStep(2)}>Change</button>
                                            </div>
                                            <div className="checkout-payment-selected">
                                                {selectedMethod?.icon}
                                                <div>
                                                    <strong>{selectedMethod?.label}</strong>
                                                    <p>{selectedMethod?.desc}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Payment Error Banner */}
                                        <AnimatePresence>
                                            {paymentError && (
                                                <motion.div
                                                    className="checkout-error-banner"
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                >
                                                    <FiAlertCircle size={16} />
                                                    <span>{paymentError}</span>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Place Order Button */}
                                        <button
                                            className={`btn btn-lg checkout-place-btn ${paymentMethod === 'cod' ? 'btn-outline' : 'btn-primary'}`}
                                            onClick={handlePlaceOrder}
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <span className="checkout-btn-loading">
                                                    <span className="checkout-spinner" />
                                                    {paymentMethod === 'cod' ? 'Placing Order…' : 'Processing Payment…'}
                                                </span>
                                            ) : paymentMethod === 'cod' ? (
                                                `Place Order — ₹${orderTotal.toFixed(2)} (Pay on Delivery)`
                                            ) : (
                                                `Pay ₹${orderTotal.toFixed(2)} via ${selectedMethod?.label}`
                                            )}
                                        </button>

                                        <div className="checkout-back-link">
                                            <button className="btn btn-ghost btn-sm" onClick={() => setStep(2)}>← Back</button>
                                        </div>

                                        <p className="checkout-secure-text">
                                            <FiLock size={12} />
                                            &nbsp;Your payment is secured with 256-bit SSL encryption. Powered by Razorpay.
                                        </p>
                                    </motion.div>
                                )}

                            </AnimatePresence>
                        </div>

                        {/* ═══ ORDER SUMMARY SIDEBAR ═══ */}
                        <div className="checkout-summary">
                            <h3 className="checkout-summary-title">Order Summary</h3>
                            {cartItems.map((item) => (
                                <div key={item._id} className="checkout-summary-item">
                                    <span>{item.name} × {item.quantity}</span>
                                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                            <div className="checkout-summary-divider" />
                            <div className="checkout-summary-row">
                                <span>Subtotal</span><span>₹{cartTotal.toFixed(2)}</span>
                            </div>
                            <div className="checkout-summary-row">
                                <span>Shipping</span>
                                <span>{shippingAmount === 0 ? <span className="checkout-free-badge">FREE</span> : `₹${shippingAmount.toFixed(2)}`}</span>
                            </div>
                            <div className="checkout-summary-row">
                                <span>Tax (8%)</span><span>₹{taxAmount.toFixed(2)}</span>
                            </div>
                            {comboDiscount > 0 && (
                                <div className="checkout-summary-row checkout-discount-row">
                                    <span>Combo Discount</span><span>−₹{comboDiscount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="checkout-summary-divider" />
                            <div className="checkout-summary-row checkout-summary-total">
                                <span>Total</span><span>₹{orderTotal.toFixed(2)}</span>
                            </div>
                            {paymentMethod && (
                                <div className="checkout-summary-method">
                                    <span>Payment</span>
                                    <span className="badge badge-gold">
                                        {selectedMethod?.label || '—'}
                                    </span>
                                </div>
                            )}
                            {shippingAmount === 0 && (
                                <p className="checkout-free-shipping-note">🎉 You qualify for free shipping!</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Checkout;
