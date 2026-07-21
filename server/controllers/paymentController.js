import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { safeCompareHex } from '../utils/verifyRazorpay.js';
import sendEmail from '../utils/sendEmail.js';
import { paymentReceiptEmail } from '../utils/emailTemplates.js';
import { notifyAdminsOfNewOrder } from '../utils/orderHelper.js';
import { createShiprocketOrderAsync } from './orderController.js';

// Helper to get keys lazily (only when actually needed)
const getKeys = () => ({
    KEY_ID: process.env.RAZORPAY_KEY_ID?.trim(),
    KEY_SECRET: process.env.RAZORPAY_KEY_SECRET?.trim(),
    WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET?.trim(),
});

const isKeyConfigured = (key) => key && !key.startsWith('your_') && !key.startsWith('rzp_live_your') && key !== 'rzp_test_demo' && key.length > 0;

// Log keys once on first endpoint call
let keysLogged = false;
const logKeysOnce = () => {
    if (!keysLogged) {
        const { KEY_ID, KEY_SECRET } = getKeys();
        console.log(`\n🔐 Razorpay Configuration Check:`);
        console.log(`   KEY_ID value: "${KEY_ID ? KEY_ID.substring(0, 20) + '...' : 'undefined'}"`);
        console.log(`   KEY_SECRET value: "${KEY_SECRET ? KEY_SECRET.substring(0, 10) + '...' : 'undefined'}"`);
        console.log(`   KEY_ID valid: ${isKeyConfigured(KEY_ID)}`);
        console.log(`   KEY_SECRET valid: ${isKeyConfigured(KEY_SECRET)}\n`);
        keysLogged = true;
    }
};

// Lazy-init: create instance only when a payment endpoint is hit,
// so the server does not crash at startup if keys are missing.
let _razorpayInstance = null;
const getRazorpay = () => {
    const { KEY_ID, KEY_SECRET } = getKeys();
    if (!_razorpayInstance) {
        logKeysOnce();
        if (!isKeyConfigured(KEY_ID) || !isKeyConfigured(KEY_SECRET)) {
            const msg = 'Razorpay API keys not configured. Ensure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set in server/.env';
            console.error(`❌ ${msg}`);
            throw new Error(msg);
        }
        _razorpayInstance = new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET });
        console.log('✅ Razorpay instance initialized successfully with test keys\n');
    }
    return _razorpayInstance;
};

// ─────────────────────────────────────────────────────────────────
// @desc    Get Razorpay Key ID (public key for frontend)
// @route   GET /api/payment/config
// @access  Public
// ─────────────────────────────────────────────────────────────────
export const getPaymentConfig = (req, res) => {
    logKeysOnce();
    const { KEY_ID } = getKeys();
    if (!isKeyConfigured(KEY_ID)) {
        console.error('❌ Payment config error: RAZORPAY_KEY_ID is missing or invalid');
        console.error('   Fix: Set RAZORPAY_KEY_ID in server/.env and restart the server');
        return res.status(503).json({
            success: false,
            message: 'Payment gateway is not configured. Razorpay API key is missing. Please check server logs.',
        });
    }
    res.status(200).json({
        success: true,
        keyId: KEY_ID,
    });
};

// ─────────────────────────────────────────────────────────────────
// @desc    Create Razorpay Order
// @route   POST /api/payment/create-order
// @access  Private
// ─────────────────────────────────────────────────────────────────
export const createRazorpayOrder = async (req, res, next) => {
    try {
        const { orderId, amount, currency = 'INR', receipt } = req.body;

        let amountInPaise;
        const notes = { userId: req.user.id, userEmail: req.user.email };
        let receiptId = receipt || `rcpt_${Date.now()}`;

        if (orderId) {
            // Order-first flow: the DB order already exists (unpaid). Derive the
            // amount SERVER-SIDE from the order document — the client never
            // dictates what is charged — and link the Razorpay order back to it
            // via notes.orderId so the webhook can complete the order even if
            // the customer's browser dies after the charge.
            const dbOrder = await Order.findById(orderId);
            if (!dbOrder) {
                return res.status(404).json({ success: false, message: 'Order not found' });
            }
            if (dbOrder.user.toString() !== req.user.id) {
                return res.status(403).json({ success: false, message: 'Not authorized' });
            }
            if (dbOrder.isPaid) {
                return res.status(400).json({ success: false, message: 'Order is already paid' });
            }
            if (dbOrder.orderStatus === 'Cancelled') {
                return res.status(400).json({ success: false, message: 'Order has been cancelled' });
            }
            amountInPaise = Math.round(dbOrder.totalPrice * 100);
            receiptId = dbOrder.orderNumber;
            notes.orderId = dbOrder._id.toString();
            notes.orderNumber = dbOrder.orderNumber;
        } else {
            // Legacy flow (older cached client bundles): client-supplied amount.
            // The captured amount is still verified against the order total in
            // updateOrderToPaid before the order is confirmed.
            if (!amount || isNaN(amount) || Number(amount) <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide a valid amount greater than 0',
                });
            }
            amountInPaise = Math.round(Number(amount) * 100);
        }

        const order = await getRazorpay().orders.create({
            amount: amountInPaise,
            currency,
            receipt: receiptId,
            notes,
        });

        res.status(200).json({
            success: true,
            order: {
                id: order.id,
                amount: order.amount,      // in paise — pass directly to Razorpay SDK
                currency: order.currency,
                receipt: order.receipt,
            },
        });
    } catch (error) {
        console.error('Razorpay order creation error:', error);
        if (error.statusCode === 401) {
            return res.status(503).json({
                success: false,
                message: 'Payment gateway authentication failed. Invalid API keys.',
            });
        }
        next(error);
    }
};

// ─────────────────────────────────────────────────────────────────
// @desc    Verify Razorpay payment signature (server-side, HMAC-SHA256)
// @route   POST /api/payment/verify
// @access  Private
// ─────────────────────────────────────────────────────────────────
export const verifyPayment = async (req, res, next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const { KEY_SECRET } = getKeys();

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'Missing payment verification fields',
            });
        }

        if (!isKeyConfigured(KEY_SECRET)) {
            return res.status(503).json({
                success: false,
                message: 'Payment gateway is not configured',
            });
        }

        // HMAC-SHA256 signature verification. safeCompareHex rejects malformed
        // (non-hex / wrong-length) signatures with `false` instead of throwing,
        // so a bad signature returns 400 rather than 500.
        const body = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSignature = crypto
            .createHmac('sha256', KEY_SECRET)
            .update(body)
            .digest('hex');

        const isValid = safeCompareHex(expectedSignature, razorpay_signature);

        if (isValid) {
            res.status(200).json({
                success: true,
                message: 'Payment verified successfully',
                paymentId: razorpay_payment_id,
                orderId: razorpay_order_id,
            });
        } else {
            console.warn(`Payment signature mismatch: order=${razorpay_order_id}, payment=${razorpay_payment_id}`);
            res.status(400).json({
                success: false,
                message: 'Payment verification failed — invalid signature',
            });
        }
    } catch (error) {
        next(error);
    }
};

/**
 * Complete an order from a verified payment.captured webhook. Idempotent and
 * race-safe: the atomic isPaid:false claim ensures side effects (receipt
 * email, Shiprocket) run exactly once even if the client's mark-paid call is
 * happening concurrently. Never throws — reconciliation problems are logged
 * loudly instead of failing the webhook acknowledgement.
 */
const completeOrderFromWebhook = async (payment) => {
    try {
        const orderId = payment.notes?.orderId;
        if (!orderId) {
            // Legacy-flow payment (no order linkage) — the client is the only
            // completer. Log so captured-but-unlinked payments are traceable.
            console.log(`ℹ️ payment.captured without notes.orderId (legacy flow): ${payment.id}`);
            return;
        }

        const order = await Order.findById(orderId);
        if (!order) {
            console.error(
                `🚨 PAYMENT RECONCILIATION — captured payment references missing order. ` +
                `payment=${payment.id} orderId=${orderId} amountPaise=${payment.amount}`
            );
            return;
        }

        if (order.orderStatus === 'Cancelled') {
            console.error(
                `🚨 PAYMENT RECONCILIATION — payment captured for a CANCELLED order (refund needed). ` +
                `payment=${payment.id} orderNumber=${order.orderNumber} amountPaise=${payment.amount}`
            );
            return;
        }

        const expectedPaise = Math.round(order.totalPrice * 100);
        if (Number(payment.amount) !== expectedPaise) {
            console.error(
                `🚨 PAYMENT RECONCILIATION — webhook amount mismatch. payment=${payment.id} ` +
                `orderNumber=${order.orderNumber} capturedPaise=${payment.amount} expectedPaise=${expectedPaise}`
            );
            return;
        }

        // Atomic claim — loses gracefully if the client already marked it paid.
        const claimed = await Order.findOneAndUpdate(
            { _id: order._id, isPaid: false },
            {
                $set: {
                    isPaid: true,
                    paidAt: Date.now(),
                    paymentResult: {
                        id: payment.id,
                        status: 'captured',
                        updateTime: new Date().toISOString(),
                        emailAddress: payment.email || '',
                    },
                    orderStatus: 'Confirmed',
                },
            },
            { new: true }
        );

        if (!claimed) {
            console.log(`ℹ️ Order ${order.orderNumber} already completed (client won the race)`);
            return;
        }

        console.log(`🛟 Webhook completed order ${claimed.orderNumber} for payment ${payment.id}`);

        const user = await User.findById(claimed.user).select('firstName lastName email phone');
        if (user) {
            if (user.email) {
                sendEmail({
                    email: user.email,
                    subject: `Payment Received - ${claimed.orderNumber} | SwissGarden Perfumes`,
                    html: paymentReceiptEmail(claimed, user),
                }).catch((err) => console.error('Webhook receipt email failed:', err.message));
            }

            notifyAdminsOfNewOrder(claimed, user);

            createShiprocketOrderAsync(claimed, user).catch((err) =>
                console.error('Webhook Shiprocket creation failed (non-blocking):', err.message)
            );
        }
    } catch (err) {
        console.error('completeOrderFromWebhook error:', err.message);
    }
};

// ─────────────────────────────────────────────────────────────────
// @desc    Razorpay Webhook Handler (server-to-server event callbacks)
// @route   POST /api/payment/webhook
// @access  Public (verified via X-Razorpay-Signature header)
// ─────────────────────────────────────────────────────────────────
export const webhookHandler = async (req, res, next) => {
    try {
        const signature = req.headers['x-razorpay-signature'];
        const { WEBHOOK_SECRET } = getKeys();

        if (!signature) {
            return res.status(400).json({ success: false, message: 'Missing webhook signature' });
        }

        // Fail closed: never process an unverified webhook. If the secret is not
        // configured we cannot validate the signature, so refuse the request.
        if (!isKeyConfigured(WEBHOOK_SECRET)) {
            console.error('RAZORPAY_WEBHOOK_SECRET not set — refusing to process webhook');
            return res.status(503).json({ success: false, message: 'Webhook secret not configured' });
        }

        // Verify webhook signature using raw body. safeCompareHex guards against
        // malformed (non-hex / wrong-length) signatures without throwing.
        const expectedSignature = crypto
            .createHmac('sha256', WEBHOOK_SECRET)
            .update(req.rawBody)
            .digest('hex');

        if (!safeCompareHex(expectedSignature, signature)) {
            console.warn('Webhook signature verification failed');
            return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
        }

        const event = req.body;
        console.log(`📦 Razorpay Webhook: ${event.event}`);

        switch (event.event) {
            case 'payment.captured': {
                const payment = event.payload.payment.entity;
                console.log(`✅ Payment captured: ${payment.id} — ₹${payment.amount / 100}`);
                // Safety net: complete the order even when the customer's browser
                // died after the charge (e.g. during the bank OTP step) and the
                // client-side verify/mark-paid calls never happened.
                await completeOrderFromWebhook(payment);
                break;
            }

            case 'payment.failed': {
                const payment = event.payload.payment.entity;
                console.warn(
                    `❌ Payment failed: ${payment.id} — ${payment.error_code}: ${payment.error_description}` +
                    ` | reason=${payment.error_reason || '—'} source=${payment.error_source || '—'}` +
                    ` step=${payment.error_step || '—'} order=${payment.notes?.orderNumber || payment.order_id}`
                );
                // Deliberately NOT auto-cancelling the DB order: the customer can
                // retry payment for the same order, and the client cancels the
                // order itself on modal dismissal.
                break;
            }

            case 'refund.processed': {
                const refund = event.payload.refund.entity;
                console.log(`💸 Refund processed: ${refund.id} for payment ${refund.payment_id}`);
                // Optionally: update order status to "Refunded"
                break;
            }

            case 'order.paid': {
                const order = event.payload.order.entity;
                console.log(`🎉 Order paid via webhook: ${order.id}`);
                break;
            }

            default:
                console.log(`Unhandled webhook event: ${event.event}`);
        }

        // Always respond 200 to Razorpay to acknowledge receipt
        res.status(200).json({ success: true, received: true });
    } catch (error) {
        console.error('Webhook handler error:', error);
        // Still return 200 so Razorpay doesn't retry endlessly
        res.status(200).json({ success: true, received: true });
    }
};

// ─────────────────────────────────────────────────────────────────
// @desc    Get payment details by Razorpay Payment ID
// @route   GET /api/payment/:paymentId
// @access  Private
// ─────────────────────────────────────────────────────────────────
export const getPaymentDetails = async (req, res, next) => {
    try {
        const payment = await getRazorpay().payments.fetch(req.params.paymentId);
        res.status(200).json({
            success: true,
            payment: {
                id: payment.id,
                amount: payment.amount / 100,   // convert paise → INR for display
                currency: payment.currency,
                status: payment.status,
                method: payment.method,
                email: payment.email,
                contact: payment.contact,
                capturedAt: payment.captured ? new Date(payment.created_at * 1000).toISOString() : null,
            },
        });
    } catch (error) {
        next(error);
    }
};
