import express from 'express';
import {
    getProducts,
    getProductBySlug,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    addReview,
    getFeaturedProducts,
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/auth.js';
import { productRules, reviewRules, validate } from '../middleware/validators.js';

const router = express.Router();

router.get('/featured', getFeaturedProducts);
router.get('/', getProducts);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', getProductById);

// Admin routes
router.post('/', protect, authorize('admin'), productRules, validate, createProduct);
router.put('/:id', protect, authorize('admin'), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

// Reviews
router.post('/:id/reviews', protect, reviewRules, validate, addReview);

export default router;
