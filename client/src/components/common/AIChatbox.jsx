import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageCircle, FiX, FiSend, FiUser } from 'react-icons/fi';
import useModalA11y from '../../hooks/useModalA11y';
import { chatAPI } from '../../services/api';
import './AIChatbox.css';

const BOT_NAME = 'SwissGarden AI';
const BOT_AVATAR = '✨';

const INITIAL_MESSAGE = {
    id: 1,
    role: 'bot',
    text: "Hi! I'm the SwissGarden AI assistant. Ask me anything about our fragrances, your orders, shipping, or let me help you find your perfect scent!",
};

const ERROR_REPLY =
    "Sorry, I couldn't connect right now. Please try again or email support@swissgardenperfumes.com.";

const AIChatbox = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([INITIAL_MESSAGE]);
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const closeRef = useRef(null);
    const closeChat = useCallback(() => setIsOpen(false), []);
    const panelRef = useModalA11y(isOpen, closeChat, closeRef);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, typing]);

    const handleSend = async () => {
        const text = input.trim();
        if (!text || typing) return;

        const userMsg = { id: Date.now(), role: 'user', text };
        const nextMessages = [...messages, userMsg];
        setMessages(nextMessages);
        setInput('');
        setTyping(true);

        // Build history in OpenRouter format (skip the initial bot greeting)
        const history = nextMessages
            .filter((m) => m.id !== INITIAL_MESSAGE.id)
            .map((m) => ({
                role: m.role === 'user' ? 'user' : 'assistant',
                content: m.text,
            }));

        try {
            const res = await chatAPI.sendMessage(history);
            const reply = res.data?.reply || ERROR_REPLY;
            setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'bot', text: reply }]);
        } catch (err) {
            // Use the server's reply if it returned one (e.g. rate-limit message),
            // otherwise fall back to the generic error string.
            const serverReply = err?.response?.data?.reply;
            setMessages((prev) => [
                ...prev,
                { id: Date.now() + 1, role: 'bot', text: serverReply || ERROR_REPLY },
            ]);
        } finally {
            setTyping(false);
        }
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
                        ref={panelRef}
                        className="chatbox-window"
                        role="dialog"
                        aria-modal="true"
                        aria-label="AI assistant chat"
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
                                    <span className="chatbox-status">Online • Powered by AI</span>
                                </div>
                            </div>
                            <button ref={closeRef} className="chatbox-close" onClick={() => setIsOpen(false)} aria-label="Close chat">
                                <FiX size={18} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="chatbox-messages" role="log" aria-live="polite" aria-atomic="false" aria-relevant="additions">
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
                                aria-label="Type your message"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={typing}
                            />
                            <button className="chatbox-send" onClick={handleSend} disabled={!input.trim() || typing} aria-label="Send message">
                                <FiSend size={16} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

// Escape HTML then apply light markdown formatting
function formatMessage(text) {
    const esc = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    return esc
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br />')
        .replace(/• /g, '&bull; ');
}

export default AIChatbox;
