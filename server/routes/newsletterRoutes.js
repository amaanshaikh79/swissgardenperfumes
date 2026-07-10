import express from 'express';
import { subscribe } from '../controllers/newsletterController.js';
import { newsletterRules, validate } from '../middleware/validators.js';

const router = express.Router();

router.post('/subscribe', newsletterRules, validate, subscribe);

export default router;
