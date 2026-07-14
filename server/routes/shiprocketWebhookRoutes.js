import express from 'express';
import Order from '../models/Order.js';
import { restoreStockAndCoupon } from '../utils/orderHelper.js';
import sendEmail from '../utils/sendEmail.js';
import {
    orderShippedEmail,
    orderOutForDeliveryEmail,
    orderDeliveredEmail,
    rtoAdminAlertEmail,
} from '../utils/emailTemplates.js';

/**
 * Populate order.user (and product slugs when needed) then send a customer
 * email — fire-and-forget; webhook processing never fails on email errors.
 */
const emailCustomer = async (order, buildSubject, buildHtml, { withProductSlugs = false } = {}) => {
    try {
        const paths = [{ path: 'user', select: 'firstName lastName email' }];
        if (withProductSlugs) paths.push({ path: 'orderItems.product', select: 'slug name' });
        await order.populate(paths);
        if (!order.user?.email) return;
        await sendEmail({
            email: order.user.email,
            subject: buildSubject(order),
            html: buildHtml(order, order.user),
        });
    } catch (err) {
        console.error('Webhook email failed:', err.message);
    }
};

const router = express.Router();

/**
 * Lightweight token-based authentication for Shiprocket webhooks.
 * Set SHIPROCKET_WEBHOOK_TOKEN in your environment and configure the
 * same value as a custom header or query parameter in the Shiprocket
 * webhook settings panel.
 */
const verifyWebhookToken = (req, res, next) => {
    const webhookToken = process.env.SHIPROCKET_WEBHOOK_TOKEN;
    // If no token is configured, skip verification (not recommended for production)
    if (!webhookToken) {
        return next();
    }
    const provided =
        req.headers['x-shiprocket-token'] ||
        req.headers['x-api-token'] ||
        req.headers['x-api-key'] || // header name used by Shiprocket's webhook panel
        req.query.token;
    if (!provided || provided !== webhookToken) {
        console.warn('[webhook] Unauthorized Shiprocket webhook attempt');
        return res.status(401).json({ success: false, message: 'Unauthorized webhook' });
    }
    next();
};

/**
 * @desc    Shiprocket Webhook Handler
 * @route   POST /api/shiprocket/webhook
 * @access  Public (verified via Shiprocket signature - optional)
 * 
 * Shiprocket sends webhooks for various events like:
 * - order_shipped
 * - order_delivered
 * - pickup_scheduled
 * - rto_initiated
 * - order_cancelled
 */
router.post('/webhook', verifyWebhookToken, async (req, res) => {
    try {
        const event = req.body;

        console.log('📦 Shiprocket Webhook received:', {
            event: event.event || event.type,
            order_id: event.order_id,
            shipment_id: event.shipment_id,
        });

        // Get event type
        const eventType = event.event || event.type;

        // Find order by Shiprocket order ID or shipment ID.
        // Only include conditions whose value is present — Mongoose strips
        // undefined query values, which would turn that $or branch into {}
        // and match an arbitrary order.
        const lookup = [];
        if (event.order_id != null) lookup.push({ 'shiprocket.shiprocketOrderId': event.order_id });
        if (event.shipment_id != null) lookup.push({ 'shiprocket.shiprocketShipmentId': event.shipment_id });
        const order = lookup.length > 0 ? await Order.findOne({ $or: lookup }) : null;

        if (!order) {
            console.warn(`⚠️ Order not found for Shiprocket webhook: order_id=${event.order_id}`);
            return res.status(200).json({ success: true, message: 'Order not found' });
        }

        // Pre-update status — used to dedup emails when Shiprocket retries a webhook
        const prevShippingStatus = order.shiprocket?.shippingStatus;

        // Handle different event types
        switch (eventType) {
            case 'pickup_scheduled':
            case 'PICKUP_SCHEDULED': {
                console.log(`✅ Pickup scheduled for order: ${order.orderNumber}`);
                
                order.shiprocket.shippingStatus = 'pickup_scheduled';
                order.shiprocket.pickupScheduledDate = new Date(event.pickup_scheduled_date || event.scheduled_date);
                
                if (event.awb_code && !order.shiprocket.awbCode) {
                    order.shiprocket.awbCode = event.awb_code;
                    order.trackingNumber = event.awb_code;
                }
                
                if (event.courier_name && !order.shiprocket.courierName) {
                    order.shiprocket.courierName = event.courier_name;
                }

                order.shiprocket.statusHistory.push({
                    status: 'pickup_scheduled',
                    timestamp: new Date(),
                    location: event.pickup_location || '',
                    remarks: 'Pickup scheduled',
                });

                await order.save();
                break;
            }

            case 'order_shipped':
            case 'ORDER_SHIPPED':
            case 'shipped': {
                console.log(`✅ Order shipped: ${order.orderNumber}`);
                
                order.shiprocket.shippingStatus = 'in_transit';
                order.orderStatus = 'Shipped';
                
                if (event.awb_code) {
                    order.shiprocket.awbCode = event.awb_code;
                    order.trackingNumber = event.awb_code;
                }
                
                if (event.courier_name) {
                    order.shiprocket.courierName = event.courier_name;
                }
                
                if (event.tracking_url) {
                    order.shiprocket.trackingUrl = event.tracking_url;
                }
                
                if (event.estimated_delivery_date || event.edd) {
                    order.shiprocket.estimatedDeliveryDate = new Date(event.estimated_delivery_date || event.edd);
                }

                order.shiprocket.statusHistory.push({
                    status: 'shipped',
                    timestamp: new Date(),
                    location: event.current_location || '',
                    remarks: event.status_message || 'Order shipped',
                });

                await order.save();

                // Shipped email — dedup on webhook retries via prior status
                if (prevShippingStatus !== 'in_transit') {
                    emailCustomer(
                        order,
                        (o) => `Your Order Has Shipped - ${o.orderNumber} | SwissGarden Perfumes`,
                        (o, u) => orderShippedEmail(o, u)
                    );
                }
                break;
            }

            case 'out_for_delivery':
            case 'OUT_FOR_DELIVERY': {
                console.log(`✅ Order out for delivery: ${order.orderNumber}`);
                
                order.shiprocket.shippingStatus = 'out_for_delivery';

                order.shiprocket.statusHistory.push({
                    status: 'out_for_delivery',
                    timestamp: new Date(),
                    location: event.current_location || '',
                    remarks: 'Out for delivery',
                });

                await order.save();

                // Out-for-delivery email — dedup on webhook retries
                if (prevShippingStatus !== 'out_for_delivery') {
                    emailCustomer(
                        order,
                        (o) => `Out for Delivery - ${o.orderNumber} | SwissGarden Perfumes`,
                        (o, u) => orderOutForDeliveryEmail(o, u)
                    );
                }
                break;
            }

            case 'order_delivered':
            case 'ORDER_DELIVERED':
            case 'delivered':
            case 'DELIVERED': {
                console.log(`✅ Order delivered: ${order.orderNumber}`);
                
                order.shiprocket.shippingStatus = 'delivered';
                order.orderStatus = 'Delivered';
                order.deliveredAt = new Date(event.delivered_date || Date.now());

                order.shiprocket.statusHistory.push({
                    status: 'delivered',
                    timestamp: new Date(event.delivered_date || Date.now()),
                    location: event.delivered_location || event.current_location || '',
                    remarks: event.status_message || 'Order delivered successfully',
                });

                await order.save();

                // Thank-you + review-request email — dedup on webhook retries
                if (prevShippingStatus !== 'delivered') {
                    emailCustomer(
                        order,
                        (o) => `Order Delivered - ${o.orderNumber} | SwissGarden Perfumes`,
                        (o, u) => orderDeliveredEmail(o, u),
                        { withProductSlugs: true }
                    );
                }
                break;
            }

            case 'rto_initiated':
            case 'RTO_INITIATED':
            case 'rto': {
                console.log(`⚠️ RTO initiated for order: ${order.orderNumber}`);
                
                order.shiprocket.shippingStatus = 'rto';

                order.shiprocket.statusHistory.push({
                    status: 'rto',
                    timestamp: new Date(),
                    location: event.current_location || '',
                    remarks: event.rto_reason || 'Return to origin initiated',
                });

                await order.save();

                // Admin alert — RTO needs manual follow-up; dedup on retries
                if (prevShippingStatus !== 'rto') {
                    sendEmail({
                        email: process.env.ADMIN_EMAIL || process.env.SMTP_EMAIL,
                        subject: `⚠️ RTO Initiated - ${order.orderNumber} | SwissGarden Perfumes`,
                        html: rtoAdminAlertEmail(order, event),
                    }).catch((err) => console.error('RTO admin alert failed:', err.message));
                }
                break;
            }

            case 'order_cancelled':
            case 'ORDER_CANCELLED':
            case 'cancelled': {
                console.log(`⚠️ Order cancelled: ${order.orderNumber}`);
                
                order.shiprocket.shippingStatus = 'cancelled';

                // Only restore stock/coupon if not already cancelled
                const wasAlreadyCancelled = order.orderStatus === 'Cancelled';
                order.orderStatus = 'Cancelled';

                order.shiprocket.statusHistory.push({
                    status: 'cancelled',
                    timestamp: new Date(),
                    location: '',
                    remarks: event.cancellation_reason || 'Order cancelled',
                });

                await order.save();

                // Restore stock and coupon only on first cancellation
                if (!wasAlreadyCancelled) {
                    await restoreStockAndCoupon(order);
                }
                break;
            }

            case 'in_transit':
            case 'IN_TRANSIT': {
                console.log(`📦 Order in transit: ${order.orderNumber}`);
                
                order.shiprocket.shippingStatus = 'in_transit';

                order.shiprocket.statusHistory.push({
                    status: 'in_transit',
                    timestamp: new Date(),
                    location: event.current_location || event.scan_location || '',
                    remarks: event.status_message || 'Shipment in transit',
                });

                await order.save();
                break;
            }

            default:
                console.log(`ℹ️ Unhandled Shiprocket event: ${eventType}`);
                
                // Store unhandled events for debugging
                if (eventType) {
                    order.shiprocket.statusHistory.push({
                        status: eventType,
                        timestamp: new Date(),
                        location: event.current_location || '',
                        remarks: event.status_message || JSON.stringify(event),
                    });
                    await order.save();
                }
        }

        // Always respond 200 to acknowledge receipt
        res.status(200).json({ success: true, received: true });
    } catch (error) {
        console.error('❌ Shiprocket webhook error:', error);
        // Still return 200 so Shiprocket doesn't retry endlessly
        res.status(200).json({ success: true, received: true, error: error.message });
    }
});

export default router;
