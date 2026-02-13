import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FiHeart, FiDroplet, FiGlobe, FiAward } from 'react-icons/fi';
import './Contact.css';

const About = () => {
    const values = [
        { icon: <FiDroplet size={24} />, title: 'Finest Ingredients', desc: 'We source the rarest, most exquisite raw materials from across the globe.' },
        { icon: <FiHeart size={24} />, title: 'Crafted with Passion', desc: 'Each fragrance is meticulously composed by our master perfumers over months.' },
        { icon: <FiGlobe size={24} />, title: 'Sustainable Luxury', desc: 'Committed to ethical sourcing and environmentally responsible practices.' },
        { icon: <FiAward size={24} />, title: 'Award Winning', desc: 'Recognized globally for excellence in perfumery and innovation.' },
    ];

    return (
        <>
            <Helmet>
                <title>Our Story | GoldenBuck Perfumes</title>
                <meta name="description" content="Discover the story behind GoldenBuck Perfumes — a legacy of luxury fragrance since 1987." />
            </Helmet>
            <div className="about-page">
                <div className="container-sm">
                    <div className="about-hero">
                        <span className="section-label">Our Story</span>
                        <h1 className="section-title">The Art of GoldenBuck</h1>
                        <div className="gold-divider" />
                    </div>

                    <div className="about-content">
                        <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                            Founded in 1987 in the heart of New York City, GoldenBuck Perfumes was born from a singular vision: to create fragrances that transcend the ordinary and touch the soul. Our founder, Alexander GoldenBuck, a third-generation perfumer, believed that scent is the most intimate form of self-expression.
                        </motion.p>
                        <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
                            Today, our master perfumers travel the world to source the rarest ingredients — from the ancient agarwood forests of Southeast Asia to the lavender fields of Provence, the rose valleys of Bulgaria to the vanilla plantations of Madagascar. Every ingredient is carefully selected and tested before it earns a place in our compositions.
                        </motion.p>
                        <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
                            Our philosophy is simple: luxury should be an experience, not just a product. Each GoldenBuck fragrance is a masterwork — blended with precision, patience, and an unwavering commitment to excellence. We don't follow trends; we create timeless signatures that become an extension of who you are.
                        </motion.p>
                    </div>

                    <div className="section-header" style={{ marginTop: 'var(--space-2xl)' }}>
                        <span className="section-label">Our Values</span>
                        <h2 className="section-title">What Drives Us</h2>
                        <div className="gold-divider" />
                    </div>

                    <div className="about-values-grid">
                        {values.map((val, i) => (
                            <motion.div
                                key={val.title}
                                className="about-value-card"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className="about-value-icon">{val.icon}</div>
                                <h3>{val.title}</h3>
                                <p>{val.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default About;
