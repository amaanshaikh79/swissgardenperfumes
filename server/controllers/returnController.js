import Return from '../models/Return.js';
import Order from '../models/Order.js';
import asyncHandler from 'express-async-handler';
import sendEmail from '../utils/sendEmail.js';
import {
    returnRequestedEmail,
    returnAdminAlertEmail,
    returnStatusUpdateEmail,
} from '../utils/emailTemplates.js';

// @desc    Get all returns (admin)
// @route   GET /api/returns
// @access  Private/Admin
export const getAllReturns = asyncHandler(async (req, res) => {
    const returns = await Return.find({})
        .populate('user', 'firstName lastName email')
        .populate('order', 'orderNumber totalPrice')
        .sort({ createdAt: -1 });
    res.status(200).json({
        success: true,
        count: returns.length,
        returns,
    });
});

// @desc    Get user returns
// @route   GET /api/returns/my
// @access  Private
export const getMyReturns = asyncHandler(async (req, res) => {
    const returns = await Return.find({ user: req.user._id })
        .populate('order', 'orderNumber totalPrice')
        .sort({ createdAt: -1 });
    res.status(200).json({
        success: true,
        returns,
    });
});

// @desc    Get single return
// @route   GET /api/returns/:id
// @access  Private
export const getReturn = asyncHandler(async (req, res) => {
    const returnRequest = await Return.findById(req.params.id)
        .populate('user', 'firstName lastName email')
        .populate('order', 'orderNumber totalPrice orderItems')
        .populate('returnItems.product', 'name image');
    
    if (!returnRequest) {
        res.status(404);
        throw new Error('Return request not found');
    }

    // Check if user owns the return or is admin
    if (returnRequest.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to access this return');
    }
    
    res.status(200).json({
        success: true,
        return: returnRequest,
    });
});

// @desc    Create return request
// @route   POST /api/returns
// @access  Private
export const createReturn = asyncHandler(async (req, res) => {
    const { orderId, returnItems, returnReason, description, refundMethod, refundAmount } = req.body;

    // Check if order exists and belongs to user
    const order = await Order.findById(orderId);
    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    if (order.user.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to return this order');
    }

    // Check if order is eligible for return (must be delivered)
    if (order.orderStatus !== 'Delivered') {
        res.status(400);
        throw new Error('Order must be delivered to request a return');
    }

    // Check if return already exists for this order
    const existingReturn = await Return.findOne({ order: orderId, status: { $ne: 'cancelled' } });
    if (existingReturn) {
        res.status(400);
        throw new Error('Return request already exists for this order');
    }

    const returnRequest = await Return.create({
        order: orderId,
        user: req.user._id,
        returnItems,
        returnReason,
        description,
        refundMethod,
        refundAmount,
    });

    // Confirmation to customer + alert to store inbox — fire-and-forget
    sendEmail({
        email: req.user.email,
        subject: `Return Request Received - ${order.orderNumber} | SwissGarden Perfumes`,
        html: returnRequestedEmail(returnRequest, req.user, order),
    }).catch((err) => console.error('Return confirmation email failed:', err.message));

    sendEmail({
        email: process.env.ADMIN_EMAIL || process.env.SMTP_EMAIL,
        subject: `📥 New Return Request - ${order.orderNumber} | SwissGarden Perfumes`,
        html: returnAdminAlertEmail(returnRequest, order),
    }).catch((err) => console.error('Return admin alert failed:', err.message));

    res.status(201).json({
        success: true,
        return: returnRequest,
    });
});

// @desc    Update return status (admin)
// @route   PUT /api/returns/:id/status
// @access  Private/Admin
export const updateReturnStatus = asyncHandler(async (req, res) => {
    const { status, adminNotes, trackingNumber } = req.body;

    const returnRequest = await Return.findById(req.params.id);
    
    if (!returnRequest) {
        res.status(404);
        throw new Error('Return request not found');
    }

    returnRequest.status = status;
    if (adminNotes) returnRequest.adminNotes = adminNotes;
    if (trackingNumber) returnRequest.trackingNumber = trackingNumber;

    if (status === 'approved') {
        returnRequest.approvedAt = new Date();
    } else if (status === 'completed') {
        returnRequest.completedAt = new Date();
    } else if (status === 'rejected') {
        returnRequest.rejectedAt = new Date();
    }

    await returnRequest.save();

    // Notify the customer on decisive transitions — fire-and-forget
    if (['approved', 'rejected', 'completed'].includes(status)) {
        await returnRequest.populate([
            { path: 'user', select: 'firstName lastName email' },
            { path: 'order', select: 'orderNumber' },
        ]);
        if (returnRequest.user?.email) {
            const subjectByStatus = {
                approved: `Return Approved - ${returnRequest.order?.orderNumber} | SwissGarden Perfumes`,
                rejected: `Return Request Update - ${returnRequest.order?.orderNumber} | SwissGarden Perfumes`,
                completed: `Refund Processed - ${returnRequest.order?.orderNumber} | SwissGarden Perfumes`,
            };
            sendEmail({
                email: returnRequest.user.email,
                subject: subjectByStatus[status],
                html: returnStatusUpdateEmail(returnRequest, returnRequest.user, returnRequest.order),
            }).catch((err) => console.error('Return status email failed:', err.message));
        }
    }

    res.status(200).json({
        success: true,
        return: returnRequest,
    });
});

// @desc    Cancel return request
// @route   DELETE /api/returns/:id
// @access  Private
export const cancelReturn = asyncHandler(async (req, res) => {
    const returnRequest = await Return.findById(req.params.id);
    
    if (!returnRequest) {
        res.status(404);
        throw new Error('Return request not found');
    }

    if (returnRequest.user.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to cancel this return');
    }

    if (returnRequest.status !== 'pending') {
        res.status(400);
        throw new Error('Only pending returns can be cancelled');
    }

    returnRequest.status = 'cancelled';
    await returnRequest.save();

    res.status(200).json({
        success: true,
        message: 'Return request cancelled successfully',
    });
});
