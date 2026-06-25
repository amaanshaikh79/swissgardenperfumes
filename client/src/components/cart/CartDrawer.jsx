import { useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiTag, FiTruck, FiShield } from 'react-icons/fi';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import useModalA11y from '../../hooks/useModalA11y';
import './CartDrawer.css';

const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const CartDrawer = () => {
    const {
        cartItems,
        isCartOpen,
        setIsCartOpen,
        removeFromCart,
        updateQuantity,
        cartTotal,
        cartCount,
        shippingAmount,
        comboDiscount,
        orderTotal,
    } = useCart();
    const navigate = useNavigate();
    const closeRef = useRef(null);
    const closeCart = useCallback(() => setIsCartOpen(false), [setIsCartOpen]);
    const panelRef = useModalA11y(isCartOpen, closeCart, closeRef);

    const handleCheckout = () => {
        setIsCartOpen(false);
        navigate('/checkout');
    };

    const freeShipThreshold = 799;
    const freeShipProgress = Math.min((cartTotal / freeShipThreshold) * 100, 100);
    const needsMore = freeShipThreshold - cartTotal;

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    <motion.div
                        className="cart-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsCartOpen(false)}
                    />
                    <motion.div
                        ref={panelRef}
                        className="cart-drawer"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Shopping cart"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'tween', duration: 0.3 }}
                    >
                        <div className="cart-header">
                            <h3 className="cart-title">
                                <FiShoppingBag size={18} />
                                Your Bag ({cartCount})
                            </h3>
                            <button ref={closeRef} className="cart-close" onClick={() => setIsCartOpen(false)} aria-label="Close cart">
                                <FiX size={22} />
                            </button>
                        </div>

                        {cartItems.length === 0 ? (
                            <div className="cart-empty">
                                <FiShoppingBag size={48} />
                                <p className="cart-empty-title">Your bag is empty</p>
                                <p className="cart-empty-desc">Add items to start building your collection</p>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => {
                                        setIsCartOpen(false);
                                        navigate('/shop');
                                    }}
                                >
                                    Shop Now
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Free shipping progress */}
                                {cartTotal > 0 && (
                                    <div className="cart-ship-progress">
                                        {needsMore > 0 ? (
                                            <p className="cart-ship-text">
                                                <FiTruck size={13} /> Add {formatINR(needsMore)} more for <strong>FREE shipping!</strong>
                                            </p>
                                        ) : (
                                            <p className="cart-ship-text cart-ship-text--done">
                                                <FiTruck size={13} /> You qualify for <strong>FREE shipping!</strong> 🎉
                                            </p>
                                        )}
                                        <div className="cart-ship-bar">
                                            <motion.div
                                                className="cart-ship-bar-fill"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${freeShipProgress}%` }}
                                                transition={{ duration: 0.5 }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Combo upsell */}
                                {cartCount === 1 && (
                                    <div className="cart-upsell">
                                        <FiTag size={14} />
                                        <span>Add 1 more to save <strong>{formatINR(200)}!</strong></span>
                                    </div>
                                )}
                                {cartCount === 2 && (
                                    <div className="cart-upsell cart-upsell--success">
                                        <FiTag size={14} />
                                        <span>🎉 Combo discount applied! Add 1 more to save <strong>{formatINR(400)}!</strong></span>
                                    </div>
                                )}
                                {cartCount >= 3 && (
                                    <div className="cart-upsell cart-upsell--success">
                                        <FiTag size={14} />
                                        <span>🎉 You're saving {formatINR(400)} with combo discount!</span>
                                    </div>
                                )}

                                <div className="cart-items">
                                    {cartItems.map((item) => (
                                        <motion.div
                                            key={item._id}
                                            className="cart-item"
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, x: 100 }}
                                        >
                                            <Link
                                                to={`/product/${item.slug || item._id}`}
                                                className="cart-item-image"
                                                onClick={() => setIsCartOpen(false)}
                                            >
                                                <img src={item.image} alt={item.name} />
                                            </Link>
                                            <div className="cart-item-info">
                                                <h4 className="cart-item-name">{item.name}</h4>
                                                <span className="cart-item-size">{item.size}</span>
                                                <span className="cart-item-unit-price">{formatINR(item.price)} each</span>
                                                <div className="cart-item-bottom">
                                                    <div className="cart-qty-controls">
                                                        <button
                                                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                                            disabled={item.quantity <= 1}
                                                            aria-label="Decrease quantity"
                                                        >
                                                            <FiMinus size={14} />
                                                        </button>
                                                        <span>{item.quantity}</span>
                                                        <button onClick={() => updateQuantity(item._id, item.quantity + 1)} aria-label="Increase quantity">
                                                            <FiPlus size={14} />
                                                        </button>
                                                    </div>
                                                    <span className="cart-item-price">
                                                        {formatINR(item.price * item.quantity)}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                className="cart-item-remove"
                                                onClick={() => removeFromCart(item._id)}
                                                title="Remove item"
                                                aria-label="Remove item"
                                            >
                                                <FiTrash2 size={14} />
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>

                                <div className="cart-footer">
                                    <div className="cart-summary">
                                        <div className="cart-summary-row">
                                            <span>Subtotal ({cartCount} item{cartCount > 1 ? 's' : ''})</span>
                                            <span>{formatINR(cartTotal)}</span>
                                        </div>
                                        {comboDiscount > 0 && (
                                            <div className="cart-summary-row cart-summary-row--save">
                                                <span>🎁 Combo Discount</span>
                                                <span>-{formatINR(comboDiscount)}</span>
                                            </div>
                                        )}
                                        <div className="cart-summary-row">
                                            <span>Shipping</span>
                                            <span>{shippingAmount === 0 ? <span className="cart-free-tag">FREE</span> : formatINR(shippingAmount)}</span>
                                        </div>
                                        <div className="cart-summary-row cart-summary-row--total">
                                            <span>Total</span>
                                            <span>{formatINR(orderTotal)}</span>
                                        </div>
                                        <p className="cart-gst-note">Inclusive of all taxes</p>
                                    </div>

                                    <button className="btn btn-primary btn-lg btn-block cart-checkout-btn" onClick={handleCheckout}>
                                        Checkout — {formatINR(orderTotal)}
                                    </button>
                                    <button
                                        className="btn btn-whatsapp btn-block"
                                        onClick={() => {
                                            const message = `Hi SwissGarden! I want to order:\n${cartItems.map(item => `- ${item.name} (${item.size}) x ${item.quantity} = ${formatINR(item.price * item.quantity)}`).join('\n')}\n\nSubtotal: ${formatINR(cartTotal)}\nShipping: ${shippingAmount === 0 ? 'Free' : formatINR(shippingAmount)}${comboDiscount > 0 ? `\nCombo Discount: -${formatINR(comboDiscount)}` : ''}\nTotal: ${formatINR(orderTotal)}\n\nPlease confirm my order.`;
                                            window.open(`https://wa.me/9971836369?text=${encodeURIComponent(message)}`, '_blank');
                                        }}
                                    >
                                        Order via WhatsApp (COD)
                                    </button>
                                    <button
                                        className="btn btn-ghost btn-block cart-continue-btn"
                                        onClick={() => setIsCartOpen(false)}
                                    >
                                        Continue Shopping
                                    </button>

                                    <div className="cart-trust-badges">
                                        <span><FiShield size={12} /> Secure Checkout</span>
                                        <span><FiTruck size={12} /> COD Available</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CartDrawer;
