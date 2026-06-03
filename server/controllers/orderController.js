import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import sendEmail, { orderConfirmationEmail } from '../utils/sendEmail.js';

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Private
 */
export const createOrder = async (req, res, next) => {
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
                return res.status(404).json({
                    success: false,
                    message: `Product not found: ${item.product}`,
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}`,
                });
            }

            verifiedItems.push({
                product: product._id,
                name: product.name,
                image: product.images[0]?.url || '',
                price: product.price,
                quantity: item.quantity,
                size: product.size,
            });

            itemsPrice += product.price * item.quantity;

            // Update stock and sold count
            product.stock -= item.quantity;
            product.sold += item.quantity;
            await product.save();
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
                if (userUsage < coupon.perUserLimit && itemsPrice >= coupon.minOrderAmount) {
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

        const totalPrice = Math.max(0, itemsPrice + shippingPrice + codCharge - comboDiscount - couponDiscount);

        const order = await Order.create({
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

        // Mark coupon as used
        if (appliedCoupon) {
            appliedCoupon.usedCount += 1;
            appliedCoupon.usedBy.push({ user: req.user.id });
            await appliedCoupon.save();
        }

        // Fetch populated order for email
        const populatedOrder = await Order.findById(order._id).populate('user', 'firstName email');

        // Send confirmation email (non-blocking)
        sendEmail({
            email: req.user.email,
            subject: `Order Confirmed - ${order.orderNumber} | swissgarden Perfumes`,
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

        // Calculate totals
        const allOrders = await Order.find({});
        const totalRevenue = allOrders.reduce((acc, order) => acc + (order.isPaid ? order.totalPrice : 0), 0);

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
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = {
            id: req.body.id,
            status: req.body.status,
            updateTime: req.body.updateTime,
            emailAddress: req.body.emailAddress,
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
