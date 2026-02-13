import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide your name'],
            trim: true,
            maxlength: 100,
        },
        email: {
            type: String,
            required: [true, 'Please provide your email'],
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        },
        subject: {
            type: String,
            required: [true, 'Please provide a subject'],
            trim: true,
            maxlength: 200,
        },
        message: {
            type: String,
            required: [true, 'Please provide a message'],
            maxlength: 5000,
        },
        status: {
            type: String,
            enum: ['unread', 'read', 'replied'],
            default: 'unread',
        },
        reply: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

const Contact = mongoose.model('Contact', contactSchema);
export default Contact;
