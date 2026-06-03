import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowRight, FiArrowLeft, FiShare2, FiBookmark, FiCheck } from 'react-icons/fi';
import './FragranceFinder.css';

const questions = [
    {
        id: 1,
        question: 'How do you want to feel when you wear fragrance?',
        options: [
            { label: 'Confident & powerful', value: 'confident', emoji: '🦁' },
            { label: 'Calm & grounded', value: 'calm', emoji: '🌿' },
            { label: 'Playful & energetic', value: 'playful', emoji: '✨' },
            { label: 'Romantic & sensual', value: 'romantic', emoji: '🌹' },
        ],
    },
    {
        id: 2,
        question: 'Pick a setting that speaks to you.',
        options: [
            { label: 'A midnight rooftop party', value: 'night', emoji: '🌃' },
            { label: 'A quiet walk through a garden', value: 'garden', emoji: '🌳' },
            { label: 'A bustling spice market', value: 'spice', emoji: '🏮' },
            { label: 'A cozy cabin by the fire', value: 'cozy', emoji: '🔥' },
        ],
    },
    {
        id: 3,
        question: 'What kind of compliments do you love?',
        options: [
            { label: '"You smell amazing, what is that?"', value: 'bold', emoji: '💬' },
            { label: '"There\'s something about you..."', value: 'subtle', emoji: '🤔' },
            { label: '"You always smell so fresh!"', value: 'fresh', emoji: '💎' },
            { label: '"Come closer, you smell incredible"', value: 'intimate', emoji: '🫂' },
        ],
    },
    {
        id: 4,
        question: 'Which texture appeals to you most?',
        options: [
            { label: 'Smooth leather', value: 'leather', emoji: '🧥' },
            { label: 'Cool silk', value: 'silk', emoji: '🎀' },
            { label: 'Warm cashmere', value: 'cashmere', emoji: '🧶' },
            { label: 'Crisp linen', value: 'linen', emoji: '🤍' },
        ],
    },
    {
        id: 5,
        question: 'When do you reach for perfume the most?',
        options: [
            { label: 'Before a big meeting', value: 'work', emoji: '💼' },
            { label: 'Date night', value: 'date', emoji: '🕯️' },
            { label: 'Every single day', value: 'daily', emoji: '☀️' },
            { label: 'Special occasions only', value: 'special', emoji: '🥂' },
        ],
    },
    {
        id: 6,
        question: 'Pick a color palette.',
        options: [
            { label: 'Deep blacks & golds', value: 'dark', emoji: '🖤' },
            { label: 'Soft pastels & whites', value: 'light', emoji: '🤍' },
            { label: 'Rich burgundy & amber', value: 'warm', emoji: '❤️' },
            { label: 'Ocean blues & greens', value: 'cool', emoji: '💙' },
        ],
    },
    {
        id: 7,
        question: 'How long should your scent last?',
        options: [
            { label: 'All day and into the night (10+ hrs)', value: 'beast', emoji: '⏳' },
            { label: 'A solid workday (6-8 hrs)', value: 'moderate', emoji: '🕐' },
            { label: 'Light whisper, close to skin', value: 'intimate', emoji: '🌬️' },
            { label: 'I re-apply — I like switching up', value: 'versatile', emoji: '🔄' },
        ],
    },
];

const resultProfiles = {
    bold: {
        name: 'The Statement Maker',
        description: 'You want scent that enters the room before you do. Powerful ouds, rich spices, and deep woody bases are your signature.',
        families: ['Oriental', 'Woody'],
        recommendations: ['Oud Heritage', 'Dark Musk Intense', 'Noir Absolute'],
        link: '/shop?fragranceFamily=Oriental',
    },
    subtle: {
        name: 'The Quiet Luxury',
        description: 'Understated elegance. Your fragrance is a whisper — discovered only by those who come close. Soft woods, clean musks, gentle florals.',
        families: ['Fresh', 'Floral'],
        recommendations: ['Garden Botanicals', 'White Musk', 'Silk & Jasmine'],
        link: '/shop?fragranceFamily=Fresh',
    },
    warm: {
        name: 'The Warm Soul',
        description: 'You radiate warmth. Amber, vanilla, sandalwood — your scents feel like a hug. Cozy, comforting, addictive.',
        families: ['Oriental', 'Gourmand'],
        recommendations: ['Amber Dreams', 'Vanilla Oud', 'Spiced Cashmere'],
        link: '/shop?fragranceFamily=Gourmand',
    },
    fresh: {
        name: 'The Free Spirit',
        description: 'Clean energy. You love scents that feel like a deep breath of mountain air — citrus, aquatics, green notes.',
        families: ['Citrus', 'Aquatic'],
        recommendations: ['Ocean Breeze', 'Citrus Sun', 'Green Vetiver'],
        link: '/shop?fragranceFamily=Citrus',
    },
};

const FragranceFinder = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null);
    const [saved, setSaved] = useState(false);

    const handleAnswer = (questionId, value) => {
        setAnswers((prev) => ({ ...prev, [questionId]: value }));
    };

    const nextStep = () => {
        if (currentStep < questions.length - 1) {
            setCurrentStep((prev) => prev + 1);
        } else {
            calculateResult();
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    const calculateResult = () => {
        const vals = Object.values(answers);
        const scores = { bold: 0, subtle: 0, warm: 0, fresh: 0 };

        vals.forEach((v) => {
            if (['confident', 'night', 'bold', 'leather', 'work', 'dark', 'beast'].includes(v)) scores.bold++;
            if (['calm', 'garden', 'subtle', 'silk', 'daily', 'light', 'intimate'].includes(v)) scores.subtle++;
            if (['romantic', 'cozy', 'intimate', 'cashmere', 'date', 'warm', 'moderate'].includes(v)) scores.warm++;
            if (['playful', 'spice', 'fresh', 'linen', 'special', 'cool', 'versatile'].includes(v)) scores.fresh++;
        });

        const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
        setResult(resultProfiles[top]);
    };

    const handleShare = async () => {
        const text = `I'm "${result.name}" on SwissGarden's Fragrance Finder! Discover your scent personality:`;
        if (navigator.share) {
            try {
                await navigator.share({ title: 'My Fragrance Profile', text, url: window.location.href });
            } catch { /* user cancelled */ }
        } else {
            navigator.clipboard.writeText(`${text} ${window.location.href}`);
        }
    };

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const progress = ((currentStep + 1) / questions.length) * 100;
    const currentQuestion = questions[currentStep];
    const hasAnswered = answers[currentQuestion?.id];

    // Results view
    if (result) {
        return (
            <>
                <Helmet>
                    <title>Your Fragrance Profile | SwissGarden Perfumes</title>
                </Helmet>
                <div className="finder-page">
                    <div className="finder-results">
                        <motion.div
                            className="finder-results-content"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <span className="section-label">Your Scent Profile</span>
                            <h1 className="finder-results-name">{result.name}</h1>
                            <p className="finder-results-desc">{result.description}</p>

                            <div className="finder-results-families">
                                <h4>Your Fragrance Families</h4>
                                <div className="finder-family-tags">
                                    {result.families.map((f) => (
                                        <span key={f} className="finder-family-tag">{f}</span>
                                    ))}
                                </div>
                            </div>

                            <div className="finder-results-recs">
                                <h4>We Recommend</h4>
                                <ul className="finder-rec-list">
                                    {result.recommendations.map((r) => (
                                        <li key={r}>{r}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="finder-results-actions">
                                <Link to={result.link} className="btn btn-primary btn-lg">
                                    Shop Your Profile <FiArrowRight size={16} />
                                </Link>
                                <button className="btn btn-outline" onClick={handleShare}>
                                    <FiShare2 size={16} /> Share
                                </button>
                                <button className="btn btn-outline" onClick={handleSave}>
                                    {saved ? <FiCheck size={16} /> : <FiBookmark size={16} />}
                                    {saved ? 'Saved!' : 'Save'}
                                </button>
                            </div>

                            <div className="finder-sample-cta">
                                <p>Not sure yet? Try before you commit.</p>
                                <Link to="/shop?category=Gift+Set" className="btn btn-accent btn-lg">
                                    Order a Sample Set — ₹299 <FiArrowRight size={16} />
                                </Link>
                            </div>

                            <button className="btn btn-ghost finder-retake" onClick={() => { setResult(null); setCurrentStep(0); setAnswers({}); }}>
                                Retake Quiz
                            </button>
                        </motion.div>
                    </div>
                </div>
            </>
        );
    }

    // Quiz view
    return (
        <>
            <Helmet>
                <title>Fragrance Finder — Discover Your Scent | SwissGarden Perfumes</title>
                <meta name="description" content="Take our 2-minute fragrance quiz and discover the perfect scent for your personality." />
            </Helmet>

            <div className="finder-page">
                <div className="finder-quiz">
                    {/* Progress */}
                    <div className="finder-progress">
                        <div className="finder-progress-bar">
                            <motion.div
                                className="finder-progress-fill"
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.4 }}
                            />
                        </div>
                        <span className="finder-progress-text">{currentStep + 1} of {questions.length}</span>
                    </div>

                    {/* Question */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentQuestion.id}
                            className="finder-question"
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -40 }}
                            transition={{ duration: 0.35 }}
                        >
                            <h2 className="finder-question-text">{currentQuestion.question}</h2>
                            <div className="finder-options">
                                {currentQuestion.options.map((opt) => (
                                    <button
                                        key={opt.value}
                                        className={`finder-option ${answers[currentQuestion.id] === opt.value ? 'selected' : ''}`}
                                        onClick={() => handleAnswer(currentQuestion.id, opt.value)}
                                    >
                                        <span className="finder-option-emoji">{opt.emoji}</span>
                                        <span className="finder-option-label">{opt.label}</span>
                                        {answers[currentQuestion.id] === opt.value && (
                                            <FiCheck className="finder-option-check" size={18} />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="finder-nav">
                        <button className="btn btn-ghost" onClick={prevStep} disabled={currentStep === 0}>
                            <FiArrowLeft size={16} /> Back
                        </button>
                        <button className="btn btn-primary btn-lg" onClick={nextStep} disabled={!hasAnswered}>
                            {currentStep === questions.length - 1 ? 'See My Results' : 'Next'} <FiArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default FragranceFinder;
