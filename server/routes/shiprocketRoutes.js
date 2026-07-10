import express from 'express';
import {
    retryShiprocketOrder,
    scheduleOrderPickup,
    generateShippingLabel,
    getTrackingDetails,
    cancelShiprocketShipment,
    getShippingRatesController,
    bulkSchedulePickup,
    getShiprocketOrder,
} from '../controllers/shiprocketController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// ── Protected Routes (User) ───────────────────────────────────────
router.get('/track/:orderId', protect, getTrackingDetails);
router.post('/shipping-rates', protect, getShippingRatesController);

// ── Admin Routes ──────────────────────────────────────────────────
router.post('/retry/:orderId', protect, authorize('admin'), retryShiprocketOrder);
router.post('/schedule-pickup/:orderId', protect, authorize('admin'), scheduleOrderPickup);
router.get('/generate-label/:orderId', protect, authorize('admin'), generateShippingLabel);
router.post('/cancel/:orderId', protect, authorize('admin'), cancelShiprocketShipment);
router.post('/bulk-schedule-pickup', protect, authorize('admin'), bulkSchedulePickup);
router.get('/order-details/:orderNumber', protect, authorize('admin'), getShiprocketOrder);

export default router;
