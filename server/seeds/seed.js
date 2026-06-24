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
            { url: '/Images/Alpine%20Savage.webp', alt: 'Alpine Savage - Main View' },
            { url: '/Images/Alpine%20Savage(2).webp', alt: 'Alpine Savage - Hover View' },
            { url: '/Images/Alpine%20Savage(3).webp', alt: 'Alpine Savage - Alternate View' },
        ],
        video: '/Video/Alpine%20Savage.mp4',
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
        moodProfile: ['Bold', 'Masculine', 'Daring'],
        bestFor: 'Evening events, formal occasions, high-stakes environments',
        perfumerNote: 'Alpine Savage opens with intent. There is nothing tentative about its first impression — a burst of fresh spice and warm amber that arrives the way a confident person does: noticed, immediately. This is not a fragrance that waits to be discovered. It announces itself.\n\nThe heart settles into musky, woody depth — layered, complex, the kind of scent that rewards proximity. Lavender and herbal undertones add precision to what could otherwise be pure brute force. This is the discipline inside the boldness.\n\nThe base is warm spice — not aggressive, but persistent. It is the note that lingers on a collar hours after the room has emptied. The note that someone remembers.',
        dryDown: "Alpine Savage's dry-down is where its true character emerges. The initial boldness softens into a warm spice accord that feels like a second skin — intimate, persistent, and deeply masculine. Hours later, the amber and musk create a signature that is unmistakably yours.",
        pairsWith: [
            { name: 'Royal Ascent', slug: 'royal-ascent', description: 'Layer at the collar for a commanding formal presence' },
            { name: 'Blue Dominion', slug: 'blue-dominion', description: 'Apply on the wrist for a bold-fresh contrast' },
        ],
        format: '10ml · Non-Alcoholic · Roll-On Attar · ₹499',
    },

    // ── 02 BLUE DOMINION ─────────────────────────────────────────────────────
    {
        name: 'Blue Dominion',
        brand: 'Swiss Garden Perfumes',
        description:
            "The quiet kind of confidence. The kind that doesn't explain itself.\n\nBlue Dominion opens with a fresh-spice and amber accord — modern, versatile, effortless. It is the fragrance for those who do not dress for the occasion so much as they make the occasion theirs. The opening is confident without being aggressive.\n\nA woody-musky core gives Blue Dominion its staying power and its depth. This is the fragrance that someone describes as \"clean but interesting\" — because the heart delivers both.\n\nWarm spice settles the composition — not demanding, but present. Blue Dominion closes with the quiet authority of someone who knows they have already made their impression.",
        shortDescription: 'Confident, fresh, modern luxury roll-on attar. Makes every occasion yours. 10ml · Non-Alcoholic · Long Lasting · ₹499.',
        metaDescription: 'Blue Dominion by Swiss Garden Perfumes — modern fresh-woody non-alcoholic roll-on attar. Confident, versatile, long-lasting. 10ml. ₹499.',
        wearFor: 'Everyday wear, office, casual outings, dates. Modern confidence that doesn\'t explain itself.',
        layeringStory: 'Layer with Alpine Savage at the collar for a bold-masculine statement, or with Glacier Splash on the wrist for a modern fresh-woody everyday pairing.',
        price: 499,
        images: [
            { url: '/Images/Blue%20Dominion.webp', alt: 'Blue Dominion - Main View' },
            { url: '/Images/Blue%20Dominion(2).webp', alt: 'Blue Dominion - Hover View' },
            { url: '/Images/Blue%20Dominion(3).webp', alt: 'Blue Dominion - Alternate View' },
        ],
        video: '/Video/Blue%20Dominion.mp4',
        category: 'Attar',
        gender: 'Men',
        size: '10ml',
        fragranceNotes: {
            top: ['Fresh Spice', 'Amber', 'Aromatic Accord'],
            middle: ['Woody', 'Musky', 'Herbal'],
            base: ['Warm Spice', 'Deep Amber', 'Clean Musk'],
        },
        fragranceFamily: 'Woody',
        stock: 100,
        featured: true,
        tags: ['fresh-woody', 'modern', 'versatile', 'daily', 'confident', 'masculine', 'attar', 'non-alcoholic', 'roll-on', 'bestseller'],
        concentration: 'Intense',
        longevity: '8-12 hours',
        sillage: 'Moderate',
        occasion: ['Day', 'Office', 'Casual', 'Date Night'],
        season: ['All Year'],
        moodProfile: ['Confident', 'Fresh', 'Modern'],
        bestFor: 'Everyday wear, office, casual outings, dates',
        perfumerNote: 'Blue Dominion opens confident — not aggressive, not loud, but unmistakably present. There is an aquatic quality to it, but warmer and deeper than simple freshness.\n\nAs it develops on skin, a complexity emerges — something woody underneath, something that grounds the brightness and gives it weight. This is the scent of potential.\n\nThe base settles into dark cedar and deep musk — persistent, assured, the kind of note that lingers in a room long after you\'ve left.',
        dryDown: 'The dry-down of Blue Dominion is where its depth truly reveals itself. The initial electric aquatic brightness gives way to dark cedar and warm resin, creating a scent trail that is both grounding and magnetic.',
        pairsWith: [
            { name: 'Alpine Savage', slug: 'alpine-savage', description: 'Layer at the collar for a bold-masculine statement' },
            { name: 'Glacier Splash', slug: 'glacier-splash', description: 'Apply on the wrist for a modern fresh-woody everyday pairing' },
        ],
        format: '10ml · Non-Alcoholic · Roll-On Attar · ₹499',
    },

    // ── 03 CITRUS REVERIE ────────────────────────────────────────────────────
    {
        name: 'Citrus Reverie',
        brand: 'Swiss Garden Perfumes',
        description:
            "Citrus Reverie opens the way the best mornings do — bright, clean, effortlessly optimistic. The citrus top note is vivid without being sharp, fresh without the synthetic edge that lesser formulas cannot avoid. It is the opening that makes someone in the same room ask what you are wearing. The heart drifts into herbal and musky warmth — the brightness becomes something more grounded, more considered. The base is warm and approachable — not demanding, not loud. The kind of scent that makes the end of a long day feel like the right place to be.",
        shortDescription: '"The scent of a morning that already has the answer."',
        metaDescription: 'Citrus Reverie by Swiss Garden Perfumes — fresh unisex non-alcoholic roll-on attar. Bright citrus, warm base, long-lasting. 10ml. ₹499.',
        wearFor: 'Mornings, casual days, travel, gifting',
        layeringStory: 'Pair with Glacier Splash on opposing pulse points for a fresh-bright daytime combination, or layer Swiss Flora at the wrist for a floral-citrus lift.',
        price: 499,
        images: [
            { url: '/Images/Citrus%20Reverie.webp', alt: 'Citrus Reverie - Main View' },
            { url: '/Images/Citrus%20Reverie(2).webp', alt: 'Citrus Reverie - Hover View' },
            { url: '/Images/Citrus%20Reverie(3).webp', alt: 'Citrus Reverie - Alternate View' },
        ],
        video: '/Video/Citrus%20Reverie.mp4',
        category: 'Attar',
        gender: 'Unisex',
        size: '10ml',
        fragranceNotes: {
            top: ['Vivid Citrus', 'Fresh Accord', 'Aromatic Lift'],
            middle: ['Herbal', 'Musky', 'Light Woody'],
            base: ['Warm Spice', 'Soft Amber'],
        },
        fragranceFamily: 'Citrus',
        stock: 100,
        featured: true,
        tags: ['bright', 'everyday', 'morning', 'gifting', 'unisex', 'attar', 'non-alcoholic', 'roll-on'],
        concentration: 'Intense',
        longevity: '8-12 hours',
        sillage: 'Moderate',
        occasion: ['Mornings', 'Casual Days', 'Travel', 'Gifting'],
        season: ['Spring', 'Summer', 'All Year'],
        moodProfile: ['Light', 'Uplifting', 'Playful'],
        bestFor: 'Mornings, casual days, travel, gifting',
        perfumerNote: 'Citrus Reverie opens the way the best mornings do — bright, clean, effortlessly optimistic. The citrus top note is vivid without being sharp, fresh without the synthetic edge that lesser formulas cannot avoid. It is the opening that makes someone in the same room ask what you are wearing.\n\nThe heart drifts into herbal and musky warmth — the brightness becomes something more grounded, more considered. This is where Citrus Reverie stops being just cheerful and starts being interesting.\n\nThe base is warm and approachable — not demanding, not loud. The kind of scent that makes the end of a long day feel like the right place to be.',
        dryDown: 'The dry-down of Citrus Reverie is warm and approachable. The bright citrus and herbal middle notes settle into a comforting base of warm spice and soft amber, making it the perfect close to a long day.',
        pairsWith: [
            { name: 'Glacier Splash', slug: 'glacier-splash', description: 'Pair on opposing pulse points for a fresh-bright daytime combination' },
            { name: 'Swiss Flora', slug: 'swiss-flora', description: 'Layer at the wrist for a floral-citrus lift' },
        ],
        format: '10ml · Non-Alcoholic · Roll-On Attar · ₹499',
    },

    // ── 04 ROYAL ASCENT ──────────────────────────────────────────────────────
    {
        name: 'Royal Ascent',
        brand: 'Swiss Garden Perfumes',
        description:
            "Royal Ascent opens with the measured confidence of someone who does not need to raise their voice. A citrus-aromatic accord — precise, structured, instantly recognisable as deliberate — announces a scent that knows exactly what it is. The heart is where the timelessness lives: lavender and herbal notes with a classical refinement that does not age. Warm spice anchors the composition — grounding the elegance, ensuring the scent closes with the same authority with which it opened.",
        shortDescription: '"Worn by those who have already arrived."',
        metaDescription: 'Royal Ascent by Swiss Garden Perfumes — premium classic aromatic non-alcoholic roll-on attar. Refined, commanding, timeless. 10ml. ₹499.',
        wearFor: 'Office, formal occasions, board meetings, celebrations',
        layeringStory: 'Layer with Alpine Savage for formal evening occasions requiring maximum presence, or with Swiss Flora for a refined day-to-evening transition.',
        price: 499,
        images: [
            { url: '/Images/Royal%20Ascent.webp', alt: 'Royal Ascent - Main View' },
            { url: '/Images/Royal%20Ascent(2).webp', alt: 'Royal Ascent - Hover View' },
            { url: '/Images/Royal%20Ascent(3).webp', alt: 'Royal Ascent - Alternate View' },
        ],
        video: '/Video/Royal%20Ascent.mp4',
        category: 'Attar',
        gender: 'Unisex',
        size: '10ml',
        fragranceNotes: {
            top: ['Citrus', 'Aromatic Accord', 'Fresh Spice'],
            middle: ['Lavender', 'Herbal', 'Musky'],
            base: ['Warm Spice', 'Amber', 'Woody Depth'],
        },
        fragranceFamily: 'Oriental',
        stock: 100,
        featured: true,
        tags: ['classic', 'office', 'occasion', 'timeless', 'unisex', 'attar', 'non-alcoholic', 'roll-on'],
        concentration: 'Intense',
        longevity: '8-12 hours',
        sillage: 'Strong',
        occasion: ['Office', 'Occasions', 'Meetings', 'Celebrations'],
        season: ['Fall', 'Winter', 'All Year'],
        moodProfile: ['Refined', 'Commanding', 'Timeless'],
        bestFor: 'Office, formal occasions, board meetings, celebrations',
        perfumerNote: 'Royal Ascent opens with the measured confidence of someone who does not need to raise their voice. A citrus-aromatic accord — precise, structured, instantly recognisable as deliberate — announces a scent that knows exactly what it is.\n\nThe heart is where the timelessness lives: lavender and herbal notes with a classical refinement that does not age. This is not a trend. This is a standard.\n\nWarm spice anchors the composition — grounding the elegance, ensuring the scent closes with the same authority with which it opened. The finish is the measure of a fragrance. Royal Ascent finishes well.',
        dryDown: "Royal Ascent's dry-down is grounding and authoritative. The lavender and herbal heart notes transition smoothly into a lingering base of warm spice, amber, and woody depth — leaving a commanding, timeless impression.",
        pairsWith: [
            { name: 'Alpine Savage', slug: 'alpine-savage', description: 'Layer for formal evening occasions requiring maximum presence' },
            { name: 'Swiss Flora', slug: 'swiss-flora', description: 'Pair for a refined day-to-evening transition' },
        ],
        format: '10ml · Non-Alcoholic · Roll-On Attar · ₹499',
    },

    // ── 05 SWISS FLORA ───────────────────────────────────────────────────────
    {
        name: 'Swiss Flora',
        brand: 'Swiss Garden Perfumes',
        description:
            "Elegance does not announce itself. It is simply present.\n\nSwiss Flora opens with aromatic clarity — a citrus-herbal accord that is immediately refined, immediately feminine without being delicate. There is structure here from the first note.\n\nThe heart is where Swiss Flora earns its name: lavender and herbal florals in a composition that is not overwhelming, not shy, but precise. Each note occupies its space without competing. This is what formulated elegance smells like.\n\nA soft warm-spice base — the florals settle, the fragrance becomes quieter, closer to the skin. Swiss Flora in its base note is a secret shared between the wearer and whoever stands close enough to notice.",
        shortDescription: 'Elegant, floral, serene luxury roll-on attar. Refined without being delicate. 10ml · Non-Alcoholic · Long Lasting · ₹499.',
        metaDescription: 'Swiss Flora by Swiss Garden Perfumes — premium floral non-alcoholic roll-on attar for women. Warm, romantic, long-lasting. 10ml. ₹499. Perfect gift.',
        wearFor: 'Formal gifting, celebrations, evenings, special occasions. Elegant presence without announcement.',
        layeringStory: 'Layer with Royal Ascent for Garden Royale — floral-dark contrast that is romantic and authoritative simultaneously. Pair with Citrus Reverie for warmth and brightness like a garden in peak summer.',
        price: 499,
        images: [
            { url: '/Images/Swiss%20Flora.webp', alt: 'Swiss Flora - Main View' },
            { url: '/Images/Swiss%20Flora(2).webp', alt: 'Swiss Flora - Hover View' },
            { url: '/Images/Swiss%20Flora(3).webp', alt: 'Swiss Flora - Alternate View' },
        ],
        video: '/Video/Swiss%20Flora.mp4',
        category: 'Attar',
        gender: 'Unisex',
        size: '10ml',
        fragranceNotes: {
            top: ['Aromatic Citrus', 'Fresh Herbal', 'Light Spice'],
            middle: ['Lavender', 'Floral Accord', 'Herbal Depth'],
            base: ['Warm Spice', 'Soft Amber', 'Light Musk'],
        },
        fragranceFamily: 'Floral',
        stock: 100,
        featured: true,
        tags: ['floral', 'elegant', 'gifting', 'unisex', 'formal', 'attar', 'non-alcoholic', 'roll-on', 'bestseller'],
        concentration: 'Intense',
        longevity: '8-12 hours',
        sillage: 'Moderate',
        occasion: ['Day', 'Date Night', 'Celebrations', 'Gift'],
        season: ['Spring', 'Summer', 'All Year'],
        moodProfile: ['Elegant', 'Floral', 'Serene'],
        bestFor: 'Formal gifting, celebrations, evenings, special occasions',
        perfumerNote: 'Swiss Flora opens floral — genuinely, beautifully, unashamedly floral. Not the synthetic floral of mass-market femininity. The real thing.\n\nThe kind of floral that has depth underneath it, warmth that anchors the brightness, a complexity that reveals itself only to people close enough to notice.\n\nThis is the fragrance for the knowing romantic. The one who has seen enough of the world to know that softness is not weakness.',
        dryDown: "Swiss Flora's dry-down is pure warmth. The bright florals gently recede as warm musk and soft amber take center stage — creating an intimate, comforting base that lingers close to the skin.",
        pairsWith: [
            { name: 'Royal Ascent', slug: 'royal-ascent', description: 'Layer for Garden Royale — floral-dark contrast that is both romantic and authoritative' },
            { name: 'Citrus Reverie', slug: 'citrus-reverie', description: 'Pair for warmth and brightness like a garden in peak summer' },
        ],
        format: '10ml · Non-Alcoholic · Roll-On Attar · ₹499',
    },

    // ── 06 GLACIER SPLASH ────────────────────────────────────────────────────
    {
        name: 'Glacier Splash',
        brand: 'Swiss Garden Perfumes',
        description:
            "Glacier Splash opens with the kind of freshness that feels like a decision. Marine and minty top notes — clean, cool, immediate — not a soft suggestion but a definitive start. It is the fragrance of someone who already knows what the day requires. The heart softens into lavender-floral notes — the aquatic edge remains, but there is now warmth underneath it. Clean musk and amber close a composition that never loses its clarity.",
        shortDescription: '"Clarity, without compromise."',
        metaDescription: 'Glacier Splash by Swiss Garden Perfumes — premium aquatic fresh non-alcoholic roll-on attar. Cool, revitalising, long-lasting. 10ml. ₹499.',
        wearFor: 'Summer, morning routines, gym, travel, outdoor',
        layeringStory: 'Pair with Citrus Reverie for the lightest, brightest daytime pairing in the collection, or with Blue Dominion for a fresh-woody contrast that carries through the evening.',
        price: 499,
        images: [
            { url: '/Images/Glacier%20Splash.webp', alt: 'Glacier Splash - Main View' },
            { url: '/Images/Glacier%20Splash(2).webp', alt: 'Glacier Splash - Hover View' },
            { url: '/Images/Glacier%20Splash(3).webp', alt: 'Glacier Splash - Alternate View' },
        ],
        video: '/Video/Glacier%20Splash.mp4',
        category: 'Attar',
        gender: 'Unisex',
        size: '10ml',
        fragranceNotes: {
            top: ['Marine Accord', 'Mint', 'Fresh Citrus'],
            middle: ['Lavender', 'Floral', 'Light Aquatic'],
            base: ['Clean Musk', 'Amber', 'Soft Wood'],
        },
        fragranceFamily: 'Aquatic',
        stock: 100,
        featured: true,
        tags: ['aquatic', 'summer', 'fresh', 'active', 'unisex', 'attar', 'non-alcoholic', 'roll-on'],
        concentration: 'Intense',
        longevity: '8-12 hours',
        sillage: 'Moderate',
        occasion: ['Summer', 'Mornings', 'Gym', 'Travel', 'Outdoor'],
        season: ['Spring', 'Summer', 'All Year'],
        moodProfile: ['Cool', 'Aquatic', 'Revitalising'],
        bestFor: 'Summer, morning routines, gym, travel, outdoor',
        perfumerNote: 'Glacier Splash opens with the kind of freshness that feels like a decision. Marine and minty top notes — clean, cool, immediate — not a soft suggestion but a definitive start. It is the fragrance of someone who already knows what the day requires.\n\nThe heart softens into lavender-floral notes — the aquatic edge remains, but there is now warmth underneath it. The contrast is intentional: the discipline of cold water and the ease of a floral centre.\n\nClean musk and amber close a composition that never loses its clarity. Glacier Splash does not trail off — it resolves. The base is as deliberate as the opening.',
        dryDown: 'The dry-down of Glacier Splash resolves cleanly. The bracing marine and minty notes settle into a soft, lasting base of clean musk, warm amber, and soft woods, maintaining its refreshing character throughout the wear.',
        pairsWith: [
            { name: 'Citrus Reverie', slug: 'citrus-reverie', description: 'Pair for the lightest, brightest daytime pairing in the collection' },
            { name: 'Blue Dominion', slug: 'blue-dominion', description: 'Layer for a fresh-woody contrast that carries through the evening' },
        ],
        format: '10ml · Non-Alcoholic · Roll-On Attar · ₹499',
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
