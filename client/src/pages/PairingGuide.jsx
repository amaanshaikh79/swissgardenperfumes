import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FiArrowRight, FiDroplet } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import LazyImage from '../components/common/LazyImage';
import './PairingGuide.css';

const PairingGuide = () => {
    const [selectedCombo, setSelectedCombo] = useState(null);

    const combinations = [
        {
            id: 1,
            name: 'The Power Statement',
            mood: 'Bold-Formal',
            attars: ['Alpine Savage', 'Royal Ascent'],
            howToWear: 'Apply Royal Ascent at the collar and Alpine Savage on the inner wrist.',
            effect: 'A commanding, warm-spice dominant combination with aromatic elegance. Built for formal occasions, high-stakes evenings, and environments where presence matters.',
            worksFor: 'Board meetings, formal dinners, celebratory events',
            image1: '/Images/Alpine%20Savage.webp',
            image2: '/Images/Royal%20Ascent.webp',
        },
        {
            id: 2,
            name: 'The Modern Edge',
            mood: 'Bold-Fresh',
            attars: ['Alpine Savage', 'Blue Dominion'],
            howToWear: 'Apply Blue Dominion at the wrist and Alpine Savage at the collar.',
            effect: 'A bold-masculine combination that balances raw intensity with clean modern freshness. The contrast keeps both attars distinct while creating a layered presence.',
            worksFor: 'Evenings out, casual-formal settings, confident everyday wear',
            image1: '/Images/Alpine%20Savage.webp',
            image2: '/Images/Blue%20Dominion.webp',
        },
        {
            id: 3,
            name: 'The Daily Ritual',
            mood: 'Fresh-Woody',
            attars: ['Blue Dominion', 'Glacier Splash'],
            howToWear: 'Apply Glacier Splash on the wrist and Blue Dominion at the collar.',
            effect: 'The most wearable everyday combination in the collection. Clean aquatic freshness at the top, woody-musky warmth underneath. Works in every setting without demanding attention.',
            worksFor: 'Office, commute, casual outings, everyday wear',
            image1: '/Images/Blue%20Dominion.webp',
            image2: '/Images/Glacier%20Splash.webp',
        },
        {
            id: 4,
            name: 'The Bright Morning',
            mood: 'Fresh-Citrus',
            attars: ['Citrus Reverie', 'Glacier Splash'],
            howToWear: 'Apply both at opposing wrists and allow them to develop through the day.',
            effect: 'The lightest, most energising combination in the collection. Two fresh profiles that amplify each other\'s brightness without competition. A clean, uplifting start.',
            worksFor: 'Mornings, travel, summer days, gym-to-day transitions',
            image1: '/Images/Citrus%20Reverie.webp',
            image2: '/Images/Glacier%20Splash.webp',
        },
        {
            id: 5,
            name: 'The Floral Lift',
            mood: 'Floral-Citrus',
            attars: ['Citrus Reverie', 'Swiss Flora'],
            howToWear: 'Apply Swiss Flora on the inner wrist and Citrus Reverie at the collar.',
            effect: 'A feminine, uplifting pairing — citrus brightness married to floral elegance. Light enough for daytime, refined enough for evenings. The most giftable combination.',
            worksFor: 'Daytime occasions, gifting, celebrations, brunches',
            image1: '/Images/Citrus%20Reverie.webp',
            image2: '/Images/Swiss%20Flora.webp',
        },
        {
            id: 6,
            name: 'The Formal Grace',
            mood: 'Floral-Formal',
            attars: ['Royal Ascent', 'Swiss Flora'],
            howToWear: 'Apply Royal Ascent at the collar and Swiss Flora on the inner wrist.',
            effect: 'Classical and composed. The structured citrus-aromatic of Royal Ascent grounds the floral elegance of Swiss Flora into a combination that is sophisticated without effort.',
            worksFor: 'Formal occasions, weddings, official events, gifting',
            image1: '/Images/Royal%20Ascent.webp',
            image2: '/Images/Swiss%20Flora.webp',
        },
    ];

    const pairingMatrix = [
        { row: 'Alpine', cols: ['—', '—', '★★★', '★★', '★★', '★★★'] },
        { row: 'Citrus', cols: ['—', '—', '★★', '★★★', '★★★', '★★'] },
        { row: 'Royal', cols: ['★★★', '★★', '—', '★★', '★★★', '★★'] },
        { row: 'Glacier', cols: ['★★', '★★★', '★★', '—', '★★', '★★★'] },
        { row: 'Swiss', cols: ['★★', '★★★', '★★★', '★★', '—', '★★'] },
        { row: 'Blue', cols: ['★★★', '★★', '★★', '★★★', '★★', '—'] },
    ];

    const columnHeaders = ['Alpine', 'Citrus', 'Royal', 'Glacier', 'Swiss', 'Blue'];

    return (
        <>
            <Helmet>
                <title>Scent Pairing Guide | SwissGarden Perfumes</title>
                <meta name="description" content="Learn how to layer our attars. Six recommended combinations, layering techniques, and a complete pairing matrix for creating your signature scent." />
                <link rel="canonical" href="https://swissgardenperfumes.com/pairing-guide" />
            </Helmet>

            <div className="pairing-guide-page">
                {/* Hero Section */}
                <section className="pairing-hero">
                    <div className="container">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h1 className="pairing-hero-title">Your Attar. Your Rules.</h1>
                            <p className="pairing-hero-intro">
                                Every fragrance The Mood Collection is engineered to stand alone. And every one of them pairs with at least two others. 
                                This guide shows you the recommended combinations — what they create together, how to wear them, and when they work best.
                            </p>
                            <p className="pairing-hero-note">
                                <em>Apply each attar to a different pulse point. Let them develop separately for 10 minutes before assessing the combination. 
                                Fragrance layering is personal — these are starting points, not prescriptions.</em>
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* How to Layer */}
                <section className="pairing-how-to section">
                    <div className="container-sm">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="section-title">How to Layer</h2>
                            <div className="pairing-steps">
                                <div className="pairing-step">
                                    <div className="pairing-step-number">01</div>
                                    <div className="pairing-step-content">
                                        <h3>Choose your primary attar</h3>
                                        <p>The dominant mood you want to carry.</p>
                                    </div>
                                </div>
                                <div className="pairing-step">
                                    <div className="pairing-step-number">02</div>
                                    <div className="pairing-step-content">
                                        <h3>Choose your secondary attar</h3>
                                        <p>The note you want underneath or beside it.</p>
                                    </div>
                                </div>
                                <div className="pairing-step">
                                    <div className="pairing-step-number">03</div>
                                    <div className="pairing-step-content">
                                        <h3>Apply to separate pulse points</h3>
                                        <p>Wrist, collar, and behind the ear are the most effective for contrast.</p>
                                    </div>
                                </div>
                                <div className="pairing-step">
                                    <div className="pairing-step-number">04</div>
                                    <div className="pairing-step-content">
                                        <h3>Allow 10 minutes to settle</h3>
                                        <p>Assess the combined effect on your skin before deciding.</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Recommended Combinations */}
                <section className="pairing-combinations section section-gray">
                    <div className="container">
                        <div className="section-header">
                            <h2 className="section-title">Recommended Combinations</h2>
                            <p className="section-subtitle">Six curated pairings to start your layering journey</p>
                        </div>

                        <div className="pairing-combos-grid">
                            {combinations.map((combo, index) => (
                                <motion.div
                                    key={combo.id}
                                    className="pairing-combo-card"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1, duration: 0.5 }}
                                >
                                    <div className="pairing-combo-header">
                                        <div className="pairing-combo-number">{String(combo.id).padStart(2, '0')}</div>
                                        <div className="pairing-combo-title-block">
                                            <h3 className="pairing-combo-name">{combo.name}</h3>
                                            <span className="pairing-combo-mood">{combo.mood}</span>
                                        </div>
                                    </div>

                                    <div className="pairing-combo-images">
                                        <div className="pairing-combo-image">
                                            <LazyImage src={combo.image1} alt={combo.attars[0]} />
                                        </div>
                                        <div className="pairing-combo-plus">+</div>
                                        <div className="pairing-combo-image">
                                            <LazyImage src={combo.image2} alt={combo.attars[1]} />
                                        </div>
                                    </div>

                                    <div className="pairing-combo-attars">
                                        <FiDroplet size={14} />
                                        <span>{combo.attars.join(' + ')}</span>
                                    </div>

                                    <div className="pairing-combo-section">
                                        <h4>How to wear:</h4>
                                        <p>{combo.howToWear}</p>
                                    </div>

                                    <div className="pairing-combo-section">
                                        <h4>The effect:</h4>
                                        <p>{combo.effect}</p>
                                    </div>

                                    <div className="pairing-combo-works">
                                        <strong>Works for:</strong> <em>{combo.worksFor}</em>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Pairing Matrix */}
                <section className="pairing-matrix section">
                    <div className="container">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="section-header">
                                <h2 className="section-title">Full Combination Matrix</h2>
                                <p className="section-subtitle">
                                    Every possible two-attar pairing across the six-SKU collection. Each combination is rated for occasion suitability.
                                </p>
                            </div>

                            <div className="pairing-matrix-table-wrapper">
                                <table className="pairing-matrix-table">
                                    <thead>
                                        <tr>
                                            <th></th>
                                            {columnHeaders.map((header) => (
                                                <th key={header}>{header}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pairingMatrix.map((row, rowIndex) => (
                                            <tr key={rowIndex}>
                                                <td className="pairing-matrix-row-header">{row.row}</td>
                                                {row.cols.map((cell, cellIndex) => (
                                                    <td key={cellIndex} className={cell.includes('★★★') ? 'pairing-matrix-highlight' : ''}>
                                                        {cell}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="pairing-matrix-legend">
                                <div className="pairing-legend-item">
                                    <span className="pairing-legend-symbol">★★★</span>
                                    <span>Highly recommended pairing</span>
                                </div>
                                <div className="pairing-legend-item">
                                    <span className="pairing-legend-symbol">★★</span>
                                    <span>Suitable pairing</span>
                                </div>
                                <div className="pairing-legend-item">
                                    <span className="pairing-legend-symbol">—</span>
                                    <span>Same attar (no pairing)</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="pairing-cta section section-dark">
                    <div className="container-sm">
                        <motion.div
                            className="pairing-cta-content"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="pairing-cta-title">Ready to build your signature?</h2>
                            <p className="pairing-cta-desc">
                                Choose any three attars and create your own personal fragrance system. The Signature Trio gives you everything you need to layer, experiment, and discover.
                            </p>
                            <Link to="/combo-set" className="btn btn-accent btn-lg">
                                Build Your Trio <FiArrowRight size={16} />
                            </Link>
                        </motion.div>
                    </div>
                </section>
            </div>
        </>
    );
};

export default PairingGuide;
