import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiGlobe, FiArrowRight, FiFeather, FiRefreshCw, FiLayers, FiTarget, FiStar, FiUsers, FiZap } from 'react-icons/fi';
import LazyImage from '../components/common/LazyImage';
import './About.css';

const About = () => {
    const chapters = [
        {
            icon: <FiFeather size={24} />,
            title: 'The Attar Collection',
            desc: 'Six precision roll-on fragrances. Non-alcoholic. Concentrated. The vocabulary of a larger language we are building.',
        },
        {
            icon: <FiLayers size={24} />,
            title: 'The Layering Matrix',
            desc: 'A system of six fragrances engineered to create distinct combination with our first roll-on collection.',
        },
    ];

    const promises = [
        { icon: <FiHeart size={22} />, text: 'Every Swiss Garden fragrance is crafted to a standard, not a price point.' },
        { icon: <FiFeather size={22} />, text: 'We will never use our price as an excuse for lower quality.' },
        { icon: <FiGlobe size={22} />, text: 'We will never launch a fragrance we wouldn\'t wear ourselves.' },
        { icon: <FiRefreshCw size={22} />, text: 'We will never stop innovating — the best version of Swiss Garden is always the next one.' },
    ];

    const brandPillars = [
        {
            icon: <FiTarget size={26} />,
            number: '01',
            title: 'Swiss Precision',
            desc: 'Every fragrance we create is engineered. Every note is intentional. Every combination is designed. Nothing is accidental.',
        },
        {
            icon: <FiHeart size={26} />,
            number: '02',
            title: 'Indian Soul',
            desc: 'We carry the depth of a civilization that has understood the power of scent for thousands of years. Attar traditions that predate modern perfumery by centuries live in our DNA.',
        },
        {
            icon: <FiStar size={26} />,
            number: '03',
            title: 'Accessible Luxury',
            desc: 'We refuse the idea that luxury requires exclusion. Extraordinary fragrance is a right, not a privilege. We are building for modern India.',
        },
        {
            icon: <FiZap size={26} />,
            number: '04',
            title: 'Innovation as Identity',
            desc: 'The Layering Matrix. Every phase of Swiss Garden Perfumes pushes what Indian fragrance can be. We are not following the market. We are building it.',
        },
    ];

    const brandTruths = [
        'Scent is the most personal form of self-expression available to us.',
        'You are not one identity — your fragrance wardrobe should reflect that.',
        'Swiss Garden Perfumes is not a product. It is a world you join.',
    ];

    const gallery = [
        '/Images/Alpine%20Savage(2).webp',
        '/Images/Blue%20Dominion(2).webp',
        '/Images/Glacier%20Splash(2).webp',
        '/Images/Royal%20Ascent(2).webp',
    ];

    return (
        <>
            <Helmet>
                <title>About Us | Swiss Garden Perfumes</title>
                <meta name="description" content="The story behind Swiss Garden Perfumes — a fragrance house built for Modern India. Precision-crafted. Identity-driven. Swiss precision meets Indian soul." />
            </Helmet>

            <div className="about-page">
                {/* ─── Editorial Hero ──────────────────────────── */}
                <section className="about-hero-section">
                    <div className="about-hero-bg">
                        <div className="about-hero-overlay" />
                    </div>
                    <div className="container-sm">
                        <motion.div
                            className="about-hero-content"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7 }}
                        >
                            <h1 className="about-hero-title">Precision. Presence. <em>Personality.</em></h1>
                            <p className="about-hero-subtitle">
                                Swiss Garden Perfumes is a fragrance house built around one idea: that a scent should mean something.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* ─── Origin Story ────────────────────────────── */}
                <section className="about-founding section">
                    <div className="container-sm">
                        <motion.div
                            className="about-founding-content"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <span className="section-label">Brand Story</span>
                            <div className="about-founding-text">
                                <p>
                                    Fragrance in India has always carried weight — in ritual, in memory, in identity. But the modern Indian consumer has been underserved: caught between mass-market body sprays that fade by noon and luxury imports priced out of everyday reach.
                                </p>
                                <p>
                                    Swiss Garden Perfumes was created to occupy the space between those two extremes. A precision fragrance house — digital-native, quality-obsessed, and uncompromisingly positioned at the affordable luxury tier — built for the generation that wants to smell considered without being told what a luxury buyer is supposed to look like.
                                </p>
                                <p>
                                    The name carries both a philosophy and a standard. Swiss precision — in formulation, in structure, in the discipline of every note pyramid. Indian craft — in the attar tradition, in the understanding of how fragrance sits on Indian skin in Indian climates, and in the ambition to build a homegrown luxury house without apology.
                                </p>
                                <p>
                                    <em>The Mood Collection is the first expression of that standard. Six attars. Six moods. One system.</em>
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* ─── Founder's Note ─────────────────────────────── */}
                <section className="about-founder-note section">
                    <div className="container-sm">
                        <motion.blockquote
                            className="about-founder-quote"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                        >
                            <p>
                                "We built Swiss Garden Perfumes because we believe precision is not a luxury — it is a baseline. Every fragrance in this collection is formulated to a standard, not a price point. Wear it as it is. Layer it your way. Make it yours."
                            </p>
                            <footer className="about-founder-attribution">
                                — Founder, Swiss Garden Perfumes
                            </footer>
                        </motion.blockquote>
                    </div>
                </section>

                {/* ─── Brand Philosophy & Pillars ──────────────────── */}
                <section className="about-pillars section">
                    <div className="container-sm">
                        <motion.div
                            className="about-pillars-header"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                        >
                            <span className="section-label">Brand Philosophy</span>
                            <h2 className="about-pillars-tagline">Swiss precision. Indian craft.</h2>
                            <p className="about-pillars-sub">Crafted around emotion, presence, and individuality.</p>
                        </motion.div>

                        <div className="about-pillars-grid">
                            <motion.div className="about-pillar-card" initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                                <span className="about-pillar-num">01</span>
                                <h3 className="about-pillar-title">Precision</h3>
                                <p className="about-pillar-desc">Every product is built to a specification. Fragrance notes are structured — top, heart, base — with defined progression. The roll-on format is not convenience for its own sake; it is precision of application. We do not do vague. We do not do accidental.</p>
                            </motion.div>
                            <motion.div className="about-pillar-card" initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}>
                                <span className="about-pillar-num">02</span>
                                <h3 className="about-pillar-title">Presence</h3>
                                <p className="about-pillar-desc">A Swiss Garden Perfumes attar is not background noise. It is a statement of presence — quiet enough to be worn in a boardroom, distinct enough to be remembered in a crowd. Long-wear concentration ensures that statement lasts.</p>
                            </motion.div>
                            <motion.div className="about-pillar-card" initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}>
                                <span className="about-pillar-num">03</span>
                                <h3 className="about-pillar-title">Personality</h3>
                                <p className="about-pillar-desc">The Mood Collection is named for a reason. Each attar is a mood — an emotional register that the wearer chooses deliberately. Fragrance is identity. We build identity into every formula.</p>
                            </motion.div>
                            <motion.div className="about-pillar-card" initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }}>
                                <span className="about-pillar-num">04</span>
                                <h3 className="about-pillar-title">Accessibility</h3>
                                <p className="about-pillar-desc">Precision does not require a premium import price. Swiss Garden Perfumes sits at the affordable luxury tier — ₹799 per attar, ₹2,397 for the Signature Trio — because we believe quality of formulation should not be gated by margin structures.</p>
                            </motion.div>
                        </div>

                        <motion.blockquote
                            className="about-pillars-positioning"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            "The precision fragrance house for the generation that wears scent with intention."
                        </motion.blockquote>
                    </div>
                </section>

                {/* ─── Building Something Larger ───────────────── */}
                <section className="about-timeline-section section">
                    <div className="container-sm">
                        <div className="section-header">
                            <span className="section-label">The Chapters</span>
                            <h2 className="section-title">We Are Building Something Larger Than a Collection.</h2>
                            <p className="section-subtitle">
                                We are not building a product. We are building a fragrance wardrobe. And we are building it with you.
                            </p>
                        </div>
                        <div className="about-sustainability-grid">
                            {chapters.map((chapter, i) => (
                                <motion.div
                                    key={chapter.title}
                                    className="about-sustain-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.15 }}
                                >
                                    <div className="about-sustain-icon">{chapter.icon}</div>
                                    <h3>{chapter.title}</h3>
                                    <p>{chapter.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ─── What We Promise ─────────────────────────── */}
                <section className="about-sustainability section">
                    <div className="container-sm">
                        <div className="section-header">
                            <span className="section-label">Our Commitment</span>
                            <h2 className="section-title">What We Promise You.</h2>
                        </div>
                        <div className="about-sustainability-grid">
                            {promises.map((item, i) => (
                                <motion.div
                                    key={i}
                                    className="about-sustain-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <div className="about-sustain-icon">{item.icon}</div>
                                    <p>{item.text}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ─── Why Choose Swiss Garden ──────────────── */}
                <section className="about-why-section section">
                    <div className="container-sm">

                        {/* Manifesto Block */}
                        <motion.div
                            className="about-manifesto-block"
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <span className="section-label">The Brand Manifesto</span>
                            <h2 className="about-manifesto-headline">
                                Why Choose Swiss Garden Perfumes?
                            </h2>
                            <div className="about-manifesto-opener">
                                <p className="about-manifesto-lead">
                                    We Believe Scent Is Not a Product. <em>It Is a Decision.</em>
                                </p>
                                <p>
                                    Every morning, before the world sees you, before the first word is spoken, before the first impression is made — you choose a scent. That choice is not small.
                                </p>
                                <p>
                                    It tells the room who you are before you speak. It stays on the people you embrace long after you leave. It lives in memory longer than a face, longer than a name, longer than most things we think matter.
                                </p>
                                <p className="about-manifesto-bold">
                                    We built Swiss Garden Perfumes for the person who understands this. Not the person who picks a perfume because it's popular. But the one who chooses a fragrance because it is <em>theirs.</em>
                                </p>
                                <p>
                                    We are a fragrance house — not a brand. There is a difference. Brands sell products. Houses build worlds. <strong>We are building yours.</strong>
                                </p>
                                <p>
                                    Our first collection is six fragrances. Each one complete. Each one a character. Each one designed not just to smell extraordinary — but to layer, to combine, to evolve. Because you are not one thing on Monday and another on Friday. You are everything, always, in different proportions.
                                </p>
                                <p className="about-manifesto-closer">
                                    Swiss Garden Perfumes is precision from the Alps and soul from the subcontinent. It is the discipline of Swiss craft meeting the depth of Indian sensibility. It is luxury that doesn't ask you to whisper about it — it asks you to wear it.
                                </p>
                                <div className="about-manifesto-signature">
                                    <span>— Swiss Garden Perfumes</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Brand Pillars */}
                        <div className="about-pillars-header">
                            <span className="section-label">Brand Pillars</span>
                            <h2 className="section-title">The Four Pillars We Stand On</h2>
                        </div>
                        <div className="about-pillars-grid">
                            {brandPillars.map((pillar, i) => (
                                <motion.div
                                    key={pillar.title}
                                    className="about-pillar-card"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.12, duration: 0.6 }}
                                >
                                    <div className="about-pillar-top">
                                        <span className="about-pillar-number">{pillar.number}</span>
                                        <div className="about-pillar-icon">{pillar.icon}</div>
                                    </div>
                                    <h3 className="about-pillar-title">{pillar.title}</h3>
                                    <p className="about-pillar-desc">{pillar.desc}</p>
                                </motion.div>
                            ))}
                        </div>

                        {/* Brand Truths */}
                        <motion.div
                            className="about-truths-block"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                        >
                            <span className="section-label">The Three Brand Truths</span>
                            <div className="about-truths-list">
                                {brandTruths.map((truth, i) => (
                                    <div key={i} className="about-truth-item">
                                        <span className="about-truth-dot" />
                                        <p>{truth}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* One-Line Brand Truth */}
                        <motion.div
                            className="about-oneline-truth"
                            initial={{ opacity: 0, scale: 0.97 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                        >
                            <span className="about-oneline-label">The One-Line Brand Truth</span>
                            <p className="about-oneline-text">
                                Swiss Garden Perfumes is a luxury fragrance house building the future of personal scent in India — and the Attar Collection is just the invitation.
                            </p>
                        </motion.div>

                    </div>
                </section>

                {/* ─── CTA ─────────────────────────────────────── */}
                <section className="about-cta-section">
                    <div className="container-sm">
                        <motion.div
                            className="about-cta-box"
                            initial={{ opacity: 0, scale: 0.97 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                        >
                            <span className="section-label">Join the House</span>
                            <h2>You are not buying a bottle.<br />You are joining a house.</h2>
                            <p>And this house is just opening its doors.</p>
                            <div className="about-cta-buttons">
                                <Link to="/shop" className="btn btn-white btn-lg">
                                    Shop the Collection <FiArrowRight size={16} />
                                </Link>
                                <Link to="/combo-set" className="btn btn-outline-light btn-lg">
                                    Build Your Trio <FiArrowRight size={16} />
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default About;
