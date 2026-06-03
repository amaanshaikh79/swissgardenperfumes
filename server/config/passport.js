import passport from 'passport';
import User from '../models/User.js';
import GoogleStrategy from 'passport-google-oauth20';
import FacebookStrategy from 'passport-facebook';

// Google Strategy (only if credentials are configured)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    // Check if user exists
                    let user = await User.findOne({ email: profile.emails[0].value });
                    
                    if (user) {
                        // Update user's Google profile info
                        if (!user.googleId) {
                            user.googleId = profile.id;
                            await user.save();
                        }
                        return done(null, user);
                    }

                    // Create new user
                    user = await User.create({
                        firstName: profile.name.givenName,
                        lastName: profile.name.familyName,
                        email: profile.emails[0].value,
                        googleId: profile.id,
                        avatar: profile.photos[0]?.value,
                    });

                    return done(null, user);
                } catch (error) {
                    return done(error, null);
                }
            }
        )
    );
}

// Facebook Strategy (only if credentials are configured)
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(
        new FacebookStrategy(
            {
                clientID: process.env.FACEBOOK_APP_ID,
                clientSecret: process.env.FACEBOOK_APP_SECRET,
                callbackURL: process.env.FACEBOOK_CALLBACK_URL || '/api/auth/facebook/callback',
                profileFields: ['id', 'displayName', 'emails', 'photos'],
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    // Check if user exists
                    let user = await User.findOne({ email: profile.emails?.[0]?.value });
                    
                    if (user) {
                        // Update user's Facebook profile info
                        if (!user.facebookId) {
                            user.facebookId = profile.id;
                            await user.save();
                        }
                        return done(null, user);
                    }

                    // Create new user
                    const nameParts = profile.displayName.split(' ');
                    user = await User.create({
                        firstName: nameParts[0] || 'User',
                        lastName: nameParts.slice(1).join(' ') || 'Name',
                        email: profile.emails?.[0]?.value || `fb_${profile.id}@facebook.com`,
                        facebookId: profile.id,
                        avatar: profile.photos?.[0]?.value,
                    });

                    return done(null, user);
                } catch (error) {
                    return done(error, null);
                }
            }
        )
    );
}

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export default passport;
