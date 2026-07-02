import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from '../models/Product.js';

dotenv.config();

const updateBlueDominionNotes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected for Blue Dominion notes update...');

        const newNotes = {
            top: ['Woody', 'Citrus', 'Aromatic'],
            middle: ['Amber', 'Fresh Spicy', 'Powdery'],
            base: ['Warm Spicy', 'Green', 'Lavender'],
        };

        const result = await Product.updateOne(
            { name: 'Blue Dominion' },
            { $set: { fragranceNotes: newNotes } }
        );

        console.log(`✅ Blue Dominion fragrance notes updated successfully!`);
        console.log(`Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating Blue Dominion notes:', error);
        process.exit(1);
    }
};

updateBlueDominionNotes();
