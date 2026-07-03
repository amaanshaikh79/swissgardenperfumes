import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from '../models/Product.js';

dotenv.config();

/**
 * Migration script to add 4th image to all products
 */
const addFourthImages = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✨ Connected to MongoDB');

        const updates = [
            {
                name: 'Alpine Savage',
                newImage: { url: '/Images/Alpine%20Savage(4).jpg', alt: 'Alpine Savage - Gallery View' }
            },
            {
                name: 'Blue Dominion',
                newImage: { url: '/Images/Blue%20Dominion(4).png', alt: 'Blue Dominion - Gallery View' }
            },
            {
                name: 'Citrus Reverie',
                newImage: { url: '/Images/Citrus%20Reverie(4).png', alt: 'Citrus Reverie - Gallery View' }
            },
            {
                name: 'Royal Ascent',
                newImage: { url: '/Images/Royal%20Ascent(4).png', alt: 'Royal Ascent - Gallery View' }
            },
            {
                name: 'Swiss Flora',
                newImage: { url: '/Images/Swiss%20Flora(4).png', alt: 'Swiss Flora - Gallery View' }
            },
            {
                name: 'Glacier Splash',
                newImage: { url: '/Images/Glacier%20Splash(4).PNG', alt: 'Glacier Splash - Gallery View' }
            },
        ];

        let updatedCount = 0;

        for (const update of updates) {
            const product = await Product.findOne({ name: update.name });
            
            if (product) {
                // Check if 4th image already exists
                const hasImage4 = product.images.some(img => img.url.includes('(4)'));
                
                if (!hasImage4) {
                    product.images.push(update.newImage);
                    await product.save();
                    console.log(`✅ Added 4th image to ${update.name}`);
                    updatedCount++;
                } else {
                    console.log(`ℹ️  ${update.name} already has 4th image`);
                }
            } else {
                console.log(`❌ ${update.name} not found in database`);
            }
        }

        console.log(`\n✅ Image update completed! Updated ${updatedCount} product(s)\n`);
        
        // Verify all products now have 4 images
        const allProducts = await Product.find({});
        console.log('📊 Image counts per product:');
        allProducts.forEach(p => {
            console.log(`   ${p.name}: ${p.images.length} images`);
        });
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration error:', error);
        process.exit(1);
    }
};

addFourthImages();
