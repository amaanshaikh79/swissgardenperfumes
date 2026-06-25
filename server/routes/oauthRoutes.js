import express from 'express';
import crypto from 'crypto';
import passport from '../config/passport.js';
import { getClientUrl } from '../config/urls.js';

const router = express.Router();

const CLIENT_URL = () => getClientUrl();

// ─── One-time OAuth exchange codes ─────────────────────────────────
// The raw 30-day JWT must never appear in a redirect URL (URLs leak via
// history, referrer headers, and server logs). Instead we hand the client a
// short-lived, single-use random code and keep the JWT server-side; the client
// trades the code for the token over a POST. Single-instance in-memory store.
const exchangeCodes = new Map();
const CODE_TTL_MS = 60 * 1000;

const issueExchangeCode = (token) => {
    // Opportunistically evict expired codes so the map cannot grow unbounded.
    const now = Date.now();
    for (const [key, entry] of exchangeCodes) {
        if (entry.expiresAt <= now) exchangeCodes.delete(key);
    }
    const code = crypto.randomBytes(32).toString('hex');
    exchangeCodes.set(code, { token, expiresAt: now + CODE_TTL_MS });
    return code;
};

// Guard: check if OAuth credentials are configured
const requireGoogleConfig = (req, res, next) => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        return res.status(503).json({
            success: false,
            message: 'Google OAuth is not configured. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your environment variables.',
        });
    }
    next();
};

const requireFacebookConfig = (req, res, next) => {
    if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET) {
        return res.status(503).json({
            success: false,
            message: 'Facebook OAuth is not configured. Please add FACEBOOK_APP_ID and FACEBOOK_APP_SECRET to your environment variables.',
        });
    }
    next();
};

// ─── Google OAuth ──────────────────────────────────────────────────
router.get('/google', requireGoogleConfig, passport.authenticate('google', { scope: ['profile', 'email'], session: false, prompt: 'select_account' }));

router.get(
    '/google/callback',
    requireGoogleConfig,
    (req, res, next) => {
        passport.authenticate('google', { session: false }, (err, user, info) => {
            // Handle passport/strategy errors
            if (err) {
                console.error('❌ Google OAuth error:', err.message);
                return res.redirect(`${CLIENT_URL()}/auth/callback?error=google_failed&message=${encodeURIComponent(err.message)}`);
            }

            // Handle authentication failure (user denied access, etc.)
            if (!user) {
                console.warn('⚠️ Google OAuth: No user returned');
                return res.redirect(`${CLIENT_URL()}/auth/callback?error=google_failed`);
            }

            // Success — issue a one-time exchange code (NOT the raw JWT) in the URL
            try {
                const token = user.getSignedJwtToken();
                const code = issueExchangeCode(token);
                console.log('✅ Google OAuth success:', user.email);
                return res.redirect(`${CLIENT_URL()}/auth/callback?code=${code}&provider=google`);
            } catch (tokenErr) {
                console.error('❌ JWT generation error:', tokenErr.message);
                return res.redirect(`${CLIENT_URL()}/auth/callback?error=token_failed`);
            }
        })(req, res, next);
    }
);

// ─── Facebook OAuth ────────────────────────────────────────────────
router.get('/facebook', requireFacebookConfig, passport.authenticate('facebook', { scope: ['email'], session: false }));

router.get(
    '/facebook/callback',
    requireFacebookConfig,
    (req, res, next) => {
        passport.authenticate('facebook', { session: false }, (err, user, info) => {
            if (err) {
                console.error('❌ Facebook OAuth error:', err.message);
                return res.redirect(`${CLIENT_URL()}/auth/callback?error=facebook_failed&message=${encodeURIComponent(err.message)}`);
            }

            if (!user) {
                console.warn('⚠️ Facebook OAuth: No user returned');
                return res.redirect(`${CLIENT_URL()}/auth/callback?error=facebook_failed`);
            }

            try {
                const token = user.getSignedJwtToken();
                const code = issueExchangeCode(token);
                console.log('✅ Facebook OAuth success:', user.email);
                return res.redirect(`${CLIENT_URL()}/auth/callback?code=${code}&provider=facebook`);
            } catch (tokenErr) {
                console.error('❌ JWT generation error:', tokenErr.message);
                return res.redirect(`${CLIENT_URL()}/auth/callback?error=token_failed`);
            }
        })(req, res, next);
    }
);

// ─── Exchange a one-time code for the JWT ──────────────────────────
// POST /api/auth/oauth/exchange  { code }  ->  { success, token }
router.post('/oauth/exchange', (req, res) => {
    const { code } = req.body || {};
    if (!code || typeof code !== 'string') {
        return res.status(400).json({ success: false, message: 'Missing exchange code' });
    }

    const entry = exchangeCodes.get(code);
    // One-time use: delete on first lookup regardless of validity.
    exchangeCodes.delete(code);

    if (!entry || entry.expiresAt <= Date.now()) {
        return res.status(400).json({ success: false, message: 'Invalid or expired code' });
    }

    return res.status(200).json({ success: true, token: entry.token });
});

export default router;
