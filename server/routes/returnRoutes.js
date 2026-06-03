import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
    getAllReturns,
    getMyReturns,
    getReturn,
    createReturn,
    updateReturnStatus,
    cancelReturn,
} from '../controllers/returnController.js';

const router = express.Router();

router.use(protect);

router.route('/')
    .get(authorize('admin'), getAllReturns)
    .post(createReturn);

router.get('/my', getMyReturns);

router.route('/:id')
    .get(getReturn)
    .delete(cancelReturn);

router.put('/:id/status', authorize('admin'), updateReturnStatus);

export default router;
