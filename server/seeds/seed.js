import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Product from '../models/Product.js';
import User from '../models/User.js';

dotenv.config();

const products = [
    // ── 01 ALPINE SAVAGE ─────────────────────────────────────────────────────
    {
        name: 'Alpine Savage',
        brand: 'Swiss Garden Perfumes',
        description:
            "For the one who doesn't need to announce himself. There is a kind of confidence that doesn't speak. It simply stands in the room and lets the room adjust. Alpine Savage was built for that person. Above the treeline, where the air loses its softness and becomes something honest — cold, mineral, alive — that is where this fragrance begins. It opens with the sharpness of frozen alpine air and dark wood, the kind of wood that has survived decades of mountain winters and grown stronger for it. As it settles into your skin, something deeper emerges. A warmth underneath the cold. A quiet intensity that refuses to fade. This is not a fragrance that tries to please everyone. It was never meant to. It was built for the person who has stopped trying to please everyone — and found, in that decision, a particular kind of freedom.",
        shortDescription: 'Bold woody masculine roll-on attar. Commands attention effortlessly. 10ml · Non-Alcoholic · Long Lasting · ₹499.',
        metaDescription: 'Alpine Savage by Swiss Garden Perfumes — luxury non-alcoholic roll-on attar for men. Woody, dark, long-lasting. 10ml. ₹499.',
        wearFor: 'Evening. The first impression that becomes a lasting one. Every moment you walk into a room and need it to know you were there.',
        layeringStory: 'Alpine Savage is the foundation. The anchor. Layer it beneath Glacier Splash for a cold-water sharpness. Pair it with Royal Ascent for something deep beyond naming.',
        price: 499,
        images: [
            { url: '/Images/Alpine Savage.JPG', alt: 'Alpine Savage - Main View' },
            { url: '/Images/Alpine Savage(2).JPG', alt: 'Alpine Savage - Hover View' },
            { url: '/Images/Alpine Savage(3).jpg', alt: 'Alpine Savage - Alternate View' },
        ],
        video: '/Video/Alpine Savage.mp4',
        category: 'Attar',
        gender: 'Men',
        size: '10ml',
        fragranceNotes: {
            top: ['Frozen Alpine Air', 'Dark Wood', 'Cold Mineral'],
            middle: ['Aged Wood', 'Mountain Accord', 'Dark Resin'],
            base: ['Warm Amber', 'Deep Musk', 'Earthy Vetiver'],
        },
        fragranceFamily: 'Woody',
        stock: 100,
        featured: true,
        tags: ['woody', 'masculine', 'bold', 'commanding', 'evening', 'attar', 'non-alcoholic', 'roll-on', 'bestseller'],
        concentration: 'Intense',
        longevity: '8-12 hours',
        sillage: 'Strong',
        occasion: ['Evening', 'Date Night', 'Special Occasion', 'Office'],
        season: ['Fall', 'Winter', 'All Year'],
    },

    // ── 02 BLUE DOMINION ─────────────────────────────────────────────────────
    {
        name: 'Blue Dominion',
        brand: 'Swiss Garden Perfumes',
        description:
            "This is the scent of someone who has stopped apologising for who they are. There is a color that exists for only a few minutes each evening. The moment between dusk and dark, when the sky over open water turns electric — not quite blue, not quite grey, not quite anything that has a name. It is the color of potential. Of someone standing at the edge of something large, completely unafraid. Blue Dominion lives in that color. It opens confident — not aggressive, not loud, but unmistakably present. There is an aquatic quality to it, but warmer and deeper than simple freshness. As it develops on skin, a complexity emerges — something woody underneath, something that grounds the brightness and gives it weight. This fragrance is for the person who has done the work. Who has figured out, through trial and correction, exactly who they are. Who no longer needs the world's permission to take up space.",
        shortDescription: 'Electric, deep, completely assured luxury roll-on for the unapologetic. 10ml · Non-Alcoholic · Long Lasting · ₹499.',
        metaDescription: 'Blue Dominion by Swiss Garden Perfumes — premium aquatic woody non-alcoholic roll-on attar. Confident, long-lasting, layerable. 10ml. ₹499.',
        wearFor: 'Evenings with intention. Travel. The moments you decide — consciously, deliberately — to be exactly yourself.',
        layeringStory: 'Layer over Royal Ascent for The Boardroom — a combination so assured it could close deals on its own. Add Glacier Splash for Blue Ice — cold, deep, electric, unlike anything else in Indian perfumery.',
        price: 499,
        images: [
            { url: '/Images/Blue Dominion.JPG', alt: 'Blue Dominion - Main View' },
            { url: '/Images/Blue Dominion(2).JPG', alt: 'Blue Dominion - Hover View' },
            { url: '/Images/Blue Dominion(3).jpg', alt: 'Blue Dominion - Alternate View' },
        ],
        video: '/Video/Blue Dominion.mp4',
        category: 'Attar',
        gender: 'Men',
        size: '10ml',
        fragranceNotes: {
            top: ['Electric Aquatic', 'Sea Accord', 'Crisp Air'],
            middle: ['Blue Woods', 'Spiced Amber', 'Vetiver'],
            base: ['Dark Cedar', 'Deep Musk', 'Warm Resin'],
        },
        fragranceFamily: 'Aquatic',
        stock: 100,
        featured: true,
        tags: ['aquatic', 'woody', 'confident', 'electric', 'evening', 'masculine', 'attar', 'non-alcoholic', 'roll-on', 'bestseller'],
        concentration: 'Intense',
        longevity: '8-12 hours',
        sillage: 'Strong',
        occasion: ['Evening', 'Date Night', 'Travel', 'Special Occasion'],
        season: ['All Year'],
    },

    // ── 03 CITRUS REVERIE ────────────────────────────────────────────────────
    {
        name: 'Citrus Reverie',
        brand: 'Swiss Garden Perfumes',
        description:
            "The scent of a morning that has already decided to be good. Not every fragrance needs to be complicated. Some of the most powerful things in the world are simple — morning light through a window, the first sip of something warm, the particular feeling of a day that hasn't gone wrong yet. Citrus Reverie is that feeling, concentrated and applied to skin. It opens bright — genuinely, unashamedly bright. The kind of citrus that doesn't apologize for its optimism. Fresh without being harsh. Energizing without the edge. As the top notes lift away, a warmth settles underneath — soft, golden, the kind of base that turns a good mood into a full-body experience. This is the fragrance for people who believe — despite everything — that today might actually be extraordinary. Wear it and mean it.",
        shortDescription: 'Bright, warm, endlessly wearable unisex roll-on attar. Makes any day feel like a good one. 10ml · Non-Alcoholic · Long Lasting · ₹499.',
        metaDescription: 'Citrus Reverie by Swiss Garden Perfumes — fresh unisex non-alcoholic roll-on attar. Bright citrus, warm base, long-lasting. 10ml. ₹499.',
        wearFor: 'Morning rituals. Office days. Weekends. Every occasion where you want your presence to feel like sunshine.',
        layeringStory: 'Citrus Reverie is your middle layer. Layer it over Glacier Splash for a cold-citrus combination. Add Swiss Flora beneath it for warmth and unexpected depth.',
        price: 499,
        images: [
            { url: '/Images/Citrus Reverie.JPG', alt: 'Citrus Reverie - Main View' },
            { url: '/Images/Citrus Reverie(2).JPG', alt: 'Citrus Reverie - Hover View' },
            { url: '/Images/Citrus Reverie(3).jpg', alt: 'Citrus Reverie - Alternate View' },
        ],
        video: '/Video/Citrus Reverie.mp4',
        category: 'Attar',
        gender: 'Unisex',
        size: '10ml',
        fragranceNotes: {
            top: ['Bright Citrus', 'Lemon Zest', 'Bergamot'],
            middle: ['Orange Blossom', 'White Tea', 'Neroli'],
            base: ['Golden Amber', 'Soft Musk', 'Warm Woods'],
        },
        fragranceFamily: 'Citrus',
        stock: 100,
        featured: true,
        tags: ['citrus', 'fresh', 'bright', 'unisex', 'daily-wear', 'office', 'attar', 'non-alcoholic', 'roll-on'],
        concentration: 'Intense',
        longevity: '8-12 hours',
        sillage: 'Moderate',
        occasion: ['Day', 'Office', 'Casual', 'Morning'],
        season: ['Spring', 'Summer', 'All Year'],
    },

    // ── 04 ROYAL ASCENT ──────────────────────────────────────────────────────
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
            { url: '/Images/Royal Ascent(3).jpg', alt: 'Royal Ascent - Alternate View' },
        ],
        video: '/Video/Royal Ascent.mp4',
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

    // ── 05 SWISS FLORA ───────────────────────────────────────────────────────
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
            { url: '/Images/Swiss Flora(3).jpg', alt: 'Swiss Flora - Alternate View' },
        ],
        video: '/Video/Swiss Flora.mp4',
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

    // ── 06 GLACIER SPLASH ────────────────────────────────────────────────────
    {
        name: 'Glacier Splash',
        brand: 'Swiss Garden Perfumes',
        description:
            "Clean is not simple. Clean is the hardest thing to get right. There is a particular shock of clarity that happens when glacial water meets warm skin. Not cold for its own sake. Not clean as an absence of complexity. But clean as the highest form of precision — every unnecessary thing removed, every essential thing present, nothing wasted. Glacier Splash was built around that moment. It opens with an aquatic clarity that is immediate and completely honest. No tricks. No layers hiding behind layers. Just the pure, physical sensation of something impossibly clean. As it settles, a subtle warmth emerges — because even glacial water carries heat when it meets something alive. This is the fragrance for people who have nothing to hide. Who have done the work, who know who they are, and who no longer need complexity to prove it. Simplicity, when it's this precise, is its own kind of power.",
        shortDescription: 'Pure aquatic, relentlessly clean unisex roll-on attar. Glacial clarity for every day. 10ml · Non-Alcoholic · Long Lasting · ₹499.',
        metaDescription: 'Glacier Splash by Swiss Garden Perfumes — fresh aquatic non-alcoholic unisex roll-on attar. Clean, long-lasting, layerable. 10ml. ₹499.',
        wearFor: 'Active days. Gym to office. The morning after a great night. Summer. Every moment when you want to feel as clean as you actually are.',
        layeringStory: 'Glacier Splash is your top layer. Layer over Alpine Savage for The Arctic King — cold on dark, sharp on deep. Add to Citrus Reverie for a relentlessly fresh pairing.',
        price: 499,
        images: [
            { url: '/Images/Glacier Splash.JPG', alt: 'Glacier Splash - Main View' },
            { url: '/Images/Glacier Splash(2).JPG', alt: 'Glacier Splash - Hover View' },
            { url: '/Images/Glacier Splash(3).JPG', alt: 'Glacier Splash - Alternate View' },
        ],
        video: '/Video/Glacier Splash.mp4',
        category: 'Attar',
        gender: 'Unisex',
        size: '10ml',
        fragranceNotes: {
            top: ['Glacial Water', 'Marine Accord', 'Arctic Air'],
            middle: ['Aquatic Accord', 'Clean Woods', 'White Musk'],
            base: ['Warm Skin Accord', 'Soft Amber', 'White Cedar'],
        },
        fragranceFamily: 'Aquatic',
        stock: 100,
        featured: true,
        tags: ['aquatic', 'clean', 'fresh', 'unisex', 'daily-wear', 'summer', 'attar', 'non-alcoholic', 'roll-on'],
        concentration: 'Intense',
        longevity: '8-12 hours',
        sillage: 'Moderate',
        occasion: ['Day', 'Casual', 'Office', 'Active'],
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
