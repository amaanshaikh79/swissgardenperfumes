import Coupon from '../models/Coupon.js';

/**
 * @desc    Validate & apply coupon code
 * @route   POST /api/coupons/apply
 * @access  Private
 */
export const applyCoupon = async (req, res, next) => {
    try {
        const { code, orderAmount } = req.body;

        if (!code) {
            return res.status(400).json({ success: false, message: 'Please enter a coupon code' });
        }

        const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });

        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Invalid coupon code' });
        }

        // Check if active
        if (!coupon.isActive) {
            return res.status(400).json({ success: false, message: 'This coupon is no longer active' });
        }

        // Check expiry
        if (new Date() > new Date(coupon.expiryDate)) {
            return res.status(400).json({ success: false, message: 'This coupon has expired' });
        }

        // Check start date
        if (new Date() < new Date(coupon.startDate)) {
            return res.status(400).json({ success: false, message: 'This coupon is not yet active' });
        }

        // Check global usage limit
        if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({ success: false, message: 'This coupon has reached its usage limit' });
        }

        // Check per-user limit
        const userUsageCount = coupon.usedBy.filter(
            (entry) => entry.user.toString() === req.user.id
        ).length;

        if (userUsageCount >= coupon.perUserLimit) {
            return res.status(400).json({ success: false, message: 'You have already used this coupon' });
        }

        // Check minimum order amount
        if (orderAmount < coupon.minOrderAmount) {
            return res.status(400).json({
                success: false,
                message: `Minimum order of ₹${coupon.minOrderAmount} required for this coupon`,
            });
        }

        // Calculate discount
        let discount = 0;
        if (coupon.discountType === 'percentage') {
            discount = Math.round((orderAmount * coupon.discountValue) / 100);
            // Apply max discount cap
            if (coupon.maxDiscount && discount > coupon.maxDiscount) {
                discount = coupon.maxDiscount;
            }
        } else {
            // Flat discount
            discount = coupon.discountValue;
        }

        // Discount cannot exceed order amount
        if (discount > orderAmount) {
            discount = orderAmount;
        }

        res.status(200).json({
            success: true,
            coupon: {
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                maxDiscount: coupon.maxDiscount,
                description: coupon.description,
            },
            discount,
            message: `Coupon applied! You save ₹${discount}`,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create new coupon (Admin)
 * @route   POST /api/coupons
 * @access  Admin
 */
export const createCoupon = async (req, res, next) => {
    try {
        const { code, description, discountType, discountValue, maxDiscount, minOrderAmount, usageLimit, perUserLimit, startDate, expiryDate } = req.body;

        // Check if coupon code already exists
        const existing = await Coupon.findOne({ code: code.toUpperCase().trim() });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Coupon code already exists' });
        }

        const coupon = await Coupon.create({
            code: code.toUpperCase().trim(),
            description,
            discountType,
            discountValue,
            maxDiscount: maxDiscount || null,
            minOrderAmount: minOrderAmount || 0,
            usageLimit: usageLimit || null,
            perUserLimit: perUserLimit || 1,
            startDate: startDate || Date.now(),
            expiryDate,
        });

        res.status(201).json({ success: true, coupon });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all coupons (Admin)
 * @route   GET /api/coupons
 * @access  Admin
 */
export const getAllCoupons = async (req, res, next) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, coupons });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update coupon (Admin)
 * @route   PUT /api/coupons/:id
 * @access  Admin
 */
export const updateCoupon = async (req, res, next) => {
    try {
        // Whitelist allowed fields — usedCount and usedBy are managed by the
        // order system and must not be directly overridable via the admin API.
        const ALLOWED_FIELDS = [
            'code', 'description', 'discountType', 'discountValue', 'maxDiscount',
            'minOrderAmount', 'usageLimit', 'perUserLimit', 'startDate', 'expiryDate', 'isActive',
        ];
        const updateData = {};
        ALLOWED_FIELDS.forEach((field) => {
            if (req.body[field] !== undefined) updateData[field] = req.body[field];
        });

        const coupon = await Coupon.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true,
        });

        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Coupon not found' });
        }

        res.status(200).json({ success: true, coupon });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete coupon (Admin)
 * @route   DELETE /api/coupons/:id
 * @access  Admin
 */
export const deleteCoupon = async (req, res, next) => {
    try {
        const coupon = await Coupon.findByIdAndDelete(req.params.id);

        if (!coupon) {
            return res.status(404).json({ success: false, message: 'Coupon not found' });
        }

        res.status(200).json({ success: true, message: 'Coupon deleted' });
    } catch (error) {
        next(error);
    }
};
