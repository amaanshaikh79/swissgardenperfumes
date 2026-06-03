import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
    getAllDeliveryPartners,
    getDeliveryPartner,
    createDeliveryPartner,
    updateDeliveryPartner,
    deleteDeliveryPartner,
    toggleDeliveryPartnerStatus,
} from '../controllers/deliveryPartnerController.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.route('/')
    .get(getAllDeliveryPartners)
    .post(createDeliveryPartner);

router.route('/:id')
    .get(getDeliveryPartner)
    .put(updateDeliveryPartner)
    .delete(deleteDeliveryPartner);

router.patch('/:id/toggle', toggleDeliveryPartnerStatus);

export default router;
