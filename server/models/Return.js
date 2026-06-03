import mongoose from 'mongoose';

const returnSchema = new mongoose.Schema(
    {
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        returnItems: [{
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true,
            },
            name: { type: String, required: true },
            quantity: { type: Number, required: true, min: 1 },
            reason: { type: String, required: true },
            condition: { type: String, required: true }, // e.g., 'unopened', 'used', 'damaged'
        }],
        returnReason: {
            type: String,
            required: true,
            enum: ['wrong_item', 'damaged', 'not_as_described', 'changed_mind', 'defective', 'other'],
        },
        description: {
            type: String,
            maxlength: [500, 'Description cannot exceed 500 characters'],
        },
        refundMethod: {
            type: String,
            required: true,
            enum: ['original_payment', 'store_credit', 'bank_transfer'],
        },
        refundAmount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'processing', 'completed', 'cancelled'],
            default: 'pending',
        },
        adminNotes: {
            type: String,
            maxlength: [500, 'Admin notes cannot exceed 500 characters'],
        },
        trackingNumber: String,
        returnAddress: {
            street: String,
            city: String,
            state: String,
            zipCode: String,
            country: String,
        },
        approvedAt: Date,
        completedAt: Date,
        rejectedAt: Date,
    },
    {
        timestamps: true,
    }
);

const Return = mongoose.model('Return', returnSchema);
export default Return;
