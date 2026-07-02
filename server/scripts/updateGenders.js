import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

dotenv.config();

/**
 * Migration script to update product genders
 * For Him: Glacier Splash, Royal Ascent, Alpine Savage
 * For Her: Blue Dominion, Citrus Reverie, Swiss Flora
 */
const updateGenders = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/swissgarden-perfumes');
        console.log('✨ Connected to MongoDB');

        const updates = [
            // Men's fragrances
            { name: 'Glacier Splash', gender: 'Men' },
            { name: 'Royal Ascent', gender: 'Men' },
            { name: 'Alpine Savage', gender: 'Men' },
            
            // Women's fragrances
            { name: 'Blue Dominion', gender: 'Women' },
            { name: 'Citrus Reverie', gender: 'Women' },
            { name: 'Swiss Flora', gender: 'Women' },
        ];

        let updatedCount = 0;

        for (const update of updates) {
            const result = await Product.updateOne(
                { name: update.name },
                { $set: { gender: update.gender } }
            );
            
            if (result.modifiedCount > 0) {
                console.log(`✅ Updated ${update.name} to ${update.gender}`);
                updatedCount++;
            } else {
                console.log(`ℹ️  ${update.name} already set to ${update.gender} or not found`);
            }
        }

        console.log(`\n✅ Gender update completed! Updated ${updatedCount} product(s)\n`);
        
        // Show final counts
        const menCount = await Product.countDocuments({ gender: 'Men' });
        const womenCount = await Product.countDocuments({ gender: 'Women' });
        const unisexCount = await Product.countDocuments({ gender: 'Unisex' });
        
        console.log('📊 Current Distribution:');
        console.log(`   For Him (Men): ${menCount} products`);
        console.log(`   For Her (Women): ${womenCount} products`);
        console.log(`   Unisex: ${unisexCount} products\n`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration error:', error);
        process.exit(1);
    }
};

updateGenders();
