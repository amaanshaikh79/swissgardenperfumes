import express from 'express';
import passport from '../config/passport.js';

const router = express.Router();

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/login?error=google_failed' }),
    (req, res) => {
        // Generate JWT token
        const token = req.user.getSignedJwtToken();
        
        // Redirect to frontend with token
        res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}&provider=google`);
    }
);

// Facebook OAuth
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

router.get(
    '/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/login?error=facebook_failed' }),
    (req, res) => {
        // Generate JWT token
        const token = req.user.getSignedJwtToken();
        
        // Redirect to frontend with token
        res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}&provider=facebook`);
    }
);

export default router;
