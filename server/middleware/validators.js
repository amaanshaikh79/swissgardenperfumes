import { body, param, query, validationResult } from 'express-validator';

/**
 * Check for validation errors and return them
 */
export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map((e) => ({ field: e.path, message: e.msg }));
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errorMessage: formattedErrors.map((e) => e.message).join(', '),
            errors: formattedErrors,
        });
    }
    next();
};

// Auth validation rules
export const registerRules = [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters')
        .matches(/\d/)
        .withMessage('Password must contain a number'),
];

export const loginRules = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
];

// Product validation rules
export const productRules = [
    body('name').trim().notEmpty().withMessage('Product name is required'),
    body('brand').trim().notEmpty().withMessage('Brand is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('category').notEmpty().withMessage('Category is required'),
    body('size').notEmpty().withMessage('Size is required'),
    body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
];

// Review validation rules
export const reviewRules = [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').trim().notEmpty().withMessage('Comment is required'),
];

// Contact validation rules
export const contactRules = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('subject').trim().notEmpty().withMessage('Subject is required'),
    body('message').trim().notEmpty().withMessage('Message is required'),
];

// Order validation rules
export const orderRules = [
    body('orderItems').isArray({ min: 1 }).withMessage('At least one order item is required'),
    body('shippingAddress.street').notEmpty().withMessage('Street address is required'),
    body('shippingAddress.city').notEmpty().withMessage('City is required'),
    body('shippingAddress.state').notEmpty().withMessage('State is required'),
    body('shippingAddress.zipCode').notEmpty().withMessage('Zip code is required'),
    body('shippingAddress.country').notEmpty().withMessage('Country is required'),
    body('paymentMethod').isIn(['razorpay', 'cod']).withMessage('Invalid payment method'),
];

// ID param validation
export const idRule = [param('id').isMongoId().withMessage('Invalid ID format')];
