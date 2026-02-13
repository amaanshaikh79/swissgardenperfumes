import User from '../models/User.js';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';

/**
 * Helper: Send token response with cookie
 */
const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken();

    const cookieOptions = {
        expires: new Date(Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRE) * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
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
 * Helper: Generate a 6-digit OTP
 */
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res, next) => {
    try {
        const { firstName, lastName, email, password, phone, countryCode } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'An account with this email already exists',
            });
        }

        // Check if phone already exists (if provided)
        if (phone) {
            const phoneUser = await User.findOne({ phone, countryCode: countryCode || '+91' });
            if (phoneUser) {
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
            countryCode: countryCode || '+91',
        });

        sendTokenResponse(user, 201, res);
    } catch (error) {
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

        sendTokenResponse(user, 200, res);
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
                subject: 'Your GoldBerg Perfumes Login OTP',
                html: `
                    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; text-align: center; padding: 40px 20px; background: #0a0a0a; color: #fff;">
                        <h1 style="font-family: serif; color: #D4AF37; margin-bottom: 10px;">GoldBerg Perfumes</h1>
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
