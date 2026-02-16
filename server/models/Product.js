import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        rating: {
            type: Number,
            required: [true, 'Please provide a rating'],
            min: 1,
            max: 5,
        },
        title: {
            type: String,
            trim: true,
            maxlength: 100,
        },
        comment: {
            type: String,
            required: [true, 'Please provide a review comment'],
            maxlength: 1000,
        },
    },
    { timestamps: true }
);

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a product name'],
            trim: true,
            maxlength: [200, 'Name cannot exceed 200 characters'],
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
            sparse: true,
        },
        brand: {
            type: String,
            required: [true, 'Please provide the brand name'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Please provide a product description'],
            maxlength: 3000,
        },
        shortDescription: {
            type: String,
            maxlength: 300,
        },
        price: {
            type: Number,
            required: [true, 'Please provide the price'],
            min: [0, 'Price must be positive'],
        },
        compareAtPrice: {
            type: Number,
            min: 0,
        },
        images: [
            {
                url: { type: String, required: true },
                alt: { type: String, default: '' },
            },
        ],
        category: {
            type: String,
            required: [true, 'Please provide a category'],
            enum: [
                'Eau de Parfum',
                'Eau de Toilette',
                'Eau de Cologne',
                'Parfum',
                'Attar',
                'Body Mist',
                'Gift Set',
            ],
        },
        gender: {
            type: String,
            enum: ['Men', 'Women', 'Unisex'],
            default: 'Unisex',
        },
        size: {
            type: String,
            required: true,
        },
        fragranceNotes: {
            top: [String],
            middle: [String],
            base: [String],
        },
        fragranceFamily: {
            type: String,
            enum: [
                'Floral',
                'Oriental',
                'Woody',
                'Fresh',
                'Citrus',
                'Aquatic',
                'Gourmand',
                'Chypre',
                'Fougere',
                'Aromatic',
            ],
        },
        stock: {
            type: Number,
            required: [true, 'Please provide stock quantity'],
            min: [0, 'Stock cannot be negative'],
            default: 0,
        },
        sold: {
            type: Number,
            default: 0,
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        numReviews: {
            type: Number,
            default: 0,
        },
        reviews: [reviewSchema],
        featured: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        tags: [String],
        concentration: {
            type: String,
            enum: ['Light', 'Moderate', 'Strong', 'Intense'],
        },
        longevity: {
            type: String,
            enum: ['2-4 hours', '4-6 hours', '6-8 hours', '8-12 hours', '12+ hours'],
        },
        sillage: {
            type: String,
            enum: ['Intimate', 'Moderate', 'Strong', 'Enormous'],
        },
        occasion: [String],
        season: [String],
    },
    {
        timestamps: true,
    }
);

// Generate slug before saving
productSchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }
    next();
});

// Calculate average rating
productSchema.methods.calculateAverageRating = function () {
    if (this.reviews.length === 0) {
        this.rating = 0;
        this.numReviews = 0;
    } else {
        const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
        this.rating = Math.round((sum / this.reviews.length) * 10) / 10;
        this.numReviews = this.reviews.length;
    }
};

// Text index for search
productSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });
productSchema.index({ category: 1, gender: 1, price: 1 });

const Product = mongoose.model('Product', productSchema);
export default Product;
