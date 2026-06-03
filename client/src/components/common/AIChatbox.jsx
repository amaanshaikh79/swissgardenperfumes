import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageCircle, FiX, FiSend, FiUser } from 'react-icons/fi';
import './AIChatbox.css';

const BOT_NAME = 'SwissGarden AI';
const BOT_AVATAR = '✨';

const knowledgeBase = [
    {
        keywords: ['hello', 'hi', 'hey', 'good morning', 'good evening'],
        response: "Hello! Welcome to SwissGarden Perfumes. I'm your fragrance assistant. How can I help you today? I can recommend scents, answer questions about our products, or help you find your perfect fragrance.",
    },
    {
        keywords: ['recommend', 'suggestion', 'suggest', 'which perfume', 'best perfume', 'help me choose'],
        response: "I'd love to help! Here are some questions to narrow it down:\n\n• Are you looking for something for **daily wear** or **special occasions**?\n• Do you prefer **fresh & citrus**, **woody & oud**, or **floral & sweet** scents?\n• What's your budget range?\n\nOr you can take our **Fragrance Finder Quiz** at /fragrance-finder for a personalized recommendation!",
    },
    {
        keywords: ['oud', 'woody', 'masculine', 'strong', 'intense'],
        response: "For oud & woody lovers, I recommend:\n\n• **Oud Heritage** — Rich Cambodian oud with sandalwood. Beast mode longevity (10+ hrs).\n• **Dark Musk Intense** — Smoky, leathery, mysterious. Perfect for evenings.\n• **Noir Absolute** — Deep amber, black pepper, and vetiver.\n\nAll are unisex and project beautifully in Indian climate.",
    },
    {
        keywords: ['floral', 'sweet', 'feminine', 'rose', 'jasmine'],
        response: "For floral & sweet preferences:\n\n• **Garden Botanicals** — Fresh roses, jasmine, and green notes. Elegant for daily wear.\n• **Silk & Jasmine** — Indian jasmine with vanilla base. Romantic.\n• **Rose Oud** — Bulgarian rose absolute meets oud. Luxurious blend.\n\nThese all last 6-8+ hours even in humidity!",
    },
    {
        keywords: ['fresh', 'citrus', 'light', 'office', 'daily', 'summer'],
        response: "For fresh everyday scents:\n\n• **Ocean Breeze** — Aquatic, citrus, clean musk. Perfect office scent.\n• **Citrus Sun** — Italian bergamot with white tea. Energizing.\n• **Green Vetiver** — Crisp, earthy, sophisticated.\n\nGreat for Indian summers — fresh without being overpowering.",
    },
    {
        keywords: ['price', 'cost', 'how much', 'expensive', 'cheap', 'budget', 'affordable'],
        response: "Our fragrances start at just **₹499** and go up to ₹2,499 for premium collections.\n\n• **₹499 – ₹699** — Body mists & lighter EDTs\n• **₹799 – ₹1,299** — Eau de Parfum (most popular)\n• **₹1,499 – ₹2,499** — Premium & limited editions\n\nAll prices include free shipping above ₹799. COD available pan-India!",
    },
    {
        keywords: ['shipping', 'delivery', 'how long', 'when will', 'track'],
        response: "Shipping details:\n\n• **Metro cities** — 2-3 business days\n• **Tier-2 cities** — 3-5 business days\n• **Rest of India** — 5-7 business days\n• **Free shipping** on orders above ₹799\n• **COD available** across India\n\nYou'll receive tracking details via email & SMS once shipped.",
    },
    {
        keywords: ['return', 'refund', 'exchange', 'damaged', 'wrong'],
        response: "Our return policy:\n\n• **7-day easy returns** for damaged/wrong products\n• **Full refund** or exchange — your choice\n• Contact us at support@swissgardenperfumes.com with your order ID and photos\n\nNote: Used/opened perfumes cannot be returned for hygiene reasons, but we'll always make it right if there's a quality issue.",
    },
    {
        keywords: ['long', 'last', 'longevity', 'hours', 'projection', 'sillage'],
        response: "Our fragrances are formulated for Indian climate:\n\n• **Eau de Parfum** — 8-10+ hours (our bestsellers)\n• **Attars** — 10-12+ hours (oil-based, intimate)\n• **Body Mists** — 3-4 hours (light, refreshing)\n\nTips for longer lasting: Apply on pulse points (wrists, neck, behind ears) and moisturized skin. Avoid rubbing!",
    },
    {
        keywords: ['sample', 'try', 'test', 'discovery', 'set'],
        response: "Yes! We offer a **Discovery Sample Set** for ₹299 — includes 4 bestselling fragrances in 2ml vials.\n\nPerfect way to find your signature scent before committing to a full bottle. The ₹299 is redeemable on your first full-size purchase!",
    },
    {
        keywords: ['gift', 'combo', 'deal', 'offer', 'discount'],
        response: "Great gifting options:\n\n• **Combo Sets** — 2 perfumes at 20% off\n• **Gift Sets** — Beautifully packaged with ribbon\n• **Gift Cards** — Let them choose!\n\n💡 First-time customers get **10% OFF** — subscribe to our newsletter on the homepage!",
    },
    {
        keywords: ['ingredient', 'natural', 'chemical', 'safe', 'quality'],
        response: "Our quality promise:\n\n• High-concentration fragrance oils (20-30%)\n• Sourced from Grasse (France), Bulgaria, India, Cambodia\n• **No harmful chemicals** — dermatologically tested\n• **Cruelty-free** — never tested on animals\n• **Alcohol-based** EDPs with premium denatured alcohol\n\nEvery batch is quality-tested before bottling.",
    },
    {
        keywords: ['quiz', 'finder', 'personality', 'which one'],
        response: "Take our **Fragrance Finder Quiz**! It's a fun 2-minute quiz that matches your personality to the perfect scent.\n\n👉 Visit: /fragrance-finder\n\nAnswer 7 quick questions about your mood, style, and preferences — and get personalized recommendations!",
    },
    {
        keywords: ['contact', 'support', 'help', 'phone', 'email', 'whatsapp'],
        response: "Reach us anytime:\n\n• **Email**: support@swissgardenperfumes.com\n• **WhatsApp**: +91 98XXX XXXXX\n• **Instagram**: @swissgardenperfumes.official_\n\nWe typically respond within 2-4 hours during business hours (10 AM – 7 PM IST).",
    },
    {
        keywords: ['thank', 'thanks', 'bye', 'goodbye'],
        response: "You're welcome! Happy to help anytime. Enjoy your fragrance journey with SwissGarden! 🌿✨\n\nRemember — scent is the invisible signature of the soul.",
    },
];

const defaultResponse = "I'm not sure about that, but I'd love to help! Here's what I can assist with:\n\n• **Fragrance recommendations** based on your preferences\n• **Product info** — notes, longevity, pricing\n• **Shipping & returns** information\n• **Gifting suggestions**\n\nOr try asking about a specific scent type like 'oud', 'floral', or 'fresh'!";

const getAIResponse = (message) => {
    const lower = message.toLowerCase();
    for (const item of knowledgeBase) {
        if (item.keywords.some((kw) => lower.includes(kw))) {
            return item.response;
        }
    }
    return defaultResponse;
};

const AIChatbox = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, role: 'bot', text: "Hi! I'm the SwissGarden AI assistant. Ask me anything about our fragrances, shipping, or let me help you find your perfect scent! ✨" },
    ]);
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, typing]);

    const handleSend = () => {
        const text = input.trim();
        if (!text) return;

        const userMsg = { id: Date.now(), role: 'user', text };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setTyping(true);

        // Simulate AI thinking delay
        const delay = 800 + Math.random() * 1200;
        setTimeout(() => {
            const response = getAIResponse(text);
            setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'bot', text: response }]);
            setTyping(false);
        }, delay);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            {/* Toggle Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        className="chatbox-toggle"
                        onClick={() => setIsOpen(true)}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title="Chat with AI Assistant"
                    >
                        <FiMessageCircle size={24} />
                        <span className="chatbox-toggle-pulse" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="chatbox-window"
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                    >
                        {/* Header */}
                        <div className="chatbox-header">
                            <div className="chatbox-header-info">
                                <span className="chatbox-avatar">{BOT_AVATAR}</span>
                                <div>
                                    <span className="chatbox-name">{BOT_NAME}</span>
                                    <span className="chatbox-status">Online • Powered by Claude</span>
                                </div>
                            </div>
                            <button className="chatbox-close" onClick={() => setIsOpen(false)}>
                                <FiX size={18} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="chatbox-messages">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`chatbox-msg chatbox-msg-${msg.role}`}>
                                    {msg.role === 'bot' && <span className="chatbox-msg-avatar">{BOT_AVATAR}</span>}
                                    {msg.role === 'user' && <span className="chatbox-msg-avatar chatbox-msg-avatar-user"><FiUser size={12} /></span>}
                                    <div className="chatbox-msg-bubble" dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }} />
                                </div>
                            ))}
                            {typing && (
                                <div className="chatbox-msg chatbox-msg-bot">
                                    <span className="chatbox-msg-avatar">{BOT_AVATAR}</span>
                                    <div className="chatbox-msg-bubble chatbox-typing">
                                        <span /><span /><span />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="chatbox-input-area">
                            <input
                                type="text"
                                className="chatbox-input"
                                placeholder="Ask about fragrances..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            <button className="chatbox-send" onClick={handleSend} disabled={!input.trim()}>
                                <FiSend size={16} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

// Simple markdown-like formatting
function formatMessage(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br />')
        .replace(/• /g, '&bull; ');
}

export default AIChatbox;
