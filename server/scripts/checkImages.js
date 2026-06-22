import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from '../models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const checkImages = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        const products = await Product.find({}).select('name images');
        
        // Path to images directory
        const imagesDir = path.join(__dirname, '../../client/public/Images');
        
        console.log('📊 IMAGE AUDIT REPORT');
        console.log('═══════════════════════════════════════════════════════\n');
        
        let totalExpected = 0;
        let totalFound = 0;
        let missingFiles = [];
        let foundFiles = [];
        
        console.log('🔍 Checking Database vs Physical Files:\n');
        
        products.forEach((product, index) => {
            console.log(`${index + 1}. ${product.name}`);
            console.log('   ─────────────────────────────────');
            
            product.images.forEach((img, imgIndex) => {
                totalExpected++;
                const filename = img.url.replace('/Images/', '');
                const filePath = path.join(imagesDir, filename);
                const exists = fs.existsSync(filePath);
                
                const icon = exists ? '✅' : '❌';
                const status = exists ? 'FOUND' : 'MISSING';
                
                let fileSize = 'N/A';
                if (exists) {
                    const stats = fs.statSync(filePath);
                    const sizeInKB = (stats.size / 1024).toFixed(2);
                    fileSize = `${sizeInKB} KB`;
                    totalFound++;
                    foundFiles.push({ filename, size: sizeInKB });
                } else {
                    missingFiles.push(filename);
                }
                
                const label = imgIndex === 0 ? 'DEFAULT' : imgIndex === 1 ? 'HOVER' : 'GALLERY';
                console.log(`   ${icon} [${label}] ${filename} - ${status} ${exists ? `(${fileSize})` : ''}`);
            });
            console.log('');
        });

        console.log('\n📈 SUMMARY');
        console.log('═══════════════════════════════════════════════════════');
        console.log(`Total Products: ${products.length}`);
        console.log(`Expected Images: ${totalExpected}`);
        console.log(`Found Images: ${totalFound}`);
        console.log(`Missing Images: ${totalExpected - totalFound}`);
        
        if (missingFiles.length > 0) {
            console.log('\n❌ MISSING FILES:');
            missingFiles.forEach(file => console.log(`   - ${file}`));
        }
        
        console.log('\n📁 Image Directory:', imagesDir);
        console.log('');
        
        // Check for files not in database
        if (fs.existsSync(imagesDir)) {
            const allFiles = fs.readdirSync(imagesDir).filter(f => 
                f.endsWith('.JPG') || f.endsWith('.jpg') || f.endsWith('.jpeg')
            );
            
            const dbFiles = products.flatMap(p => 
                p.images.map(img => img.url.replace('/Images/', ''))
            );
            
            const extraFiles = allFiles.filter(f => !dbFiles.includes(f));
            
            if (extraFiles.length > 0) {
                console.log('⚠️  FILES NOT IN DATABASE:');
                extraFiles.forEach(file => {
                    const filePath = path.join(imagesDir, file);
                    const stats = fs.statSync(filePath);
                    const sizeInKB = (stats.size / 1024).toFixed(2);
                    console.log(`   - ${file} (${sizeInKB} KB)`);
                });
                console.log('');
            }
        }
        
        console.log('\n✨ IMAGE REQUIREMENTS');
        console.log('═══════════════════════════════════════════════════════');
        console.log('Format: JPG (JPEG)');
        console.log('Aspect Ratio: 4:5 (e.g., 800×1000px)');
        console.log('File Size: < 200KB (recommended)');
        console.log('Background: White or neutral');
        console.log('Content: Product bottle ONLY (no lifestyle shots)');
        console.log('');
        console.log('Naming Convention:');
        console.log('  - "Product Name.JPG" → Default view');
        console.log('  - "Product Name(2).JPG" → Hover view');
        console.log('  - "Product Name(3).jpg" → Gallery view');
        console.log('');
        
        if (totalFound === totalExpected) {
            console.log('✅ All images found! Database and files are in sync.');
            console.log('\n⚠️  NOTE: Verify that physical images are product bottles (not lifestyle photos)');
        } else {
            console.log('❌ Some images are missing. Please add them to client/public/Images/');
        }
        
        console.log('\n📄 For detailed instructions, see: IMAGE_AUDIT_REPORT.md\n');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

checkImages();
