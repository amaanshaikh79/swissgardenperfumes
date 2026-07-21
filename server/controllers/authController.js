import User from '../models/User.js';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';
import { welcomeEmail, emailVerificationEmail } from '../utils/emailTemplates.js';
import { getClientUrl } from '../config/urls.js';

/**
 * Helper: Send token response with cookie
 */
const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();

    const cookieOptions = {
        expires: new Date(Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRE) * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    };

    // Remove password from output
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.otp;
    delete userObj.otpExpire;

    res.status(statusCode).cookie('token', token, cookieOptions).json({
        success: true,
        token,
        user: userObj,
    });
};

/**
 * Helper: Generate a cryptographically secure 6-digit OTP
 */
const generateOTP = () => {
    // crypto.randomInt is available since Node.js 14.10 and is
    // cryptographically secure (unlike Math.random)
    return crypto.randomInt(100000, 1000000).toString();
};

const hashCode = (code) => crypto.createHash('sha256').update(String(code)).digest('hex');

const VERIFICATION_TTL_MS = 15 * 60 * 1000; // code valid 15 minutes
const VERIFICATION_MAX_ATTEMPTS = 5;        // wrong-code tries before requiring a resend
const VERIFICATION_RESEND_COOLDOWN_MS = 60 * 1000;

/**
 * Helper: issue (or re-issue) an email verification code for a user and email
 * it. Stores only the SHA256 hash. Returns { sent, code } — `code` is exposed
 * to callers ONLY so development responses can surface it; never log or return
 * it in production.
 */
const issueEmailVerification = async (user) => {
    const code = generateOTP();
    user.emailVerificationCode = hashCode(code);
    user.emailVerificationExpire = new Date(Date.now() + VERIFICATION_TTL_MS);
    user.emailVerificationAttempts = 0;
    user.emailVerificationLastSentAt = new Date();
    await user.save({ validateBeforeSave: false });

    const sent = await sendEmail({
        email: user.email,
        subject: `${code} is your SwissGarden verification code`,
        html: emailVerificationEmail(user, code),
    });
    return { sent: Boolean(sent), code };
};

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
    try {
        const { firstName, lastName, email, password, phone } = req.body;

        console.log('📝 Registration attempt:', { email, firstName, lastName });

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('⚠️ User already exists:', email);
            return res.status(400).json({
                success: false,
                message: 'An account with this email already exists',
            });
        }

        // Check if phone already exists (if provided)
        if (phone) {
            const phoneUser = await User.findOne({ phone });
            if (phoneUser) {
                console.log('⚠️ Phone already exists:', phone);
                return res.status(400).json({
                    success: false,
                    message: 'An account with this phone number already exists',
                });
            }
        }

        const user = await User.create({
            firstName,
            lastName,
            email,
            password,
            phone: phone || undefined,
            isEmailVerified: false,
        });

        console.log('✅ User created successfully (pending verification):', user.email);

        // Email a 6-digit activation code; the account cannot log in until the
        // code is confirmed via POST /api/auth/verify-email. The welcome email
        // is sent after successful verification instead of here.
        const { sent, code } = await issueEmailVerification(user);

        res.status(201).json({
            success: true,
            requiresVerification: true,
            email: user.email,
            message: sent
                ? 'Account created. We have emailed you a 6-digit verification code.'
                : 'Account created, but the verification email could not be sent. Use "Resend code" in a moment.',
            // Development convenience only — mirrors forgotPassword's dev resetUrl.
            ...(process.env.NODE_ENV === 'development' && { devCode: code }),
        });
    } catch (error) {
        console.error('❌ Registration error:', error.message);
        next(error);
    }
};

/**
 * @desc    Login user with email/password
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        // Block sign-in until the email is verified. Strict === false so legacy
        // accounts (field absent) and OAuth accounts are unaffected.
        if (user.isEmailVerified === false) {
            return res.status(403).json({
                success: false,
                requiresVerification: true,
                email: user.email,
                message: 'Please verify your email to activate your account. Check your inbox for the 6-digit code.',
            });
        }

        sendTokenResponse(user, 200, res);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Verify email with the 6-digit code and activate the account
 * @route   POST /api/auth/verify-email
 * @access  Public
 */
export const verifyEmail = async (req, res, next) => {
    try {
        const { email, code } = req.body;
        if (!email || !code) {
            return res.status(400).json({ success: false, message: 'Email and verification code are required' });
        }

        const user = await User.findOne({ email }).select(
            '+emailVerificationCode +emailVerificationExpire +emailVerificationAttempts'
        );
        if (!user) {
            return res.status(404).json({ success: false, message: 'No account found with this email' });
        }

        if (user.isEmailVerified !== false) {
            // Already verified (or legacy account) — sign them in.
            return sendTokenResponse(user, 200, res);
        }

        if ((user.emailVerificationAttempts || 0) >= VERIFICATION_MAX_ATTEMPTS) {
            return res.status(429).json({
                success: false,
                message: 'Too many incorrect attempts. Please request a new code.',
            });
        }

        if (
            !user.emailVerificationCode ||
            !user.emailVerificationExpire ||
            Date.now() > new Date(user.emailVerificationExpire).getTime()
        ) {
            return res.status(400).json({
                success: false,
                message: 'This code has expired. Please request a new one.',
            });
        }

        if (hashCode(code) !== user.emailVerificationCode) {
            user.emailVerificationAttempts = (user.emailVerificationAttempts || 0) + 1;
            await user.save({ validateBeforeSave: false });
            const remaining = VERIFICATION_MAX_ATTEMPTS - user.emailVerificationAttempts;
            return res.status(400).json({
                success: false,
                message:
                    remaining > 0
                        ? `Incorrect code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
                        : 'Too many incorrect attempts. Please request a new code.',
            });
        }

        user.isEmailVerified = true;
        user.emailVerificationCode = undefined;
        user.emailVerificationExpire = undefined;
        user.emailVerificationAttempts = 0;
        await user.save({ validateBeforeSave: false });

        // Welcome email now that the address is confirmed — fire-and-forget.
        sendEmail({
            email: user.email,
            subject: 'Welcome to SwissGarden Perfumes ✨',
            html: welcomeEmail(user),
        }).catch((err) => console.error('Welcome email failed:', err.message));

        // Activate the session immediately.
        sendTokenResponse(user, 200, res);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Resend the email verification code (60s cooldown)
 * @route   POST /api/auth/resend-verification
 * @access  Public
 */
export const resendVerification = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const user = await User.findOne({ email }).select('+emailVerificationLastSentAt');
        if (!user) {
            return res.status(404).json({ success: false, message: 'No account found with this email' });
        }
        if (user.isEmailVerified !== false) {
            return res.status(400).json({ success: false, message: 'This account is already verified. Please sign in.' });
        }

        const lastSent = user.emailVerificationLastSentAt
            ? new Date(user.emailVerificationLastSentAt).getTime()
            : 0;
        const waitMs = VERIFICATION_RESEND_COOLDOWN_MS - (Date.now() - lastSent);
        if (waitMs > 0) {
            return res.status(429).json({
                success: false,
                message: `Please wait ${Math.ceil(waitMs / 1000)}s before requesting another code.`,
            });
        }

        const { sent, code } = await issueEmailVerification(user);
        if (!sent) {
            return res.status(500).json({
                success: false,
                message: 'Verification email could not be sent. Please try again later.',
            });
        }

        res.status(200).json({
            success: true,
            message: 'A new verification code has been sent to your email.',
            ...(process.env.NODE_ENV === 'development' && { devCode: code }),
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Send OTP to phone number for login
 * @route   POST /api/auth/send-otp
 * @access  Public
 */
export const sendOTP = async (req, res, next) => {
    try {
        const { phone, countryCode } = req.body;

        if (!phone || !countryCode) {
            return res.status(400).json({
                success: false,
                message: 'Phone number and country code are required',
            });
        }

        // Find user by phone
        const user = await User.findOne({ phone, countryCode }).select('+otp +otpExpire');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No account found with this phone number. Please register first.',
            });
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Save OTP to user
        user.otp = otp;
        user.otpExpire = otpExpire;
        await user.save({ validateBeforeSave: false });

        // Log OTP to console in development (for testing)
        if (process.env.NODE_ENV !== 'production') {
            console.log(`\n📱 OTP for ${countryCode} ${phone}: ${otp}\n`);
        }

        // Try to send OTP via email as backup
        try {
            await sendEmail({
                email: user.email,
                subject: 'Your SwissGarden Perfumes Login OTP',
                html: `
                    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; text-align: center; padding: 40px 20px; background: #0a0a0a; color: #fff;">
                        <h1 style="font-family: serif; color: #D4AF37; margin-bottom: 10px;">SwissGarden Perfumes</h1>
                        <p style="color: #999; font-size: 14px; margin-bottom: 30px;">Your One-Time Password</p>
                        <div style="background: #1a1a1a; border: 1px solid #333; border-radius: 12px; padding: 30px; max-width: 400px; margin: 0 auto;">
                            <p style="font-size: 14px; color: #999; margin-bottom: 15px;">Your OTP code is:</p>
                            <div style="font-size: 36px; font-weight: bold; letter-spacing: 12px; color: #D4AF37; padding: 20px; background: #111; border-radius: 8px; border: 1px solid #D4AF37;">
                                ${otp}
                            </div>
                            <p style="font-size: 12px; color: #666; margin-top: 20px;">This code expires in 10 minutes. Do not share it with anyone.</p>
                        </div>
                        <p style="font-size: 11px; color: #444; margin-top: 30px;">If you didn't request this OTP, please ignore this email.</p>
                    </div>
                `,
            });
        } catch (emailErr) {
            console.log('Email send failed (OTP still valid):', emailErr.message);
        }

        res.status(200).json({
            success: true,
            message: `OTP sent to ${countryCode} ${phone.slice(0, 3)}****${phone.slice(-2)}`,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Verify OTP and login
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
export const verifyOTP = async (req, res, next) => {
    try {
        const { phone, countryCode, otp } = req.body;

        if (!phone || !countryCode || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Phone number, country code, and OTP are required',
            });
        }

        const user = await User.findOne({ phone, countryCode }).select('+otp +otpExpire');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No account found with this phone number',
            });
        }

        // Check if OTP exists and hasn't expired
        if (!user.otp || !user.otpExpire) {
            return res.status(400).json({
                success: false,
                message: 'No OTP was requested. Please request a new OTP.',
            });
        }

        if (new Date() > user.otpExpire) {
            user.otp = undefined;
            user.otpExpire = undefined;
            await user.save({ validateBeforeSave: false });
            return res.status(400).json({
                success: false,
                message: 'OTP has expired. Please request a new one.',
            });
        }

        if (user.otp !== otp) {
            return res.status(401).json({
                success: false,
                message: 'Invalid OTP. Please try again.',
            });
        }

        // OTP verified — clear it
        user.otp = undefined;
        user.otpExpire = undefined;
        await user.save({ validateBeforeSave: false });

        sendTokenResponse(user, 200, res);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Logout user / clear cookie
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 5 * 1000),
        httpOnly: true,
    });
    res.status(200).json({ success: true, message: 'Logged out successfully' });
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).populate('wishlist');
        res.status(200).json({ success: true, user });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
    try {
        const allowedFields = ['firstName', 'lastName', 'phone', 'countryCode', 'avatar', 'addresses'];
        const updates = {};
        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) updates[field] = req.body[field];
        });

        const user = await User.findByIdAndUpdate(req.user.id, updates, {
            new: true,
            runValidators: true,
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update password
 * @route   PUT /api/auth/password
 * @access  Private
 */
export const updatePassword = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('+password');

        // OAuth-only accounts have no password — prevent bcrypt crash
        if (!user.password) {
            return res.status(400).json({
                success: false,
                message: 'This account uses social login. Password cannot be changed here.',
            });
        }

        if (!(await user.matchPassword(req.body.currentPassword))) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect',
            });
        }

        user.password = req.body.newPassword;
        await user.save();

        sendTokenResponse(user, 200, res);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Toggle wishlist item
 * @route   PUT /api/auth/wishlist/:productId
 * @access  Private
 */
export const toggleWishlist = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        const productId = req.params.productId;
        const index = user.wishlist.indexOf(productId);

        if (index > -1) {
            user.wishlist.splice(index, 1);
        } else {
            user.wishlist.push(productId);
        }

        await user.save();
        const updatedUser = await User.findById(req.user.id).populate('wishlist');

        res.status(200).json({
            success: true,
            wishlist: updatedUser.wishlist,
            message: index > -1 ? 'Removed from wishlist' : 'Added to wishlist',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Forgot password - Send reset token via email
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an email address',
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No account found with this email address',
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Save hashed token and expiry to user
        user.resetPasswordToken = resetTokenHash;
        user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
        await user.save({ validateBeforeSave: false });

        // Create reset URL (getClientUrl handles CLIENT_URL/RENDER_EXTERNAL_URL/localhost)
        const resetUrl = `${getClientUrl()}/reset-password/${resetToken}`;

        // Check if SMTP is configured
        const smtpConfigured = process.env.SMTP_HOST && process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD && 
                              process.env.SMTP_EMAIL !== 'your-email@gmail.com';

        if (!smtpConfigured) {
            // Development mode - log the reset link to console
            console.log('\n' + '═'.repeat(70));
            console.log('🔐 PASSWORD RESET REQUEST (DEVELOPMENT MODE)');
            console.log('═'.repeat(70));
            console.log(`📧 Email: ${user.email}`);
            console.log(`👤 User: ${user.firstName} ${user.lastName}`);
            console.log(`🔗 Reset Link: ${resetUrl}`);
            console.log(`⏰ Expires: ${new Date(user.resetPasswordExpire).toLocaleString()}`);
            console.log('═'.repeat(70) + '\n');

            return res.status(200).json({
                success: true,
                message: 'Password reset link generated. Check server console for the link (SMTP not configured).',
                // In development, include the link in response
                ...(process.env.NODE_ENV === 'development' && { resetUrl }),
            });
        }

        try {
            // sendEmail never throws — it returns null when every provider
            // failed. Treat that as a hard failure so the user is not told
            // "check your inbox" for an email that was never sent.
            const sent = await sendEmail({
                email: user.email,
                subject: 'SwissGarden Perfumes - Password Reset Request',
                html: `
                    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; text-align: center; padding: 40px 20px; background: #0a0a0a; color: #fff;">
                        <h1 style="font-family: serif; color: #D4AF37; margin-bottom: 10px;">SwissGarden Perfumes</h1>
                        <p style="color: #999; font-size: 14px; margin-bottom: 30px;">Password Reset Request</p>
                        <div style="background: #1a1a1a; border: 1px solid #333; border-radius: 12px; padding: 30px; max-width: 500px; margin: 0 auto; text-align: left;">
                            <p style="font-size: 14px; color: #ccc; margin-bottom: 20px;">Hello ${user.firstName},</p>
                            <p style="font-size: 14px; color: #ccc; margin-bottom: 20px;">
                                You requested to reset your password. Click the button below to create a new password:
                            </p>
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${resetUrl}" style="display: inline-block; background: #D4AF37; color: #000; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; letter-spacing: 1px; text-transform: uppercase;">
                                    Reset Password
                                </a>
                            </div>
                            <p style="font-size: 12px; color: #666; margin-bottom: 15px;">
                                Or copy and paste this link in your browser:
                            </p>
                            <p style="font-size: 12px; color: #D4AF37; word-break: break-all; background: #111; padding: 12px; border-radius: 6px; border: 1px solid #333;">
                                ${resetUrl}
                            </p>
                            <p style="font-size: 12px; color: #666; margin-top: 20px;">
                                This link will expire in 30 minutes.
                            </p>
                        </div>
                        <p style="font-size: 11px; color: #444; margin-top: 30px;">
                            If you didn't request a password reset, please ignore this email and your password will remain unchanged.
                        </p>
                    </div>
                `,
            });

            if (!sent) {
                throw new Error('All email providers failed');
            }

            res.status(200).json({
                success: true,
                message: 'Password reset email sent. Please check your inbox.',
            });
        } catch (emailError) {
            console.error('Email send error:', emailError);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });

            return res.status(500).json({
                success: false,
                message: 'Email could not be sent. Please try again later or contact support@swissgardenperfumes.com.',
            });
        }
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Reset password using token
 * @route   PUT /api/auth/reset-password/:token
 * @access  Public
 */
export const resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a new password',
            });
        }

        // Hash the token from URL to compare with stored hash
        const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

        // Find user with valid token
        const user = await User.findOne({
            resetPasswordToken: resetTokenHash,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token',
            });
        }

        // Set new password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        // Send confirmation email
        try {
            await sendEmail({
                email: user.email,
                subject: 'SwissGarden Perfumes - Password Changed Successfully',
                html: `
                    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; text-align: center; padding: 40px 20px; background: #0a0a0a; color: #fff;">
                        <h1 style="font-family: serif; color: #D4AF37; margin-bottom: 10px;">SwissGarden Perfumes</h1>
                        <p style="color: #999; font-size: 14px; margin-bottom: 30px;">Password Changed</p>
                        <div style="background: #1a1a1a; border: 1px solid #333; border-radius: 12px; padding: 30px; max-width: 500px; margin: 0 auto; text-align: left;">
                            <p style="font-size: 14px; color: #ccc; margin-bottom: 20px;">Hello ${user.firstName},</p>
                            <p style="font-size: 14px; color: #ccc; margin-bottom: 20px;">
                                Your password has been successfully changed. You can now log in with your new password.
                            </p>
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${getClientUrl()}/login" style="display: inline-block; background: #D4AF37; color: #000; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; letter-spacing: 1px; text-transform: uppercase;">
                                    Sign In
                                </a>
                            </div>
                        </div>
                        <p style="font-size: 11px; color: #444; margin-top: 30px;">
                            If you didn't make this change, please contact us immediately.
                        </p>
                    </div>
                `,
            });
        } catch (emailError) {
            console.log('Confirmation email failed (password was still reset):', emailError.message);
        }

        // Auto-login by sending token
        sendTokenResponse(user, 200, res);
    } catch (error) {
        next(error);
    }
};
