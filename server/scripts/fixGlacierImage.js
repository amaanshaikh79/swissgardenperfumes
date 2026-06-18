import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

dotenv.config();

const fixGlacierImage = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/swissgarden-perfumes');
        console.log('✨ Connected to MongoDB');

        // Find Glacier Splash product and fix the (3) image extension
        const result = await Product.updateOne(
            { name: 'Glacier Splash', 'images.url': '/Images/Glacier Splash(3).JPG' },
            { $set: { 'images.$.url': '/Images/Glacier Splash(3).jpg' } }
        );

        if (result.modifiedCount > 0) {
            console.log('✅ Fixed Glacier Splash(3) image URL: .JPG → .jpg');
        } else {
            console.log('ℹ️  No update needed — Glacier Splash(3) image URL is already correct or product not found.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

fixGlacierImage();
