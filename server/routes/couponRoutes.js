import express from 'express';
import { applyCoupon, createCoupon, getAllCoupons, updateCoupon, deleteCoupon } from '../controllers/couponController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// User route — apply/validate coupon
router.post('/apply', protect, applyCoupon);

// Admin routes
router.route('/').get(protect, authorize('admin'), getAllCoupons).post(protect, authorize('admin'), createCoupon);
router.route('/:id').put(protect, authorize('admin'), updateCoupon).delete(protect, authorize('admin'), deleteCoupon);

export default router;
