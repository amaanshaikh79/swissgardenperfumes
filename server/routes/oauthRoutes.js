import express from 'express';
import passport from '../config/passport.js';

const router = express.Router();

const CLIENT_URL = () => process.env.CLIENT_URL || 'http://localhost:5173';

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

            // Success — generate JWT and redirect to client
            try {
                const token = user.getSignedJwtToken();
                console.log('✅ Google OAuth success:', user.email);
                return res.redirect(`${CLIENT_URL()}/auth/callback?token=${token}&provider=google`);
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
                console.log('✅ Facebook OAuth success:', user.email);
                return res.redirect(`${CLIENT_URL()}/auth/callback?token=${token}&provider=facebook`);
            } catch (tokenErr) {
                console.error('❌ JWT generation error:', tokenErr.message);
                return res.redirect(`${CLIENT_URL()}/auth/callback?error=token_failed`);
            }
        })(req, res, next);
    }
);

export default router;
