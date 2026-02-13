import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMinus, FiPlus, FiTrash2, FiShoppingBag } from 'react-icons/fi';
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
                        transition={{ type: 'tween', duration: 0.35 }}
                    >
                        <div className="cart-header">
                            <h3 className="cart-title">
                                <FiShoppingBag size={20} />
                                Shopping Bag ({cartCount})
                            </h3>
                            <button className="cart-close" onClick={() => setIsCartOpen(false)}>
                                <FiX size={22} />
                            </button>
                        </div>

                        {cartItems.length === 0 ? (
                            <div className="cart-empty">
                                <FiShoppingBag size={48} />
                                <p>Your bag is empty</p>
                                <button
                                    className="btn btn-outline"
                                    onClick={() => {
                                        setIsCartOpen(false);
                                        navigate('/shop');
                                    }}
                                >
                                    Explore Fragrances
                                </button>
                            </div>
                        ) : (
                            <>
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
                                                        ${(item.price * item.quantity).toFixed(2)}
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
                                    <div className="cart-subtotal">
                                        <span>Subtotal</span>
                                        <span className="cart-subtotal-price">${cartTotal.toFixed(2)}</span>
                                    </div>
                                    <p className="cart-shipping-note">
                                        {cartTotal > 200
                                            ? '✨ You qualify for free shipping!'
                                            : `Add $${(200 - cartTotal).toFixed(2)} more for free shipping`}
                                    </p>
                                    <button className="btn btn-primary btn-lg cart-checkout-btn" onClick={handleCheckout}>
                                        Proceed to Checkout
                                    </button>
                                    <button
                                        className="btn btn-ghost cart-continue-btn"
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
