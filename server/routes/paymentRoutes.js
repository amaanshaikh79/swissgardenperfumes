import express from 'express';
import {
    getPaymentConfig,
    createRazorpayOrder,
    verifyPayment,
    getPaymentDetails,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/config', getPaymentConfig);
router.post('/create-order', protect, createRazorpayOrder);
router.post('/verify', protect, verifyPayment);
router.get('/:paymentId', protect, getPaymentDetails);

export default router;
