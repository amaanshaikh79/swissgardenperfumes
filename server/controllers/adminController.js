import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Contact from '../models/Contact.js';

/**
 * @desc    Get admin dashboard stats
 * @route   GET /api/admin/stats
 * @access  Admin
 */
export const getDashboardStats = async (req, res, next) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments({ isActive: true });
        const totalOrders = await Order.countDocuments();
        const totalContacts = await Contact.countDocuments({ status: 'unread' });

        // Revenue
        const paidOrders = await Order.find({ isPaid: true });
        const totalRevenue = paidOrders.reduce((acc, order) => acc + order.totalPrice, 0);

        // Recent orders
        const recentOrders = await Order.find()
            .populate('user', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .limit(5);

        // Orders by status
        const ordersByStatus = await Order.aggregate([
            { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
        ]);

        // Monthly revenue
        const monthlyRevenue = await Order.aggregate([
            { $match: { isPaid: true } },
            {
                $group: {
                    _id: {
                        month: { $month: '$createdAt' },
                        year: { $year: '$createdAt' },
                    },
                    revenue: { $sum: '$totalPrice' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 12 },
        ]);

        // Top selling products
        const topProducts = await Product.find({ isActive: true })
            .sort({ sold: -1 })
            .limit(5)
            .select('name price sold images');

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalProducts,
                totalOrders,
                totalRevenue,
                unreadContacts: totalContacts,
                recentOrders,
                ordersByStatus,
                monthlyRevenue,
                topProducts,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all users (Admin)
 * @route   GET /api/admin/users
 * @access  Admin
 */
export const getUsers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const total = await User.countDocuments();
        const users = await User.find().sort({ createdAt: -1 }).skip(skip).limit(limit);

        res.status(200).json({
            success: true,
            count: users.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            users,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update user role (Admin)
 * @route   PUT /api/admin/users/:id/role
 * @access  Admin
 */
export const updateUserRole = async (req, res, next) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role: req.body.role },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete user (Admin)
 * @route   DELETE /api/admin/users/:id
 * @access  Admin
 */
export const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, message: 'User deleted' });
    } catch (error) {
        next(error);
    }
};
