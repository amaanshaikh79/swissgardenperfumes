import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

dotenv.config();

const checkImages = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const products = await Product.find({}).select('name images');
        
        console.log('\n📦 Products in Database:\n');
        products.forEach((product, index) => {
            console.log(`${index + 1}. ${product.name}`);
            console.log('   Images:');
            product.images.forEach((img, imgIndex) => {
                console.log(`   [${imgIndex}] ${img.url}`);
            });
            console.log('');
        });

        console.log(`\nTotal products: ${products.length}`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

checkImages();
