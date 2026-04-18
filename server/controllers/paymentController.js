import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';

// ── Read keys from env ────────────────────────────────────────────
const KEY_ID = process.env.RAZORPAY_KEY_ID?.trim();
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET?.trim();
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET?.trim();

const isKeyConfigured = (key) => key && !key.startsWith('your_') && !key.startsWith('rzp_live_your') && key !== 'rzp_test_demo' && key.length > 0;

if (!isKeyConfigured(KEY_ID)) {
    console.warn('⚠️  RAZORPAY_KEY_ID not configured properly. Payments will not work.');
}
if (!isKeyConfigured(KEY_SECRET)) {
    console.warn('⚠️  RAZORPAY_KEY_SECRET not configured properly. Payments will not work.');
}

// Lazy-init: create instance only when a payment endpoint is hit,
// so the server does not crash at startup if keys are missing.
let _razorpayInstance = null;
const getRazorpay = () => {
    if (!_razorpayInstance) {
        if (!isKeyConfigured(KEY_ID) || !isKeyConfigured(KEY_SECRET)) {
            const msg = 'Razorpay API keys not configured. Ensure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set in server/.env';
            console.error(`❌ ${msg}`);
            throw new Error(msg);
        }
        _razorpayInstance = new Razorpay({ key_id: KEY_ID, key_secret: KEY_SECRET });
        console.log('✓ Razorpay instance initialized successfully');
    }
    return _razorpayInstance;
};

// ─────────────────────────────────────────────────────────────────
// @desc    Get Razorpay Key ID (public key for frontend)
// @route   GET /api/payment/config
// @access  Public
// ─────────────────────────────────────────────────────────────────
export const getPaymentConfig = (req, res) => {
    if (!isKeyConfigured(KEY_ID)) {
        console.error('❌ Payment config error: RAZORPAY_KEY_ID is missing or invalid');
        console.error('   KEY_ID value:', KEY_ID ? `"${KEY_ID}"` : 'undefined');
        console.error('   Fix: Set RAZORPAY_KEY_ID in server/.env and restart the server');
        return res.status(503).json({
            success: false,
            message: 'Payment gateway is not configured. Razorpay API key is missing. Please check server logs.',
        });
    }
    if (!isKeyConfigured(KEY_SECRET)) {
        console.error('❌ Payment config error: RAZORPAY_KEY_SECRET is missing or invalid');
        return res.status(503).json({
            success: false,
            message: 'Payment gateway is not configured. API secret is missing. Please check server logs.',
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
        const { amount, currency = 'INR', receipt } = req.body;

        if (!amount || isNaN(amount) || Number(amount) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid amount greater than 0',
            });
        }

        // Razorpay requires amount in paise (1 INR = 100 paise)
        const amountInPaise = Math.round(Number(amount) * 100);

        const options = {
            amount: amountInPaise,
            currency,
            receipt: receipt || `rcpt_${Date.now()}`,
            notes: {
                userId: req.user.id,
                userEmail: req.user.email,
            },
        };

        const order = await getRazorpay().orders.create(options);

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

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'Missing payment verification fields',
            });
        }

        if (!KEY_SECRET) {
            return res.status(503).json({
                success: false,
                message: 'Payment gateway is not configured',
            });
        }

        // HMAC-SHA256 signature verification
        const body = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSignature = crypto
            .createHmac('sha256', KEY_SECRET)
            .update(body)
            .digest('hex');

        const isValid = crypto.timingSafeEqual(
            Buffer.from(expectedSignature, 'hex'),
            Buffer.from(razorpay_signature, 'hex')
        );

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

// ─────────────────────────────────────────────────────────────────
// @desc    Razorpay Webhook Handler (server-to-server event callbacks)
// @route   POST /api/payment/webhook
// @access  Public (verified via X-Razorpay-Signature header)
// ─────────────────────────────────────────────────────────────────
export const webhookHandler = async (req, res, next) => {
    try {
        const signature = req.headers['x-razorpay-signature'];

        if (!signature) {
            return res.status(400).json({ success: false, message: 'Missing webhook signature' });
        }

        if (!WEBHOOK_SECRET) {
            console.warn('RAZORPAY_WEBHOOK_SECRET not set — skipping signature verification');
        } else {
            // Verify webhook signature using raw body
            const expectedSignature = crypto
                .createHmac('sha256', WEBHOOK_SECRET)
                .update(req.rawBody)
                .digest('hex');

            const isValid = crypto.timingSafeEqual(
                Buffer.from(expectedSignature, 'hex'),
                Buffer.from(signature, 'hex')
            );

            if (!isValid) {
                console.warn('Webhook signature verification failed');
                return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
            }
        }

        const event = req.body;
        console.log(`📦 Razorpay Webhook: ${event.event}`);

        switch (event.event) {
            case 'payment.captured': {
                const payment = event.payload.payment.entity;
                console.log(`✅ Payment captured: ${payment.id} — ₹${payment.amount / 100}`);
                // Auto-capture is the default on Razorpay for Indian accounts.
                // Orders are already marked paid via the verify endpoint called from frontend.
                // This webhook serves as a safety net for edge cases.
                break;
            }

            case 'payment.failed': {
                const payment = event.payload.payment.entity;
                console.warn(`❌ Payment failed: ${payment.id} — ${payment.error_code}: ${payment.error_description}`);
                // Optionally: mark associated order as payment-failed, alert admin, etc.
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
