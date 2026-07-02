import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from '../models/Product.js';

dotenv.config();

const updateGlacierSplashNotes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected for Glacier Splash notes update...');

        const newNotes = {
            top: ['Aromatic', 'Green'],
            middle: ['Marine', 'Fresh Spicy'],
            base: ['Lavender', 'Woody', 'Salty'],
        };

        const result = await Product.updateOne(
            { name: 'Glacier Splash' },
            { $set: { fragranceNotes: newNotes } }
        );

        console.log(`✅ Glacier Splash fragrance notes updated successfully!`);
        console.log(`Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating Glacier Splash notes:', error);
        process.exit(1);
    }
};

updateGlacierSplashNotes();
