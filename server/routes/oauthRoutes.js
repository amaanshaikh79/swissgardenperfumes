import express from 'express';
import passport from '../config/passport.js';

const router = express.Router();

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

// Google OAuth
router.get('/google', requireGoogleConfig, passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

router.get(
    '/google/callback',
    requireGoogleConfig,
    passport.authenticate('google', { failureRedirect: '/login?error=google_failed', session: false }),
    (req, res) => {
        const token = req.user.getSignedJwtToken();
        res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}&provider=google`);
    }
);

// Facebook OAuth
router.get('/facebook', requireFacebookConfig, passport.authenticate('facebook', { scope: ['email'], session: false }));

router.get(
    '/facebook/callback',
    requireFacebookConfig,
    passport.authenticate('facebook', { failureRedirect: '/login?error=facebook_failed', session: false }),
    (req, res) => {
        const token = req.user.getSignedJwtToken();
        res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}&provider=facebook`);
    }
);

export default router;

