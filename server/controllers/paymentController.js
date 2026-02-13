import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_demo',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'demo_secret',
});

/**
 * @desc    Get Razorpay Key ID (public key for frontend)
 * @route   GET /api/payment/config
 * @access  Public
 */
export const getPaymentConfig = (req, res) => {
    res.status(200).json({
        success: true,
        keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_demo',
    });
};

/**
 * @desc    Create Razorpay Order
 * @route   POST /api/payment/create-order
 * @access  Private
 */
export const createRazorpayOrder = async (req, res, next) => {
    try {
        const { amount, currency = 'INR', receipt } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid amount',
            });
        }

        const options = {
            amount: Math.round(amount * 100), // Razorpay works in paise (smallest currency unit)
            currency,
            receipt: receipt || `order_${Date.now()}`,
            notes: {
                userId: req.user.id,
            },
        };

        const order = await razorpay.orders.create(options);

        res.status(200).json({
            success: true,
            order: {
                id: order.id,
                amount: order.amount,
                currency: order.currency,
            },
        });
    } catch (error) {
        console.error('Razorpay order creation error:', error);
        next(error);
    }
};

/**
 * @desc    Verify Razorpay payment signature
 * @route   POST /api/payment/verify
 * @access  Private
 */
export const verifyPayment = async (req, res, next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'Missing payment verification fields',
            });
        }

        // Create HMAC SHA256 digest
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'demo_secret')
            .update(body)
            .digest('hex');

        const isValid = expectedSignature === razorpay_signature;

        if (isValid) {
            res.status(200).json({
                success: true,
                message: 'Payment verified successfully',
                paymentId: razorpay_payment_id,
                orderId: razorpay_order_id,
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Payment verification failed',
            });
        }
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get payment details by Razorpay Payment ID
 * @route   GET /api/payment/:paymentId
 * @access  Private
 */
export const getPaymentDetails = async (req, res, next) => {
    try {
        const payment = await razorpay.payments.fetch(req.params.paymentId);
        res.status(200).json({
            success: true,
            payment: {
                id: payment.id,
                amount: payment.amount / 100,
                currency: payment.currency,
                status: payment.status,
                method: payment.method,
                email: payment.email,
                contact: payment.contact,
            },
        });
    } catch (error) {
        next(error);
    }
};
