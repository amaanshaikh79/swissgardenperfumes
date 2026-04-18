import express from 'express';
import {
    getPaymentConfig,
    createRazorpayOrder,
    verifyPayment,
    webhookHandler,
    getPaymentDetails,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// ── Public ────────────────────────────────────────────────────────
router.get('/config', getPaymentConfig);

// ── Webhook: must use raw body for signature verification ─────────
// (express.raw() is applied BEFORE express.json() in server.js for this route)
router.post('/webhook', webhookHandler);

// ── Private ───────────────────────────────────────────────────────
router.post('/create-order', protect, createRazorpayOrder);
router.post('/verify', protect, verifyPayment);
router.get('/:paymentId', protect, getPaymentDetails);

export default router;
