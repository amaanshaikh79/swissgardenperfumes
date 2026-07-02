import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from '../models/Product.js';

dotenv.config();

const updateAlpineSavageNotes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected for Alpine Savage notes update...');

        const newNotes = {
            top: ['Fresh Spicy', 'Amber', 'Citrus'],
            middle: ['Aromatic', 'Musky', 'Woody'],
            base: ['Lavender', 'Herbal', 'Warm Spicy'],
        };

        const result = await Product.updateOne(
            { name: 'Alpine Savage' },
            { $set: { fragranceNotes: newNotes } }
        );

        console.log(`✅ Alpine Savage fragrance notes updated successfully!`);
        console.log(`Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating Alpine Savage notes:', error);
        process.exit(1);
    }
};

updateAlpineSavageNotes();
