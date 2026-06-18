import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiGlobe, FiArrowRight, FiFeather, FiRefreshCw, FiLayers, FiTarget, FiStar, FiUsers, FiZap } from 'react-icons/fi';
import './About.css';

const About = () => {
    const chapters = [
        {
            icon: <FiFeather size={24} />,
            title: 'The Attar Collection',
            desc: 'Six precision roll-on fragrances. Non-alcoholic. Concentrated. The vocabulary of a larger language we are building.',
        },
        {
            icon: <FiGlobe size={24} />,
            title: 'Eau de Parfum Line',
            desc: 'Full-spectrum spray fragrances for the moments that demand more presence.',
        },
        {
            icon: <FiLayers size={24} />,
            title: 'The Layering Matrix',
            desc: 'A system of six fragrances engineered to create over 100 distinct combinations. Your own personal perfume laboratory.',
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
            desc: 'The Layering Matrix. The Eau de Parfum line. Every phase of Swiss Garden Perfumes pushes what Indian fragrance can be. We are not following the market. We are building it.',
        },
    ];

    const brandTruths = [
        'Scent is the most personal form of self-expression available to us.',
        'You are not one identity — your fragrance wardrobe should reflect that.',
        'Swiss Garden Perfumes is not a product. It is a world you join.',
    ];

    const gallery = [
        '/Images/Alpine Savage(2).JPG',
        '/Images/Blue Dominion(2).JPG',
        '/Images/Glacier Splash(2).JPG',
        '/Images/Royal Ascent(2).JPG',
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
                            <span className="section-label" style={{ color: 'var(--accent-200)' }}>The Story Behind the House</span>
                            <h1 className="about-hero-title">Engineered for the Skin.<br /><em>Designed for the Soul.</em></h1>
                            <p className="about-hero-subtitle">
                                A Fragrance House Built for Modern India. Precision-crafted. Identity-driven. Just getting started.
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
                            <span className="section-label">The Origin Story</span>
                            <h2 className="about-founding-title">The Story of Swiss Garden Perfumes</h2>
                            <div className="about-founding-text">
                                <p>
                                    There is a particular kind of frustration that only a true fragrance lover understands. You walk into a store. The shelves are full. Hundreds of options. And yet — nothing feels like you. Everything smells like it was made for someone else. A mass-produced idea of what you should want.
                                </p>
                                <p>
                                    Or the opposite problem. You find something extraordinary — a niche fragrance, a real masterpiece of perfumery — and the price tag tells you it wasn't made for you either.
                                </p>
                                <p>
                                    <em>Swiss Garden Perfumes was born in the space between those two frustrations.</em>
                                </p>
                                <p>
                                    The conviction was simple: India deserves a fragrance house. Not a perfume brand. Not an attar seller. Not an imported name slapped onto a bottle. A house — with a point of view, a philosophy, a long-term vision of what scent can mean in modern Indian life.
                                </p>
                                <p>
                                    We chose the name deliberately. Switzerland is the global capital of precision — watchmaking, engineering, the relentless pursuit of getting things exactly right. The garden is something alive, growing, layered with depth. That tension — between precision and nature, between structure and soul — is what drives every fragrance we create.
                                </p>
                                <p>
                                    Our first collection, the Attar Collection, is six roll-on fragrances. Non-alcoholic. Concentrated. Precise. But these six are not simply products. They are the vocabulary of a larger language we are building — a system of scent that lets you construct your own identity, your own combinations, your own signature.
                                </p>
                                <p>
                                    We call what's coming <em>the Layering Matrix</em>. And it will change how India thinks about fragrance. But that story is still unfolding.
                                </p>
                                <p>
                                    For now — six fragrances. One house. Infinite identities. <strong>This is Swiss Garden Perfumes.</strong>
                                </p>
                            </div>
                            <Link to="/shop" className="btn btn-outline btn-lg" style={{ marginTop: 'var(--space-xl)' }}>
                                Explore the Collection <FiArrowRight size={16} />
                            </Link>
                        </motion.div>
                    </div>
                </section>

                {/* ─── We Are Not a Brand ───────────────────────── */}
                <section className="about-sustainability section section-gray">
                    <div className="container-sm">
                        <div className="section-header">
                            <span className="section-label">Our Philosophy</span>
                            <h2 className="section-title">We Are Not a Perfume Brand.</h2>
                            <p className="section-subtitle">
                                Most perfume brands start with a product. We started with a belief — that fragrance is the most personal form of self-expression available to us. More intimate than fashion. More lasting than a haircut. More honest than almost anything else we put on before we face the world.
                            </p>
                            <p className="section-subtitle" style={{ marginTop: '1rem' }}>
                                Swiss Garden Perfumes is a fragrance house — an institution built around the art, science, and philosophy of scent. We make fragrances for people who take their identity seriously. Who understand that how you smell is not vanity. <em>It is vocabulary.</em>
                            </p>
                        </div>
                    </div>
                </section>

                {/* ─── Swiss Precision. Indian Soul. ───────────── */}
                <section className="about-founding section">
                    <div className="container-sm">
                        <motion.div
                            className="about-founding-content"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <span className="section-label">Two Worlds. One House.</span>
                            <h2 className="about-founding-title">Swiss Precision. Indian Soul.</h2>
                            <div className="about-founding-text">
                                <p>
                                    Every fragrance we create lives at the intersection of two worlds.
                                </p>
                                <p>
                                    The first world is <em>Swiss</em> — disciplined, architectural, precise. The kind of precision that goes into a movement with 200 parts, each one exactly where it belongs. We bring that discipline to fragrance formulation. Every note is intentional. Every combination is engineered.
                                </p>
                                <p>
                                    The second world is <em>Indian</em> — layered, rich, sensory, emotional. A civilization that has understood the power of scent for thousands of years. Attar traditions that predate modern perfumery by centuries. We bring that depth to everything we make.
                                </p>
                                <p>
                                    The result is something that feels both new and ancient. Both global and deeply ours.
                                </p>
                            </div>
                        </motion.div>
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

                {/* ─── Behind the Scenes Gallery ──────────────── */}
                <section className="about-gallery section section-gray">
                    <div className="container">
                        <div className="section-header">
                            <span className="section-label">Behind the Scenes</span>
                            <h2 className="section-title">Where the Magic Happens</h2>
                        </div>
                        <div className="about-gallery-grid">
                            {gallery.map((img, i) => (
                                <motion.div
                                    key={i}
                                    className="about-gallery-item"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <img src={img} alt={`Behind the scenes ${i + 1}`} loading="lazy" />
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
                                <Link to="/fragrance-finder" className="btn btn-outline-light btn-lg">
                                    Find Your Scent <FiArrowRight size={16} />
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
