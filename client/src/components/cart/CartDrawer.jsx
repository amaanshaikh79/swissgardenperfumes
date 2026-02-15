import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiTag } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './CartDrawer.css';

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

    const handleCheckout = () => {
        setIsCartOpen(false);
        navigate('/checkout');
    };

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
                        className="cart-drawer"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'tween', duration: 0.3 }}
                    >
                        <div className="cart-header">
                            <h3 className="cart-title">
                                <FiShoppingBag size={18} />
                                Cart ({cartCount})
                            </h3>
                            <button className="cart-close" onClick={() => setIsCartOpen(false)}>
                                <FiX size={22} />
                            </button>
                        </div>

                        {cartItems.length === 0 ? (
                            <div className="cart-empty">
                                <FiShoppingBag size={48} />
                                <p className="cart-empty-title">Your cart is empty</p>
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
                                {/* Combo upsell */}
                                {cartCount === 1 && (
                                    <div className="cart-upsell">
                                        <FiTag size={14} />
                                        <span>Add 1 more to save <strong>₹200!</strong></span>
                                    </div>
                                )}
                                {cartCount === 2 && (
                                    <div className="cart-upsell cart-upsell--success">
                                        <FiTag size={14} />
                                        <span>🎉 Combo discount applied! Add 1 more to save <strong>₹400!</strong></span>
                                    </div>
                                )}
                                {cartCount >= 3 && (
                                    <div className="cart-upsell cart-upsell--success">
                                        <FiTag size={14} />
                                        <span>🎉 You're saving ₹400 with combo discount!</span>
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
                                            <div className="cart-item-image">
                                                <img src={item.image} alt={item.name} />
                                            </div>
                                            <div className="cart-item-info">
                                                <h4 className="cart-item-name">{item.name}</h4>
                                                <span className="cart-item-size">{item.size}</span>
                                                <div className="cart-item-bottom">
                                                    <div className="cart-qty-controls">
                                                        <button
                                                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                                            disabled={item.quantity <= 1}
                                                        >
                                                            <FiMinus size={14} />
                                                        </button>
                                                        <span>{item.quantity}</span>
                                                        <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>
                                                            <FiPlus size={14} />
                                                        </button>
                                                    </div>
                                                    <span className="cart-item-price">
                                                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                className="cart-item-remove"
                                                onClick={() => removeFromCart(item._id)}
                                            >
                                                <FiTrash2 size={14} />
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>

                                <div className="cart-footer">
                                    <div className="cart-summary">
                                        <div className="cart-summary-row">
                                            <span>Subtotal</span>
                                            <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                                        </div>
                                        {comboDiscount > 0 && (
                                            <div className="cart-summary-row cart-summary-row--save">
                                                <span>🎁 Combo Discount</span>
                                                <span>-₹{comboDiscount}</span>
                                            </div>
                                        )}
                                        <div className="cart-summary-row">
                                            <span>Shipping</span>
                                            <span>{shippingAmount === 0 ? 'FREE' : `₹${shippingAmount}`}</span>
                                        </div>
                                        <div className="cart-summary-row cart-summary-row--total">
                                            <span>Total</span>
                                            <span>₹{orderTotal.toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>

                                    {cartTotal < 999 && (
                                        <p className="cart-shipping-note">
                                            Add ₹{(999 - cartTotal).toLocaleString('en-IN')} more for <strong>free shipping!</strong>
                                        </p>
                                    )}

                                    <button className="btn btn-primary btn-lg btn-block cart-checkout-btn" onClick={handleCheckout}>
                                        Checkout — ₹{orderTotal.toLocaleString('en-IN')}
                                    </button>
                                    <button
                                        className="btn btn-ghost btn-block cart-continue-btn"
                                        onClick={() => setIsCartOpen(false)}
                                    >
                                        Continue Shopping
                                    </button>
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
