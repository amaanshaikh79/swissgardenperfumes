import Subscriber from '../models/Subscriber.js';
import sendEmail from '../utils/sendEmail.js';
import { newsletterWelcomeEmail } from '../utils/emailTemplates.js';

/**
 * @desc    Subscribe to the newsletter (exit-intent popup / home form)
 * @route   POST /api/newsletter/subscribe
 * @access  Public (rate-limited)
 *
 * Always responds success — whether the address is new or already subscribed —
 * to prevent email enumeration and keep the client UX non-blocking. The
 * welcome-discount email is sent only on FIRST subscription so repeat submits
 * can never be used to spam an inbox.
 */
export const subscribe = async (req, res, next) => {
    try {
        const { email, source } = req.body;

        let isNew = false;
        try {
            await Subscriber.create({ email, source: source || 'other' });
            isNew = true;
        } catch (err) {
            // 11000 = duplicate key → already subscribed; anything else is a real error
            if (err.code !== 11000) throw err;
        }

        if (isNew) {
            sendEmail({
                email,
                subject: 'Your 10% Welcome Code Inside 🎁 | SwissGarden Perfumes',
                html: newsletterWelcomeEmail(),
            }).catch((err) => console.error('Newsletter welcome email failed:', err.message));
        }

        res.status(isNew ? 201 : 200).json({
            success: true,
            message: 'You are in! Check your inbox for your welcome code.',
        });
    } catch (error) {
        next(error);
    }
};
