import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiGift, FiCopy } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './ExitIntentPopup.css';

const ExitIntentPopup = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [hasBeenShown, setHasBeenShown] = useState(false);
    const [email, setEmail] = useState('');
    const [showCode, setShowCode] = useState(false);

    useEffect(() => {
        const shown = localStorage.getItem('exitIntentShown');
        if (shown) {
            setHasBeenShown(true);
            return;
        }

        const handleMouseLeave = (e) => {
            if (e.clientY <= 0 && !hasBeenShown && !isVisible) {
                setIsVisible(true);
                setHasBeenShown(true);
                localStorage.setItem('exitIntentShown', 'true');
            }
        };

        // Mobile timer fallback
        const timer = setTimeout(() => {
            if (!hasBeenShown && !isVisible) {
                // For mobile, maybe show after 60 seconds?
                // Keeping it simple: mostly desktop feature for now, or use a scroll trigger?
                // Let's stick to mouseleave for now, maybe add timer for both.
            }
        }, 60000);

        document.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            document.removeEventListener('mouseleave', handleMouseLeave);
            clearTimeout(timer);
        };
    }, [hasBeenShown, isVisible]);

    const handleClose = () => {
        setIsVisible(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would integrate with email marketing API
        setShowCode(true);
        toast.success('You have unlocked the discount!');
    };

    const copyCode = () => {
        navigator.clipboard.writeText('WELCOME10');
        toast.success('Code copied to clipboard!');
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="exit-popup-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="exit-popup-content"
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    >
                        <button className="exit-popup-close" onClick={handleClose}>
                            <FiX size={20} />
                        </button>

                        <div className="exit-popup-grid">
                            <div className="exit-popup-image">
                                <img src="https://images.unsplash.com/photo-1595535373192-fc8935bacd89?auto=format&fit=crop&q=80&w=600" alt="Perfume" />
                            </div>
                            <div className="exit-popup-details">
                                <div className="exit-icon-wrap">
                                    <FiGift size={24} />
                                </div>
                                <h2>Wait! Don't Miss Out</h2>
                                <p>Get <span className="highlight">10% OFF</span> your first order. Join our exclusive club for luxury scent offers.</p>

                                {!showCode ? (
                                    <form onSubmit={handleSubmit} className="exit-form">
                                        <input
                                            type="email"
                                            placeholder="Enter your email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="form-input"
                                        />
                                        <button type="submit" className="btn btn-primary btn-full">
                                            Unlock 10% Discount
                                        </button>
                                    </form>
                                ) : (
                                    <div className="exit-code-display">
                                        <p>Your Code:</p>
                                        <div className="code-box" onClick={copyCode}>
                                            WELCOME10 <FiCopy size={16} />
                                        </div>
                                        <button className="btn btn-primary btn-full" onClick={handleClose}>
                                            Shop Now
                                        </button>
                                    </div>
                                )}

                                <button className="btn-link" onClick={handleClose}>
                                    No thanks, I prefer paying full price
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ExitIntentPopup;
