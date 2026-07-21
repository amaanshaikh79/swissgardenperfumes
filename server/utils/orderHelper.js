import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import sendEmail from './sendEmail.js';
import { adminNewOrderEmail } from './emailTemplates.js';

/** Default store-owner inboxes for new-order alerts (overridable via ORDER_NOTIFY_EMAILS). */
const DEFAULT_ORDER_NOTIFY_EMAILS = [
    'Goldenbuckprfm@gmail.com',
    'shaikhamaan2304@gmail.com',
];

export const getOrderNotifyEmails = () => {
    const fromEnv = (process.env.ORDER_NOTIFY_EMAILS || '')
        .split(',')
        .map((e) => e.trim())
        .filter(Boolean);
    return fromEnv.length > 0 ? fromEnv : DEFAULT_ORDER_NOTIFY_EMAILS;
};

/**
 * Fire-and-forget alert to store owners when an order is confirmed
 * (COD at create time, prepaid after successful payment).
 */
export const notifyAdminsOfNewOrder = (order, user) => {
    if (!order?.orderNumber) return;
    const html = adminNewOrderEmail(order, user || {});
    const subject = `New Order ${order.orderNumber} — ${order.paymentMethod === 'cod' ? 'COD' : 'Paid'} | SwissGarden`;
    for (const email of getOrderNotifyEmails()) {
        sendEmail({ email, subject, html }).catch((err) =>
            console.error(`Admin order notify failed (${email}):`, err.message)
        );
    }
};

/**
 * Restores product stock and reverses coupon usage when an order is cancelled.
 *
 * This function is idempotent in the sense that stock and coupon state are only
 * modified when the order's status *transitions* to 'Cancelled' — callers are
 * responsible for ensuring they call this only once per cancellation.
 *
 * @param {Object} order - A Mongoose Order document (must have orderItems and user populated)
 */
export const restoreStockAndCoupon = async (order) => {
    // 1. Restore product stock and roll back sold count
    if (order.orderItems && order.orderItems.length > 0) {
        await Promise.all(
            order.orderItems.map((item) =>
                Product.updateOne(
                    { _id: item.product },
                    { $inc: { stock: item.quantity, sold: -item.quantity } }
                )
            )
        );
    }

    // 2. Reverse coupon usage (if a coupon was applied to this order)
    if (order.couponCode) {
        await Coupon.updateOne(
            { code: order.couponCode },
            {
                $inc: { usedCount: -1 },
                $pull: { usedBy: { user: order.user } },
            }
        );
    }
};
