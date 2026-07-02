import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

dotenv.config();

/**
 * Migration script to update all product prices from ₹499 to ₹799
 * Run this script once to update existing products in the database
 */
const updatePrices = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/swissgarden-perfumes');
        console.log('✨ Connected to MongoDB');

        // Get all products
        const allProducts = await Product.find({});
        let priceUpdatedCount = 0;
        let textUpdatedCount = 0;

        for (const product of allProducts) {
            let updated = false;

            // Update price if it's 499
            if (product.price === 499) {
                product.price = 799;
                priceUpdatedCount++;
                updated = true;
            }

            // Update shortDescription
            if (product.shortDescription && product.shortDescription.includes('₹499')) {
                product.shortDescription = product.shortDescription.replace(/₹499/g, '₹799');
                textUpdatedCount++;
                updated = true;
            }

            // Update metaDescription
            if (product.metaDescription && product.metaDescription.includes('₹499')) {
                product.metaDescription = product.metaDescription.replace(/₹499/g, '₹799');
                updated = true;
            }

            // Update format
            if (product.format && product.format.includes('₹499')) {
                product.format = product.format.replace(/₹499/g, '₹799');
                updated = true;
            }

            if (updated) {
                await product.save();
            }
        }

        console.log(`✅ Updated price in ${priceUpdatedCount} product(s) from ₹499 to ₹799`);
        console.log(`✅ Updated text fields in ${textUpdatedCount} product(s)`);
        console.log('\n✅ Price migration completed successfully!\n');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration error:', error);
        process.exit(1);
    }
};

updatePrices();
