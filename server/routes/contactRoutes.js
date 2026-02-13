import express from 'express';
import {
    submitContact,
    getContacts,
    updateContact,
    deleteContact,
} from '../controllers/contactController.js';
import { protect, authorize } from '../middleware/auth.js';
import { contactRules, validate } from '../middleware/validators.js';

const router = express.Router();

router.post('/', contactRules, validate, submitContact);
router.get('/', protect, authorize('admin'), getContacts);
router.put('/:id', protect, authorize('admin'), updateContact);
router.delete('/:id', protect, authorize('admin'), deleteContact);

export default router;
