import mongoose from 'mongoose';

const subscriberSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        },
        source: {
            type: String,
            enum: ['exit_intent', 'home', 'other'],
            default: 'other',
        },
        subscribedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

const Subscriber = mongoose.model('Subscriber', subscriberSchema);
export default Subscriber;
