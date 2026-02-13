import Product from '../models/Product.js';

/**
 * @desc    Get all products with filtering, sorting, pagination
 * @route   GET /api/products
 * @access  Public
 */
export const getProducts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;

        // Build query
        let query = { isActive: true };

        // Search
        if (req.query.search) {
            query.$text = { $search: req.query.search };
        }

        // Category filter
        if (req.query.category) {
            query.category = req.query.category;
        }

        // Gender filter
        if (req.query.gender) {
            query.gender = req.query.gender;
        }

        // Fragrance family filter
        if (req.query.fragranceFamily) {
            query.fragranceFamily = req.query.fragranceFamily;
        }

        // Price range filter
        if (req.query.minPrice || req.query.maxPrice) {
            query.price = {};
            if (req.query.minPrice) query.price.$gte = parseFloat(req.query.minPrice);
            if (req.query.maxPrice) query.price.$lte = parseFloat(req.query.maxPrice);
        }

        // Rating filter
        if (req.query.rating) {
            query.rating = { $gte: parseFloat(req.query.rating) };
        }

        // Featured filter
        if (req.query.featured === 'true') {
            query.featured = true;
        }

        // Sort
        let sortOption = {};
        switch (req.query.sort) {
            case 'price_asc':
                sortOption = { price: 1 };
                break;
            case 'price_desc':
                sortOption = { price: -1 };
                break;
            case 'rating':
                sortOption = { rating: -1 };
                break;
            case 'newest':
                sortOption = { createdAt: -1 };
                break;
            case 'bestselling':
                sortOption = { sold: -1 };
                break;
            case 'name_asc':
                sortOption = { name: 1 };
                break;
            default:
                sortOption = { createdAt: -1 };
        }

        const total = await Product.countDocuments(query);
        const products = await Product.find(query).sort(sortOption).skip(skip).limit(limit);

        res.status(200).json({
            success: true,
            count: products.length,
            total,
            page,
            pages: Math.ceil(total / limit),
            products,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single product by slug
 * @route   GET /api/products/slug/:slug
 * @access  Public
 */
export const getProductBySlug = async (req, res, next) => {
    try {
        const product = await Product.findOne({ slug: req.params.slug, isActive: true }).populate(
            'reviews.user',
            'firstName lastName avatar'
        );

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.status(200).json({ success: true, product });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
export const getProductById = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id).populate(
            'reviews.user',
            'firstName lastName avatar'
        );

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.status(200).json({ success: true, product });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Admin
 */
export const createProduct = async (req, res, next) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json({ success: true, product });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update a product
 * @route   PUT /api/products/:id
 * @access  Admin
 */
export const updateProduct = async (req, res, next) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.status(200).json({ success: true, product });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete a product (soft delete)
 * @route   DELETE /api/products/:id
 * @access  Admin
 */
export const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.status(200).json({ success: true, message: 'Product removed' });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Add product review
 * @route   POST /api/products/:id/reviews
 * @access  Private
 */
export const addReview = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // Check if user already reviewed
        const alreadyReviewed = product.reviews.find(
            (r) => r.user.toString() === req.user.id.toString()
        );

        if (alreadyReviewed) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this product',
            });
        }

        const review = {
            user: req.user.id,
            rating: req.body.rating,
            title: req.body.title,
            comment: req.body.comment,
        };

        product.reviews.push(review);
        product.calculateAverageRating();
        await product.save();

        const updatedProduct = await Product.findById(req.params.id).populate(
            'reviews.user',
            'firstName lastName avatar'
        );

        res.status(201).json({ success: true, product: updatedProduct });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get featured products
 * @route   GET /api/products/featured
 * @access  Public
 */
export const getFeaturedProducts = async (req, res, next) => {
    try {
        const products = await Product.find({ featured: true, isActive: true }).limit(8);
        res.status(200).json({ success: true, products });
    } catch (error) {
        next(error);
    }
};
