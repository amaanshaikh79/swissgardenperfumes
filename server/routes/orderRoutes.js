import express from 'express';
import {
    createOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    updateOrderToPaid,
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/auth.js';
import { orderRules, validate } from '../middleware/validators.js';

const router = express.Router();

router.post('/', protect, orderRules, validate, createOrder);
router.get('/my', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/pay', protect, updateOrderToPaid);

// Admin routes
router.get('/', protect, authorize('admin'), getAllOrders);
router.put('/:id/status', protect, authorize('admin'), updateOrderStatus);

export default router;
