import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within CartProvider');
    return context;
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        try {
            const saved = localStorage.getItem('cart');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const [isCartOpen, setIsCartOpen] = useState(false);

    // Persist cart to localStorage
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = useCallback((product, quantity = 1) => {
        setCartItems((prev) => {
            const existing = prev.find((item) => item._id === product._id);
            if (existing) {
                toast.success('Cart updated');
                return prev.map((item) =>
                    item._id === product._id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            toast.success('Added to cart');
            return [
                ...prev,
                {
                    _id: product._id,
                    name: product.name,
                    price: product.price,
                    image: product.images?.[0]?.url || '',
                    size: product.size,
                    brand: product.brand,
                    stock: product.stock,
                    quantity,
                },
            ];
        });
    }, []);

    const removeFromCart = useCallback((productId) => {
        setCartItems((prev) => prev.filter((item) => item._id !== productId));
        toast.success('Removed from cart');
    }, []);

    const updateQuantity = useCallback((productId, quantity) => {
        if (quantity < 1) return;
        setCartItems((prev) =>
            prev.map((item) => (item._id === productId ? { ...item, quantity } : item))
        );
    }, []);

    const clearCart = useCallback(() => {
        setCartItems([]);
    }, []);

    const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

    // Indian pricing: GST 18% included in product price, no separate tax
    // Free shipping above ₹999, else ₹49 flat
    const shippingAmount = cartTotal >= 999 ? 0 : 49;

    // Calculate combo discount
    const getComboDiscount = () => {
        if (cartCount >= 3) return 400;
        if (cartCount >= 2) return 200;
        return 0;
    };

    const comboDiscount = getComboDiscount();
    const orderTotal = Math.max(0, cartTotal - comboDiscount + shippingAmount);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                isCartOpen,
                setIsCartOpen,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                cartCount,
                cartTotal,
                shippingAmount,
                comboDiscount,
                orderTotal,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};
