import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import sendEmail, { orderConfirmationEmail } from '../utils/sendEmail.js';
import { verifyRazorpaySignature } from '../utils/verifyRazorpay.js';
import Razorpay from 'razorpay';

// Lazy Razorpay client for server-side payment reconciliation in updateOrderToPaid.
let _rzp = null;
const getRzp = () => {
    const keyId = process.env.RAZORPAY_KEY_ID?.trim();
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
    if (!keyId || !keySecret) return null;
    if (!_rzp) {
        _rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });
    }
    return _rzp;
};

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Private
 */
export const createOrder = async (req, res, next) => {
    // Track stock decrements so they can be rolled back on any later failure.
    const decremented = [];
    let couponReserved = null;

    const rollbackStock = async () => {
        await Promise.all(
            decremented.map((d) =>
                Product.updateOne(
                    { _id: d.product },
                    { $inc: { stock: d.quantity, sold: -d.quantity } }
                )
            )
        );
    };

    try {
        const { orderItems, shippingAddress, paymentMethod, couponCode } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ success: false, message: 'No order items' });
        }

        // Verify products and calculate prices
        let itemsPrice = 0;
        const verifiedItems = [];

        for (const item of orderItems) {
            const product = await Product.findById(item.product);
            if (!product) {
                await rollbackStock();
                return res.status(404).json({
                    success: false,
                    message: `Product not found: ${item.product}`,
                });
            }

            // Atomic, conditional stock decrement: guards stock and decrements in
            // one operation, eliminating the read-modify-save oversell race.
            const updated = await Product.findOneAndUpdate(
                { _id: item.product, stock: { $gte: item.quantity } },
                { $inc: { stock: -item.quantity, sold: item.quantity } },
                { new: true }
            );

            if (!updated) {
                await rollbackStock();
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}`,
                });
            }

            decremented.push({ product: item.product, quantity: item.quantity });

            verifiedItems.push({
                product: product._id,
                name: product.name,
                image: product.images[0]?.url || '',
                price: product.price,
                quantity: item.quantity,
                size: product.size,
            });

            itemsPrice += product.price * item.quantity;
        }

        // GST included in MRP — no separate tax for Indian e-commerce
        const taxPrice = 0;

        // Free shipping above ₹799, else ₹49 flat
        const shippingPrice = itemsPrice >= 799 ? 0 : 49;

        // COD extra charge ₹50
        const codCharge = paymentMethod === 'cod' ? 50 : 0;

        // Combo discount: 3+ items = ₹400, 2 items = ₹200
        const totalQty = verifiedItems.reduce((sum, item) => sum + item.quantity, 0);
        const comboDiscount = totalQty >= 3 ? 400 : totalQty >= 2 ? 200 : 0;

        // Coupon discount
        let couponDiscount = 0;
        let appliedCoupon = null;

        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode.toUpperCase().trim(), isActive: true });
            if (coupon && new Date() <= new Date(coupon.expiryDate)) {
                const userUsage = coupon.usedBy.filter((e) => e.user.toString() === req.user.id).length;
                const globalExhausted =
                    coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit;
                if (
                    !globalExhausted &&
                    userUsage < coupon.perUserLimit &&
                    itemsPrice >= coupon.minOrderAmount
                ) {
                    if (coupon.discountType === 'percentage') {
                        couponDiscount = Math.round((itemsPrice * coupon.discountValue) / 100);
                        if (coupon.maxDiscount && couponDiscount > coupon.maxDiscount) {
                            couponDiscount = coupon.maxDiscount;
                        }
                    } else {
                        couponDiscount = coupon.discountValue;
                    }
                    if (couponDiscount > itemsPrice) couponDiscount = itemsPrice;
                    appliedCoupon = coupon;
                }
            }
        }

        // Atomically reserve the coupon BEFORE creating the order so concurrent
        // orders cannot exceed either the global usageLimit OR the per-user limit.
        // Both bounds are enforced inside a single conditional findOneAndUpdate so
        // there is no read-then-write race (the earlier checks above are only a
        // fast UX gate; this is the authoritative enforcement).
        if (appliedCoupon) {
            const userObjectId = new mongoose.Types.ObjectId(req.user.id);
            const perUserLimit =
                appliedCoupon.perUserLimit == null
                    ? Number.MAX_SAFE_INTEGER
                    : appliedCoupon.perUserLimit;

            couponReserved = await Coupon.findOneAndUpdate(
                {
                    _id: appliedCoupon._id,
                    isActive: true,
                    $expr: {
                        $and: [
                            // Global limit not yet reached (null usageLimit = unlimited)
                            {
                                $or: [
                                    { $eq: ['$usageLimit', null] },
                                    { $lt: ['$usedCount', '$usageLimit'] },
                                ],
                            },
                            // This user has not yet hit their per-user limit
                            {
                                $lt: [
                                    {
                                        $size: {
                                            $filter: {
                                                input: '$usedBy',
                                                as: 'u',
                                                cond: { $eq: ['$$u.user', userObjectId] },
                                            },
                                        },
                                    },
                                    perUserLimit,
                                ],
                            },
                        ],
                    },
                },
                { $inc: { usedCount: 1 }, $push: { usedBy: { user: req.user.id, usedAt: new Date() } } },
                { new: true }
            );

            if (!couponReserved) {
                await rollbackStock();
                return res.status(400).json({
                    success: false,
                    message: 'Coupon usage limit has been reached',
                });
            }
        }

        const totalPrice = Math.max(0, itemsPrice + shippingPrice + codCharge - comboDiscount - couponDiscount);

        let order;
        try {
            order = await Order.create({
                user: req.user.id,
                orderItems: verifiedItems,
                shippingAddress,
                paymentMethod,
                itemsPrice,
                taxPrice,
                shippingPrice,
                codCharge,
                comboDiscount,
                couponCode: appliedCoupon ? appliedCoupon.code : null,
                couponDiscount,
                totalPrice,
            });
        } catch (createErr) {
            // Compensate: release the reserved coupon usage and restore stock so a
            // failed insert never leaves orphaned reservations.
            if (couponReserved) {
                await Coupon.updateOne(
                    { _id: couponReserved._id },
                    { $inc: { usedCount: -1 }, $pull: { usedBy: { user: req.user.id } } }
                );
            }
            await rollbackStock();
            throw createErr;
        }

        // Fetch populated order for email
        const populatedOrder = await Order.findById(order._id).populate('user', 'firstName email');

        // Send confirmation email (non-blocking)
        sendEmail({
            email: req.user.email,
            subject: `Order Confirmed - ${order.orderNumber} | SwissGarden Perfumes`,
            html: orderConfirmationEmail(populatedOrder, req.user),
        }).catch((err) => console.error('Email send failed:', err));

        res.status(201).json({ success: true, order: populatedOrder });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get logged in user's orders
 * @route   GET /api/orders/my
 * @access  Private
 */
export const getMyOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: orders.length, orders });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
export const getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'firstName lastName email');

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Users can only see their own orders, admins can see all
        if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        res.status(200).json({ success: true, order });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all orders (Admin)
 * @route   GET /api/orders
 * @access  Admin
 */
export const getAllOrders = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        let query = {};
        if (req.query.status) query.orderStatus = req.query.status;

        const total = await Order.countDocuments(query);
        const orders = await Order.find(query)
            .populate('user', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Calculate paid revenue DB-side (no full-collection materialization).
        const revenueAgg = await Order.aggregate([
            { $match: { isPaid: true } },
            { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } },
        ]);
        const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

        res.status(200).json({
            success: true,
            count: orders.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            totalRevenue,
            orders,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update order status (Admin)
 * @route   PUT /api/orders/:id/status
 * @access  Admin
 */
export const updateOrderStatus = async (req, res, next) => {
    try {
        const allowed = ['Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
        if (!allowed.includes(req.body.status)) {
            return res.status(400).json({ success: false, message: 'Invalid or missing order status' });
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        order.orderStatus = req.body.status;

        if (req.body.status === 'Delivered') {
            order.deliveredAt = Date.now();
        }

        if (req.body.trackingNumber) {
            order.trackingNumber = req.body.trackingNumber;
        }

        await order.save();

        res.status(200).json({ success: true, order });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update order to paid
 * @route   PUT /api/orders/:id/pay
 * @access  Private
 */
export const updateOrderToPaid = async (req, res, next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'Missing payment verification fields',
            });
        }

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Ownership: only the order owner may mark it paid.
        if (order.user.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Idempotency: never re-flip an already-paid order (prevents replays).
        if (order.isPaid) {
            return res.status(400).json({ success: false, message: 'Order is already paid' });
        }

        const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
        if (!keySecret) {
            return res.status(503).json({ success: false, message: 'Payment gateway is not configured' });
        }

        // Re-run the HMAC-SHA256 signature verification server-side — never trust the
        // client to assert payment success.
        const signatureValid = verifyRazorpaySignature({
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            keySecret,
        });

        if (!signatureValid) {
            return res.status(400).json({
                success: false,
                message: 'Payment verification failed — invalid signature',
            });
        }

        // Confirm the captured amount matches the server-computed order total.
        const rzp = getRzp();
        if (rzp) {
            try {
                const payment = await rzp.payments.fetch(razorpay_payment_id);
                const expectedPaise = Math.round(order.totalPrice * 100);
                if (Number(payment.amount) !== expectedPaise) {
                    // The customer has ALREADY been charged but the captured amount
                    // does not match the server-computed total. Never fail silently —
                    // log a reconciliation alert so the funds can be refunded/matched
                    // manually instead of being stranded.
                    console.error(
                        `🚨 PAYMENT RECONCILIATION REQUIRED — captured amount mismatch. ` +
                        `orderId=${order._id} orderNumber=${order.orderNumber} ` +
                        `razorpay_payment_id=${razorpay_payment_id} ` +
                        `capturedPaise=${payment.amount} expectedPaise=${expectedPaise} ` +
                        `user=${req.user?.email}`
                    );
                    return res.status(400).json({
                        success: false,
                        message:
                            'Payment amount does not match the order total. Your payment has been flagged for review and our team will reconcile it.',
                    });
                }
            } catch (fetchErr) {
                // Verification could not complete. If a payment id exists, it may be
                // captured — log it so it is never silently lost.
                console.error(
                    `🚨 PAYMENT RECONCILIATION — gateway verification failed. ` +
                    `orderId=${order._id} razorpay_payment_id=${razorpay_payment_id} ` +
                    `error=${fetchErr.message}`
                );
                return res.status(502).json({
                    success: false,
                    message: 'Could not verify payment with the gateway',
                });
            }
        }

        order.isPaid = true;
        order.paidAt = Date.now();
        // Store only the verified, gateway-issued identifiers for reconciliation.
        order.paymentResult = {
            id: razorpay_payment_id,
            status: 'captured',
            updateTime: new Date().toISOString(),
            emailAddress: req.user.email,
        };
        order.orderStatus = 'Confirmed';

        await order.save();

        res.status(200).json({ success: true, order });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Cancel order
 * @route   PUT /api/orders/:id/cancel
 * @access  Private
 */
export const cancelOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to cancel this order' });
        }

        // Only allow cancellation if order is not yet shipped
        if (['Shipped', 'Out for Delivery', 'Delivered'].includes(order.orderStatus)) {
            return res.status(400).json({ success: false, message: 'Order cannot be cancelled after it has been shipped' });
        }

        order.orderStatus = 'Cancelled';
        await order.save();

        res.status(200).json({ success: true, message: 'Order cancelled successfully', order });
    } catch (error) {
        next(error);
    }
};
