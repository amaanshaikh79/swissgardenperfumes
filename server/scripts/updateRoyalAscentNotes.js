import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from '../models/Product.js';

dotenv.config();

const updateRoyalAscentNotes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected for Royal Ascent notes update...');

        const newNotes = {
            top: ['Leather', 'Fruity', 'Sweet'],
            middle: ['Woody', 'Citrus', 'Smoky'],
            base: ['Musky', 'Fresh', 'Tropical'],
        };

        const result = await Product.updateOne(
            { name: 'Royal Ascent' },
            { $set: { fragranceNotes: newNotes } }
        );

        console.log(`✅ Royal Ascent fragrance notes updated successfully!`);
        console.log(`Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating Royal Ascent notes:', error);
        process.exit(1);
    }
};

updateRoyalAscentNotes();
