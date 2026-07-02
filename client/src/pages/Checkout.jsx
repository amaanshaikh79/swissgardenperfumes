import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiCreditCard, FiMapPin, FiSmartphone, FiTruck, FiLock, FiAlertCircle, FiTag, FiX } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersAPI, paymentAPI, couponAPI } from '../services/api';
import { getCountries, getStates, getCities } from '../data/locationData';
import toast from 'react-hot-toast';
import './Checkout.css';

const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const PAYMENT_METHODS = [
    {
        id: 'cod',
        label: 'Cash on Delivery',
        icon: <FiTruck size={22} />,
        desc: 'Pay when delivered (No extra charges)',
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
    const { cartItems, cartTotal, taxAmount, shippingAmount, comboDiscount, codCharge, orderTotal, orderTotalWithCOD, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [paymentError, setPaymentError] = useState('');
    const [shipping, setShipping] = useState({
        street: '', landmark: '', country: '', state: '', city: '', zipCode: '',
    });

    // Coupon state
    const [couponInput, setCouponInput] = useState('');
    const [couponLoading, setCouponLoading] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, discount, description }
    const couponDiscount = appliedCoupon?.discount || 0;

    const handleApplyCoupon = async () => {
        if (!couponInput.trim()) return;
        setCouponLoading(true);
        try {
            const { data } = await couponAPI.apply({ code: couponInput.trim(), orderAmount: cartTotal });
            setAppliedCoupon({ code: data.coupon.code, discount: data.discount, description: data.coupon.description });
            toast.success(data.message);
        } catch (err) {
            const msg = err.response?.data?.message || 'Invalid coupon code';
            toast.error(msg);
            setAppliedCoupon(null);
        } finally {
            setCouponLoading(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponInput('');
        toast.success('Coupon removed');
    };

    // Final totals with coupon
    const finalOrderTotal = Math.max(0, orderTotal - couponDiscount);
    const finalOrderTotalWithCOD = Math.max(0, orderTotalWithCOD - couponDiscount);

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

    // ── Lazy-load the Razorpay checkout SDK (only on this page) ─────
    const loadRazorpay = () => new Promise((resolve) => {
        if (window.Razorpay) return resolve(true);
        const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
        if (existing) {
            existing.addEventListener('load', () => resolve(true));
            existing.addEventListener('error', () => resolve(false));
            return;
        }
        const s = document.createElement('script');
        s.src = 'https://checkout.razorpay.com/v1/checkout.js';
        s.onload = () => resolve(true);
        s.onerror = () => resolve(false);
        document.body.appendChild(s);
    });

    // Warm the SDK on mount so it is ready by the time the user pays.
    useEffect(() => {
        loadRazorpay();
    }, []);

    // ── Launch Razorpay modal ──────────────────────────────────────
    const launchRazorpay = (keyId, razorpayOrder, prefillMethod) => {
        return new Promise((resolve, reject) => {
            const options = {
                key: keyId,
                amount: razorpayOrder.amount,  // already in paise from backend
                currency: razorpayOrder.currency || 'INR',
                name: 'SwissGarden Perfumes',
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

        // Tracks a verified-but-captured payment so a later failure (saving the
        // order / marking paid) does not tell the customer to pay again.
        let capturedPaymentId = null;

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
            couponCode: appliedCoupon?.code || null,
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
                amount: finalOrderTotal,
                currency: 'INR',
                receipt: `rcpt_${Date.now()}`,
            });
            const razorpayOrder = paymentRes.data.order;

            // Step 3: Ensure the checkout SDK is loaded, then open the modal
            const sdkReady = await loadRazorpay();
            if (!sdkReady) {
                throw new Error('Razorpay SDK failed to load. Please refresh the page.');
            }
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

            // Payment is captured and verified. From here on, any failure must NOT
            // prompt the customer to pay again.
            capturedPaymentId = razorpayResponse.razorpay_payment_id;

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
            if (capturedPaymentId) {
                // Payment already succeeded but order persistence / mark-paid failed.
                // Tell the customer NOT to pay again and surface the payment id.
                const supportMsg = `Your payment (ID: ${capturedPaymentId}) was received successfully, but we hit a problem saving your order. Please do NOT pay again. Contact support with this payment ID and we will confirm your order.`;
                setPaymentError(supportMsg);
                toast.error(supportMsg, { duration: 12000 });
            } else if (error.message === 'PAYMENT_CANCELLED') {
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
            <Helmet><title>Checkout | SwissGarden Perfumes</title></Helmet>
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
                                                        {formatINR(item.price * item.quantity)}
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
                                                `Place Order — ${formatINR(finalOrderTotalWithCOD)} (Pay on Delivery)`
                                            ) : (
                                                `Pay ${formatINR(finalOrderTotal)} via ${selectedMethod?.label}`
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
                                    <span>{formatINR(item.price * item.quantity)}</span>
                                </div>
                            ))}
                            <div className="checkout-summary-divider" />
                            <div className="checkout-summary-row">
                                <span>Subtotal</span><span>{formatINR(cartTotal)}</span>
                            </div>
                            <div className="checkout-summary-row">
                                <span>Shipping</span>
                                <span>{shippingAmount === 0 ? <span className="checkout-free-badge">FREE</span> : formatINR(shippingAmount)}</span>
                            </div>
                            {comboDiscount > 0 && (
                                <div className="checkout-summary-row checkout-discount-row">
                                    <span>Combo Discount</span><span>−{formatINR(comboDiscount)}</span>
                                </div>
                            )}
                            {paymentMethod === 'cod' && (
                                <div className="checkout-summary-row checkout-cod-row">
                                    <span>COD Charge</span><span>+{formatINR(codCharge)}</span>
                                </div>
                            )}
                            {couponDiscount > 0 && (
                                <div className="checkout-summary-row checkout-discount-row">
                                    <span>🎟️ Coupon ({appliedCoupon?.code})</span><span>−{formatINR(couponDiscount)}</span>
                                </div>
                            )}
                            <div className="checkout-summary-divider" />
                            <div className="checkout-summary-row checkout-summary-total">
                                <span>Total</span><span>{formatINR(paymentMethod === 'cod' ? finalOrderTotalWithCOD : finalOrderTotal)}</span>
                            </div>
                            <p className="checkout-gst-note">Inclusive of all taxes</p>

                            {/* Coupon Input */}
                            <div className="checkout-coupon-section">
                                {!appliedCoupon ? (
                                    <div className="checkout-coupon-input-row">
                                        <div className="checkout-coupon-input-wrap">
                                            <FiTag size={14} className="checkout-coupon-icon" />
                                            <input
                                                type="text"
                                                className="checkout-coupon-input"
                                                placeholder="Enter coupon code"
                                                value={couponInput}
                                                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                                onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                                            />
                                        </div>
                                        <button
                                            className="btn btn-sm btn-outline checkout-coupon-btn"
                                            onClick={handleApplyCoupon}
                                            disabled={couponLoading || !couponInput.trim()}
                                        >
                                            {couponLoading ? '...' : 'Apply'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="checkout-coupon-applied">
                                        <div className="checkout-coupon-applied-info">
                                            <FiTag size={14} />
                                            <div>
                                                <strong>{appliedCoupon.code}</strong>
                                                <span>You save {formatINR(couponDiscount)}</span>
                                            </div>
                                        </div>
                                        <button className="checkout-coupon-remove" onClick={handleRemoveCoupon}>
                                            <FiX size={14} />
                                        </button>
                                    </div>
                                )}
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
