import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from '../models/Product.js';

dotenv.config();

const updateSwissFloraotes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected for Swiss Flora notes update...');

        const newNotes = {
            top: ['Flora', 'Citrus', 'Fresh'],
            middle: ['Rose', 'Fruity', 'Woody'],
            base: ['Patchouli', 'Warm Spicy'],
        };

        const result = await Product.updateOne(
            { name: 'Swiss Flora' },
            { $set: { fragranceNotes: newNotes } }
        );

        console.log(`✅ Swiss Flora fragrance notes updated successfully!`);
        console.log(`Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating Swiss Flora notes:', error);
        process.exit(1);
    }
};

updateSwissFloraotes();
