import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './SplashScreen.css';

const SplashScreen = ({ onComplete }) => {
    const [phase, setPhase] = useState('logo'); // logo → tagline → exit

    useEffect(() => {
        const t1 = setTimeout(() => setPhase('tagline'), 1400);
        const t2 = setTimeout(() => setPhase('exit'), 3000);
        const t3 = setTimeout(() => onComplete(), 3600);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }, [onComplete]);

    return (
        <AnimatePresence>
            {phase !== 'exit' ? null : null}
            <motion.div
                className="splash-screen"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                animate={phase === 'exit' ? { opacity: 0, scale: 1.05 } : { opacity: 1 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
            >
                {/* Background shimmer */}
                <div className="splash-shimmer" />

                {/* Accent line top */}
                <motion.div
                    className="splash-line splash-line-top"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                />

                {/* Logo / Brand */}
                <div className="splash-content">
                    <motion.div
                        className="splash-logo-wrapper"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                    >
                        <span className="splash-brand-sub">The Art of Fragrance</span>
                    </motion.div>

                    <motion.h1
                        className="splash-brand"
                        initial={{ opacity: 0, y: 30, letterSpacing: '12px' }}
                        animate={{ opacity: 1, y: 0, letterSpacing: '6px' }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
                    >
                        SwissGarden
                    </motion.h1>

                    <motion.div
                        className="splash-divider"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 1.0 }}
                    />

                    <AnimatePresence>
                        {(phase === 'tagline' || phase === 'exit') && (
                            <motion.p
                                className="splash-tagline"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.6, ease: 'easeOut' }}
                            >
                                Luxury Crafted for You
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>

                {/* Accent line bottom */}
                <motion.div
                    className="splash-line splash-line-bottom"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                />

                {/* Particle dots */}
                <div className="splash-particles">
                    {[...Array(6)].map((_, i) => (
                        <motion.span
                            key={i}
                            className="splash-particle"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: [0, 0.6, 0], scale: [0, 1, 0.5] }}
                            transition={{
                                duration: 2.5,
                                delay: 0.5 + i * 0.2,
                                ease: 'easeInOut',
                            }}
                            style={{
                                left: `${15 + i * 14}%`,
                                top: `${30 + (i % 3) * 20}%`,
                            }}
                        />
                    ))}
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default SplashScreen;
