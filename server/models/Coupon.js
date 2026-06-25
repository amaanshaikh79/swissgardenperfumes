import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: [true, 'Coupon code is required'],
            unique: true,
            uppercase: true,
            trim: true,
        },
        description: {
            type: String,
            default: '',
        },
        discountType: {
            type: String,
            enum: ['percentage', 'flat'],
            required: true,
        },
        discountValue: {
            type: Number,
            required: [true, 'Discount value is required'],
            min: 0,
        },
        // Maximum discount cap for percentage coupons (e.g., 20% off up to ₹300)
        maxDiscount: {
            type: Number,
            default: null,
        },
        // Minimum order amount required to use this coupon
        minOrderAmount: {
            type: Number,
            default: 0,
        },
        // Usage limits
        usageLimit: {
            type: Number,
            default: null, // null = unlimited
        },
        usedCount: {
            type: Number,
            default: 0,
        },
        // Per-user usage limit
        perUserLimit: {
            type: Number,
            default: 1,
        },
        // Track which users have used this coupon
        usedBy: [
            {
                user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                usedAt: { type: Date, default: Date.now },
            },
        ],
        // Validity dates
        startDate: {
            type: Date,
            default: Date.now,
        },
        expiryDate: {
            type: Date,
            required: [true, 'Expiry date is required'],
        },
        // Active toggle
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

// Index for fast lookups (the `code` field is already indexed via unique:true)
couponSchema.index({ expiryDate: 1 });

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
