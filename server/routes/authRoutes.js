import express from 'express';
import {
    register,
    login,
    logout,
    getMe,
    updateProfile,
    updatePassword,
    toggleWishlist,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { registerRules, loginRules, validate } from '../middleware/validators.js';

const router = express.Router();

router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);
router.put('/wishlist/:productId', protect, toggleWishlist);

export default router;
