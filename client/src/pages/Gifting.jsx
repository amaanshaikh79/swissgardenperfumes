import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FiGift, FiPackage, FiArrowRight, FiMail, FiCheck } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import LazyImage from '../components/common/LazyImage';
import './Gifting.css';

const Gifting = () => {
    const giftingOccasions = [
        'Birthdays',
        'Anniversaries',
        'Corporate gifting & team appreciation',
        'Festive gifting — Diwali, Eid, Christmas, New Year',
        'Weddings & celebrations',
        'A considered gift for someone who does not need another thing',
    ];

    const giftingFeatures = [
        {
            icon: <FiPackage size={32} />,
            title: 'Gift-Ready Presentation',
            desc: 'Deep emerald gift case with gold foil detailing. No additional wrapping required — the unboxing is part of the experience.',
        },
        {
            icon: <FiGift size={32} />,
            title: 'Two Gifting Options',
            desc: 'Choose three attars for someone whose taste you know. Or gift a selection card and let them build their own combination.',
        },
        {
            icon: <FiCheck size={32} />,
            title: 'Individual Packaging',
            desc: 'Each 10ml roll-on arrives in its own distinctive branded box, presented together inside The Mood Collection case.',
        },
    ];

    return (
        <>
            <Helmet>
                <title>Gifting | SwissGarden Perfumes</title>
                <meta name="description" content="The gift that knows their taste. The Signature Trio in emerald gift case. Perfect for birthdays, anniversaries, corporate gifting, and celebrations." />
                <link rel="canonical" href="https://swissgardenperfumes.com/gifting" />
            </Helmet>

            <div className="gifting-page">
                {/* Hero Section */}
                <section className="gifting-hero">
                    <div className="container">
                        <motion.div
                            className="gifting-hero-content"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h1 className="gifting-hero-title">The Gift That Knows Their Taste.</h1>
                            <p className="gifting-hero-subtitle">
                                When the person you are gifting has a perspective on fragrance, give them one that respects it.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Gifting Proposition */}
                <section className="gifting-proposition section">
                    <div className="container-sm">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="gifting-prop-visual">
                                <div className="gifting-case-image">
                                    <LazyImage
                                        src="/Images/Combo%20Set.png"
                                        alt="Signature Trio Gift Case"
                                        priority={true}
                                        useThumbnail={false}
                                        width={400}
                                        height={500}
                                    />
                                </div>
                            </div>
                            <div className="gifting-prop-text">
                                <h2 className="section-title">The Signature Trio</h2>
                                <p className="gifting-prop-desc">
                                    The Signature Trio is designed to be given. The deep emerald gift case with gold foil detailing arrives gift-ready — 
                                    no additional wrapping required. The unboxing is part of the experience.
                                </p>
                                <p className="gifting-prop-desc">
                                    <strong>Choose three attars yourself</strong> — for someone whose preferences you know well. 
                                    Or <strong>let them choose</strong> — gift a Signature Trio card and allow the recipient to build their own combination 
                                    from the full collection.
                                </p>
                                <Link to="/combo-set" className="btn btn-primary btn-lg">
                                    <FiGift size={18} /> Build a Gift Trio
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Gifting Features */}
                <section className="gifting-features section section-gray">
                    <div className="container">
                        <div className="gifting-features-grid">
                            {giftingFeatures.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    className="gifting-feature-card"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1, duration: 0.5 }}
                                >
                                    <div className="gifting-feature-icon">{feature.icon}</div>
                                    <h3 className="gifting-feature-title">{feature.title}</h3>
                                    <p className="gifting-feature-desc">{feature.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Gifting Occasions */}
                <section className="gifting-occasions section">
                    <div className="container-sm">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="section-title">Perfect For Every Occasion</h2>
                            <div className="gifting-occasions-list">
                                {giftingOccasions.map((occasion, index) => (
                                    <motion.div
                                        key={index}
                                        className="gifting-occasion-item"
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.08, duration: 0.4 }}
                                    >
                                        <div className="gifting-occasion-bullet">•</div>
                                        <span>{occasion}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Corporate Gifting */}
                <section className="gifting-corporate section section-dark">
                    <div className="container-sm">
                        <motion.div
                            className="gifting-corporate-content"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="gifting-corporate-icon">
                                <FiPackage size={48} />
                            </div>
                            <h2 className="gifting-corporate-title">Corporate Gifting</h2>
                            <p className="gifting-corporate-desc">
                                For corporate orders of <strong>10 units or above</strong>, Swiss Garden Perfumes offers personalised packaging options 
                                and bulk pricing. Contact us to discuss your requirements.
                            </p>
                            <div className="gifting-corporate-benefits">
                                <div className="gifting-benefit">
                                    <FiCheck size={20} />
                                    <span>Personalised packaging & branding</span>
                                </div>
                                <div className="gifting-benefit">
                                    <FiCheck size={20} />
                                    <span>Bulk pricing for 10+ units</span>
                                </div>
                                <div className="gifting-benefit">
                                    <FiCheck size={20} />
                                    <span>Dedicated account management</span>
                                </div>
                                <div className="gifting-benefit">
                                    <FiCheck size={20} />
                                    <span>Custom gift messages & cards</span>
                                </div>
                            </div>
                            <Link to="/contact?subject=corporate-gifting" className="btn btn-accent btn-lg">
                                <FiMail size={18} /> Enquire About Corporate Gifting
                            </Link>
                        </motion.div>
                    </div>
                </section>

                {/* Product Showcase */}
                <section className="gifting-showcase section">
                    <div className="container">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="section-title">What They'll Receive</h2>
                            <p className="section-subtitle">
                                Three precision attars in individual branded boxes, presented in The Mood Collection emerald gift case
                            </p>
                            <div className="gifting-showcase-grid">
                                <div className="gifting-showcase-item">
                                    <div className="gifting-showcase-image">
                                        <LazyImage src="/Images/Alpine%20Savage.webp" alt="Alpine Savage attar in its individual branded box" width={400} height={500} />
                                    </div>
                                    <h4>Individual Branded Boxes</h4>
                                    <p>Each 10ml roll-on in its own protective box</p>
                                </div>
                                <div className="gifting-showcase-item">
                                    <div className="gifting-showcase-image">
                                        <LazyImage src="/Images/Royal%20Ascent.webp" alt="Royal Ascent precision roll-on attar" width={400} height={500} />
                                    </div>
                                    <h4>Precision Roll-On Format</h4>
                                    <p>Controlled application, travel-friendly design</p>
                                </div>
                                <div className="gifting-showcase-item">
                                    <div className="gifting-showcase-image">
                                        <LazyImage
                                            src="/Images/Combo%20Set.png"
                                            alt="Emerald Gift Case"
                                            priority={true}
                                            useThumbnail={false}
                                            width={400}
                                            height={500}
                                        />
                                    </div>
                                    <h4>Emerald Gift Case</h4>
                                    <p>Deep emerald with gold foil detailing</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="gifting-cta section section-accent">
                    <div className="container-sm">
                        <motion.div
                            className="gifting-cta-content"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="gifting-cta-title">Ready to give something they'll actually remember?</h2>
                            <p className="gifting-cta-desc">
                                Build your Signature Trio. Choose three attars. Gift with confidence.
                            </p>
                            <div className="gifting-cta-actions">
                                <Link to="/combo-set" className="btn btn-dark btn-lg">
                                    <FiGift size={18} /> Build Your Gift Trio
                                </Link>
                                <Link to="/shop" className="btn btn-outline-dark btn-lg">
                                    Browse All Attars <FiArrowRight size={16} />
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default Gifting;
