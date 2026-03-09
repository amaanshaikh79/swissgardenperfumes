import Order from '../models/Order.js';
import Product from '../models/Product.js';
import sendEmail, { orderConfirmationEmail } from '../utils/sendEmail.js';

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Private
 */
export const createOrder = async (req, res, next) => {
    try {
        const { orderItems, shippingAddress, paymentMethod } = req.body;

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

        const taxPrice = Math.round(itemsPrice * 0.08 * 100) / 100; // 8% tax
        const shippingPrice = itemsPrice > 200 ? 0 : 15; // Free shipping over $200
        const totalPrice = Math.round((itemsPrice + taxPrice + shippingPrice) * 100) / 100;

        const order = await Order.create({
            user: req.user.id,
            orderItems: verifiedItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
        });

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
