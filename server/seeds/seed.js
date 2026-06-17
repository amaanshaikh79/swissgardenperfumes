import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Product from '../models/Product.js';
import User from '../models/User.js';

dotenv.config();

const products = [
    // ── 01 ROYAL ASCENT ──────────────────────────────────────────────────────
    {
        name: 'Royal Ascent',
        brand: 'Swiss Garden Perfumes',
        description:
            "Power doesn't announce itself. It reveals itself slowly to those paying attention. There is a kind of luxury that only reveals itself over time. You meet it briefly — intriguing, complex, impossible to fully understand in a first encounter. It stays with you. You find yourself thinking about it later, unable to quite place what made it extraordinary. And then it arrives again, and you understand. Royal Ascent is that experience. It opens with depth — rich, architectural, the kind of opening note that tells you immediately this is not a simple fragrance. There is something oud-adjacent in its character, a darkness that isn't heavy but is undeniably present. As it breathes on skin, it climbs. Layers emerge. A warmth. A mystery underneath the mystery. This fragrance was built for patience. For people who understand that the best things reveal themselves slowly. For the ones playing the long game.",
        shortDescription: 'Deep, mysterious, architectural luxury roll-on attar. Reveals itself slowly and stays forever. 10ml · Non-Alcoholic · Long Lasting · ₹499.',
        metaDescription: 'Royal Ascent by Swiss Garden Perfumes — premium woody oud-inspired non-alcoholic roll-on attar. Deep, long-lasting, layerable. 10ml. ₹499.',
        wearFor: 'Important evenings. The first meeting with someone who matters. Every moment that deserves a fragrance equal to its significance.',
        layeringStory: 'Layer Blue Dominion above Royal Ascent for a combination so confident it has its own gravitational field. Add Swiss Flora for a floral-dark contrast called The Royale.',
        price: 499,
        images: [
            { url: '/Images/Royal Ascent.JPG', alt: 'Royal Ascent - Main View' },
            { url: '/Images/Royal Ascent(2).JPG', alt: 'Royal Ascent - Hover View' },
        ],
        category: 'Attar',
        gender: 'Unisex',
        size: '10ml',
        fragranceNotes: {
            top: ['Dark Oud', 'Rich Resin', 'Black Pepper'],
            middle: ['Aged Wood', 'Smoky Amber', 'Deep Spice'],
            base: ['Sandalwood', 'Dark Musk', 'Warm Vanilla'],
        },
        fragranceFamily: 'Oriental',
        stock: 100,
        featured: true,
        tags: ['oud', 'deep', 'mysterious', 'magnetic', 'evening', 'luxury', 'attar', 'non-alcoholic', 'roll-on', 'bestseller'],
        concentration: 'Intense',
        longevity: '8-12 hours',
        sillage: 'Strong',
        occasion: ['Evening', 'Special Occasion', 'Date Night'],
        season: ['Fall', 'Winter'],
    },

    // ── 02 SWISS FLORA ───────────────────────────────────────────────────────
    {
        name: 'Swiss Flora',
        brand: 'Swiss Garden Perfumes',
        description:
            "The most powerful thing in the world is something that makes others feel seen. There is a particular quality to alpine flowers. They bloom briefly, in conditions most flowers refuse to survive — high altitude, thin air, cold that doesn't fully leave even in summer. And perhaps because of those conditions, because existence is not guaranteed, they bloom with a completeness and intensity that flatland flowers never quite achieve. Swiss Flora was built around that quality. It opens floral — genuinely, beautifully, unashamedly floral. Not the synthetic floral of mass-market femininity. The real thing. The kind of floral that has depth underneath it, warmth that anchors the brightness, a complexity that reveals itself only to people close enough to notice. This is the fragrance for the romantic. Not the naive romantic — the knowing one. The one who has seen enough of the world to know that softness is not weakness. That warmth is not vulnerability.",
        shortDescription: 'Warm, floral, deeply romantic luxury roll-on for women. Meet the world with intention. 10ml · Non-Alcoholic · Long Lasting · ₹499.',
        metaDescription: 'Swiss Flora by Swiss Garden Perfumes — premium floral non-alcoholic roll-on attar for women. Warm, romantic, long-lasting. 10ml. ₹499. Perfect gift.',
        wearFor: 'Dates that matter. Celebrations. Gifting. Every day you decide to meet the world with warmth instead of armour.',
        layeringStory: 'Layer with Royal Ascent for Garden Royale — floral-dark contrast that is romantic and authoritative simultaneously. Pair with Citrus Reverie for warmth and brightness like a garden in peak summer.',
        price: 499,
        images: [
            { url: '/Images/Swiss Flora.JPG', alt: 'Swiss Flora - Main View' },
            { url: '/Images/Swiss Flora(2).JPG', alt: 'Swiss Flora - Hover View' },
        ],
        category: 'Attar',
        gender: 'Women',
        size: '10ml',
        fragranceNotes: {
            top: ['Alpine Rose', 'White Floral', 'Bergamot'],
            middle: ['Mountain Flowers', 'Jasmine', 'Peony'],
            base: ['Warm Musk', 'Soft Amber', 'Sandalwood'],
        },
        fragranceFamily: 'Floral',
        stock: 100,
        featured: true,
        tags: ['floral', 'romantic', 'feminine', 'warm', 'gift', 'attar', 'non-alcoholic', 'roll-on', 'bestseller'],
        concentration: 'Intense',
        longevity: '8-12 hours',
        sillage: 'Moderate',
        occasion: ['Day', 'Date Night', 'Celebrations', 'Gift'],
        season: ['Spring', 'Summer', 'All Year'],
    },
];

const adminUser = {
    firstName: 'Admin',
    lastName: 'swissgarden',
    email: 'adnanshaikh07@gmail.com',
    password: 'Admin@123',
    role: 'admin',
};

const demoUser = {
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya@example.com',
    password: 'Demo@123',
    role: 'user',
};

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/swissgarden-perfumes');
        console.log('✨ Connected to MongoDB');

        // Clear existing data
        await Product.deleteMany({});
        await User.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Create users
        const admin = await User.create(adminUser);
        const user = await User.create(demoUser);
        console.log('👤 Created admin and demo users');
        console.log(`   Admin: ${adminUser.email} / ${adminUser.password}`);
        console.log(`   Demo:  ${demoUser.email} / ${demoUser.password}`);

        // Create products with sample reviews
        for (const productData of products) {
            const product = await Product.create(productData);

            // Add sample reviews to featured products
            if (product.featured) {
                const reviewTexts = [
                    { title: 'Absolutely amazing!', comment: 'Better than expected for this price. Lasts 8+ hours easily. Already reordered!' },
                    { title: 'Best attar in India', comment: 'My friends thought I was wearing a ₹8000 perfume. The quality is incredible for the price. COD made it easy to try.' },
                    { title: 'Compliment magnet', comment: 'Got so many compliments at work. The projection is perfect and it lasts all day. Will definitely buy the full collection.' },
                ];

                const selectedReview = reviewTexts[Math.floor(Math.random() * reviewTexts.length)];

                product.reviews.push({
                    user: user._id,
                    rating: Math.floor(Math.random() * 2) + 4, // 4 or 5
                    title: selectedReview.title,
                    comment: selectedReview.comment,
                });
                product.calculateAverageRating();
                await product.save();
            }
        }
        console.log(`🌹 Created ${products.length} product(s)`);

        console.log('\n✅ Database seeded successfully!\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
};

seedDatabase();
