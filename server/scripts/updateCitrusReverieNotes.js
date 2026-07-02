import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from '../models/Product.js';

dotenv.config();

const updateCitrusReverieNotes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected for Citrus Reverie notes update...');

        const newNotes = {
            top: ['Citrus', 'Fresh'],
            middle: ['Fresh Spicy', 'Green'],
            base: ['Amber'],
        };

        const result = await Product.updateOne(
            { name: 'Citrus Reverie' },
            { $set: { fragranceNotes: newNotes } }
        );

        console.log(`✅ Citrus Reverie fragrance notes updated successfully!`);
        console.log(`Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating Citrus Reverie notes:', error);
        process.exit(1);
    }
};

updateCitrusReverieNotes();
