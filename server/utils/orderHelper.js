import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';

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
