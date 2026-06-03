import mongoose from 'mongoose';

const deliveryPartnerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide delivery partner name'],
            trim: true,
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        company: {
            type: String,
            required: [true, 'Please provide company name'],
            trim: true,
            maxlength: [100, 'Company name cannot exceed 100 characters'],
        },
        email: {
            type: String,
            required: [true, 'Please provide email'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        },
        phone: {
            type: String,
            required: [true, 'Please provide phone number'],
            trim: true,
        },
        address: {
            street: String,
            city: String,
            state: String,
            zipCode: String,
            country: { type: String, default: 'India' },
        },
        serviceAreas: [{
            type: String,
            trim: true,
        }],
        deliveryCharges: {
            baseCharge: {
                type: Number,
                default: 0,
            },
            perKmCharge: {
                type: Number,
                default: 0,
            },
            freeDeliveryAbove: {
                type: Number,
                default: 0,
            },
        },
        logo: {
            type: String,
            default: '',
        },
        trackingUrl: {
            type: String,
            default: '',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        totalDeliveries: {
            type: Number,
            default: 0,
        },
        notes: {
            type: String,
            maxlength: [500, 'Notes cannot exceed 500 characters'],
        },
    },
    {
        timestamps: true,
    }
);

// Calculate average rating
deliveryPartnerSchema.methods.calculateAverageRating = function (reviews) {
    if (reviews.length === 0) {
        this.rating = 0;
        return;
    }
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    this.rating = sum / reviews.length;
};

const DeliveryPartner = mongoose.model('DeliveryPartner', deliveryPartnerSchema);
export default DeliveryPartner;
