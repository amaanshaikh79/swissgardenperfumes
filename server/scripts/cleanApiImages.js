import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

dotenv.config();

const cleanApiImages = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/swissgarden-perfumes');
        console.log('✨ Connected to MongoDB');

        // Find all products
        const allProducts = await Product.find({});
        console.log(`\n📦 Total products in database: ${allProducts.length}`);

        // Find products with external API images (Unsplash, placeholder, etc.)
        const productsWithApiImages = allProducts.filter(product => {
            return product.images.some(img => 
                img.url.includes('unsplash.com') || 
                img.url.includes('placeholder') || 
                img.url.includes('via.placeholder') ||
                img.url.startsWith('http://') ||
                img.url.startsWith('https://')
            );
        });

        console.log(`\n🔍 Products with API/External images: ${productsWithApiImages.length}`);

        if (productsWithApiImages.length > 0) {
            console.log('\n📋 Products with external images:');
            productsWithApiImages.forEach((product, index) => {
                console.log(`\n${index + 1}. ${product.name}`);
                product.images.forEach((img, imgIndex) => {
                    if (img.url.includes('unsplash.com') || 
                        img.url.includes('placeholder') || 
                        img.url.includes('via.placeholder') ||
                        img.url.startsWith('http://') ||
                        img.url.startsWith('https://')) {
                        console.log(`   Image ${imgIndex + 1}: ${img.url}`);
                    }
                });
            });

            console.log('\n❌ Deleting products with external/API images...');
            
            const deleteResult = await Product.deleteMany({
                _id: { $in: productsWithApiImages.map(p => p._id) }
            });

            console.log(`✅ Deleted ${deleteResult.deletedCount} product(s) with external images`);
        } else {
            console.log('\n✅ No products with external/API images found!');
            console.log('All products are using local images.');
        }

        // Show remaining products
        const remainingProducts = await Product.find({});
        console.log(`\n📦 Remaining products: ${remainingProducts.length}`);
        if (remainingProducts.length > 0) {
            console.log('\n✅ Clean products in database:');
            remainingProducts.forEach((product, index) => {
                console.log(`${index + 1}. ${product.name} - ${product.images.length} image(s)`);
                product.images.forEach((img, imgIndex) => {
                    console.log(`   Image ${imgIndex + 1}: ${img.url}`);
                });
            });
        }

        console.log('\n✅ Database cleanup completed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Cleanup error:', error);
        process.exit(1);
    }
};

cleanApiImages();
