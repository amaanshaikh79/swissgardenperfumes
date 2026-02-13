import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Product from '../models/Product.js';
import User from '../models/User.js';

dotenv.config();

const products = [
    {
        name: 'Royal Oud Noir',
        brand: 'GoldenBuck',
        description:
            'An opulent masterpiece that opens with a burst of Italian bergamot and pink pepper, flowing into a heart of rare Laotian oud and Damascus rose. The base rests on a foundation of aged sandalwood, amber, and Venezuelan tonka bean. This is a fragrance that commands attention and leaves an indelible impression — a true symbol of luxury and refinement.',
        shortDescription: 'A majestic oud fragrance with rose, sandalwood, and amber',
        price: 289.0,
        compareAtPrice: 350.0,
        images: [
            { url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800', alt: 'Royal Oud Noir' },
        ],
        category: 'Eau de Parfum',
        gender: 'Unisex',
        size: '100ml',
        fragranceNotes: {
            top: ['Bergamot', 'Pink Pepper', 'Saffron'],
            middle: ['Oud', 'Damascus Rose', 'Jasmine'],
            base: ['Sandalwood', 'Amber', 'Tonka Bean'],
        },
        fragranceFamily: 'Oriental',
        stock: 45,
        featured: true,
        tags: ['luxury', 'oud', 'bestseller', 'unisex'],
        concentration: 'Strong',
        longevity: '12+ hours',
        sillage: 'Enormous',
        occasion: ['Evening', 'Special Occasion', 'Date Night'],
        season: ['Fall', 'Winter'],
    },
    {
        name: 'Velvet Rose & Iris',
        brand: 'GoldenBuck',
        description:
            'A sophisticated floral symphony that captures the essence of an English garden at twilight. Velvety Turkish rose petals intertwine with powdery Florentine iris, while a whisper of violet leaf adds depth and mystery. The dry-down reveals rich suede, musk, and a touch of patchouli, creating a scent that is both romantic and modern.',
        shortDescription: 'Elegant rose and iris blend with suede undertones',
        price: 245.0,
        images: [
            { url: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800', alt: 'Velvet Rose & Iris' },
        ],
        category: 'Eau de Parfum',
        gender: 'Women',
        size: '75ml',
        fragranceNotes: {
            top: ['Violet Leaf', 'Bergamot', 'Blackcurrant'],
            middle: ['Turkish Rose', 'Iris', 'Peony'],
            base: ['Suede', 'Musk', 'Patchouli'],
        },
        fragranceFamily: 'Floral',
        stock: 60,
        featured: true,
        tags: ['floral', 'elegant', 'feminine', 'romantic'],
        concentration: 'Moderate',
        longevity: '8-12 hours',
        sillage: 'Moderate',
        occasion: ['Day', 'Office', 'Date Night'],
        season: ['Spring', 'Summer'],
    },
    {
        name: 'Midnight Amber Absolute',
        brand: 'GoldenBuck',
        description:
            'Step into the mystique of the night with this captivating amber fragrance. Rich labdanum and fossilized amber meld with exotic spices — cardamom, nutmeg, and star anise — creating an intoxicating warmth. The base reveals smoky benzoin, vanilla absolute, and a whisper of leather, evoking moonlit soirées and whispered secrets.',
        shortDescription: 'Deep amber with exotic spices and smoky warmth',
        price: 320.0,
        compareAtPrice: 380.0,
        images: [
            { url: 'https://images.unsplash.com/photo-1594035910387-fea081fdd6b6?w=800', alt: 'Midnight Amber Absolute' },
        ],
        category: 'Parfum',
        gender: 'Unisex',
        size: '50ml',
        fragranceNotes: {
            top: ['Cardamom', 'Star Anise', 'Pink Pepper'],
            middle: ['Labdanum', 'Amber', 'Nutmeg'],
            base: ['Benzoin', 'Vanilla Absolute', 'Leather'],
        },
        fragranceFamily: 'Oriental',
        stock: 30,
        featured: true,
        tags: ['amber', 'spicy', 'intense', 'evening'],
        concentration: 'Intense',
        longevity: '12+ hours',
        sillage: 'Strong',
        occasion: ['Evening', 'Special Occasion'],
        season: ['Fall', 'Winter'],
    },
    {
        name: 'Côte d\'Azur Aqua',
        brand: 'GoldenBuck',
        description:
            'Inspired by the sun-drenched coastline of the French Riviera, this refreshing scent evokes lazy summer days on a private yacht. Sparkling Sicilian lemon and marine accord dance with aromatic lavender and geranium. A base of white cedarwood and ambergris provides a clean, sophisticated finish that lingers like a sea breeze.',
        shortDescription: 'Fresh aquatic fragrance inspired by the French Riviera',
        price: 195.0,
        images: [
            { url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800', alt: "Côte d'Azur Aqua" },
        ],
        category: 'Eau de Toilette',
        gender: 'Men',
        size: '100ml',
        fragranceNotes: {
            top: ['Sicilian Lemon', 'Marine Accord', 'Grapefruit'],
            middle: ['Lavender', 'Geranium', 'Violet Leaf'],
            base: ['White Cedar', 'Ambergris', 'White Musk'],
        },
        fragranceFamily: 'Aquatic',
        stock: 80,
        featured: true,
        tags: ['fresh', 'summer', 'aquatic', 'casual'],
        concentration: 'Light',
        longevity: '4-6 hours',
        sillage: 'Moderate',
        occasion: ['Day', 'Casual', 'Beach', 'Office'],
        season: ['Spring', 'Summer'],
    },
    {
        name: 'Noir de Nuit',
        brand: 'GoldenBuck',
        description:
            'A dark and seductive fragrance for the modern gentleman. Italian bergamot and black pepper create a powerful opening, giving way to a heart of oud, vetiver, and dark chocolate. The base notes of Indonesian patchouli, castoreum, and civet create an animalic warmth that is both dangerous and irresistible.',
        shortDescription: 'Dark, seductive blend of oud, chocolate, and vetiver',
        price: 275.0,
        compareAtPrice: 330.0,
        images: [
            { url: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800', alt: 'Noir de Nuit' },
        ],
        category: 'Eau de Parfum',
        gender: 'Men',
        size: '100ml',
        fragranceNotes: {
            top: ['Bergamot', 'Black Pepper', 'Elemi'],
            middle: ['Oud', 'Vetiver', 'Dark Chocolate'],
            base: ['Patchouli', 'Castoreum', 'Atlas Cedar'],
        },
        fragranceFamily: 'Woody',
        stock: 55,
        featured: true,
        tags: ['dark', 'masculine', 'seductive', 'woody'],
        concentration: 'Strong',
        longevity: '8-12 hours',
        sillage: 'Strong',
        occasion: ['Evening', 'Date Night', 'Special Occasion'],
        season: ['Fall', 'Winter'],
    },
    {
        name: 'Jardin de Versailles',
        brand: 'GoldenBuck',
        description:
            'A regal floral masterpiece inspired by the gardens of Versailles. Dewy lily of the valley and hyacinth open the composition, leading to a voluptuous heart of Grasse tuberose and gardenia. The velvety base of orris butter, white musk, and cashmere wood creates an aura of refined aristocratic elegance.',
        shortDescription: 'A regal floral journey through the gardens of Versailles',
        price: 265.0,
        images: [
            { url: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800', alt: 'Jardin de Versailles' },
        ],
        category: 'Eau de Parfum',
        gender: 'Women',
        size: '50ml',
        fragranceNotes: {
            top: ['Lily of the Valley', 'Hyacinth', 'Green Apple'],
            middle: ['Tuberose', 'Gardenia', 'Ylang-Ylang'],
            base: ['Orris', 'White Musk', 'Cashmere Wood'],
        },
        fragranceFamily: 'Floral',
        stock: 40,
        featured: true,
        tags: ['floral', 'elegant', 'luxurious', 'feminine'],
        concentration: 'Moderate',
        longevity: '6-8 hours',
        sillage: 'Moderate',
        occasion: ['Day', 'Office', 'Garden Party'],
        season: ['Spring', 'Summer'],
    },
    {
        name: 'Santal Sacré',
        brand: 'GoldenBuck',
        description:
            'A meditative journey to ancient temples, where sacred Indian sandalwood has been burned for centuries. Creamy Australian sandalwood is enriched with warm cardamom and smoky incense. The base reveals liquid gold — a blend of Mysore sandalwood, cedarwood, and a touch of vanilla that creates an almost spiritual serenity.',
        shortDescription: 'Sacred sandalwood meditation with incense and vanilla',
        price: 310.0,
        images: [
            { url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800', alt: 'Santal Sacré' },
        ],
        category: 'Parfum',
        gender: 'Unisex',
        size: '75ml',
        fragranceNotes: {
            top: ['Cardamom', 'Pink Pepper', 'Bergamot'],
            middle: ['Incense', 'Iris', 'Violet'],
            base: ['Sandalwood', 'Cedarwood', 'Vanilla'],
        },
        fragranceFamily: 'Woody',
        stock: 25,
        featured: false,
        tags: ['sandalwood', 'spiritual', 'woody', 'unisex'],
        concentration: 'Intense',
        longevity: '12+ hours',
        sillage: 'Strong',
        occasion: ['Evening', 'Meditation', 'Special Occasion'],
        season: ['Fall', 'Winter', 'Spring'],
    },
    {
        name: 'Champagne & Cassis',
        brand: 'GoldenBuck',
        description:
            'Celebrate life with this effervescent and joyful fragrance. Fizzy champagne accord and blackcurrant burst forth like a toast at midnight, while a heart of peach blossom and pink peppercorn adds playful sophistication. The dry-down of musks, praline, and blonde wood is sheer indulgence — a fragrance for those who love the finer things.',
        shortDescription: 'Effervescent champagne notes with blackcurrant and peach',
        price: 215.0,
        images: [
            { url: 'https://images.unsplash.com/photo-1595425959630-babef8b4e923?w=800', alt: 'Champagne & Cassis' },
        ],
        category: 'Eau de Parfum',
        gender: 'Women',
        size: '100ml',
        fragranceNotes: {
            top: ['Champagne Accord', 'Blackcurrant', 'Lemon Zest'],
            middle: ['Peach Blossom', 'Pink Peppercorn', 'Rose'],
            base: ['Praline', 'Musk', 'Blonde Wood'],
        },
        fragranceFamily: 'Gourmand',
        stock: 70,
        featured: false,
        tags: ['fruity', 'sweet', 'celebratory', 'feminine'],
        concentration: 'Moderate',
        longevity: '6-8 hours',
        sillage: 'Moderate',
        occasion: ['Party', 'Date Night', 'Celebrations'],
        season: ['Spring', 'Summer', 'Fall'],
    },
    {
        name: 'Tobacco & Vanilla Royale',
        brand: 'GoldenBuck',
        description:
            'An indulgent gourmand fragrance that wraps you in pure luxury. Rich Virginia tobacco leaf and Madagascar vanilla create an addictive combination, enhanced by honey, cinnamon bark, and dried fruit. The base of amber, benzoin, and rare woods provides a warm, sensual cocoon that lasts well into the night.',
        shortDescription: 'Indulgent tobacco and vanilla with honey warmth',
        price: 295.0,
        compareAtPrice: 340.0,
        images: [
            { url: 'https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?w=800', alt: 'Tobacco & Vanilla Royale' },
        ],
        category: 'Parfum',
        gender: 'Unisex',
        size: '50ml',
        fragranceNotes: {
            top: ['Cinnamon Bark', 'Dried Fruit', 'Cardamom'],
            middle: ['Tobacco Leaf', 'Honey', 'Jasmine'],
            base: ['Vanilla', 'Amber', 'Benzoin'],
        },
        fragranceFamily: 'Gourmand',
        stock: 35,
        featured: true,
        tags: ['gourmand', 'tobacco', 'sweet', 'unisex', 'bestseller'],
        concentration: 'Intense',
        longevity: '12+ hours',
        sillage: 'Enormous',
        occasion: ['Evening', 'Winter', 'Special Occasion'],
        season: ['Fall', 'Winter'],
    },
    {
        name: 'Citrus Soleil d\'Or',
        brand: 'GoldenBuck',
        description:
            'Capture the golden rays of the Mediterranean sun in a bottle. This vibrant citrus composition opens with juicy blood orange, Amalfi lemon, and kumquat, leading to an aromatic heart of neroli, petitgrain, and white tea. The clean base of vetiver, white musk, and ambrette seed ensures this sunny fragrance feels refined and sophisticated.',
        shortDescription: 'Golden Mediterranean citrus with neroli and white tea',
        price: 175.0,
        images: [
            { url: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=800', alt: "Citrus Soleil d'Or" },
        ],
        category: 'Eau de Cologne',
        gender: 'Unisex',
        size: '150ml',
        fragranceNotes: {
            top: ['Blood Orange', 'Amalfi Lemon', 'Kumquat'],
            middle: ['Neroli', 'Petitgrain', 'White Tea'],
            base: ['Vetiver', 'White Musk', 'Ambrette Seed'],
        },
        fragranceFamily: 'Citrus',
        stock: 90,
        featured: false,
        tags: ['citrus', 'fresh', 'summer', 'bright'],
        concentration: 'Light',
        longevity: '2-4 hours',
        sillage: 'Intimate',
        occasion: ['Day', 'Casual', 'Office'],
        season: ['Spring', 'Summer'],
    },
    {
        name: 'The GoldenBuck Collection',
        brand: 'GoldenBuck',
        description:
            'Experience the finest of GoldenBuck Perfumes with this exquisite gift set. Contains carefully curated miniatures of our five signature fragrances: Royal Oud Noir (10ml), Velvet Rose & Iris (10ml), Midnight Amber Absolute (10ml), Noir de Nuit (10ml), and Santal Sacré (10ml). Presented in a luxurious gold and black lacquered box — the perfect gift for the discerning fragrance lover.',
        shortDescription: 'Luxury collection of 5 signature miniatures in a gift box',
        price: 185.0,
        compareAtPrice: 220.0,
        images: [
            { url: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800', alt: 'The GoldenBuck Collection' },
        ],
        category: 'Gift Set',
        gender: 'Unisex',
        size: '5 x 10ml',
        fragranceNotes: {
            top: ['Bergamot', 'Cardamom', 'Pepper'],
            middle: ['Rose', 'Oud', 'Amber'],
            base: ['Sandalwood', 'Vanilla', 'Musk'],
        },
        fragranceFamily: 'Oriental',
        stock: 50,
        featured: true,
        tags: ['gift set', 'collection', 'luxury', 'bestseller'],
        concentration: 'Strong',
        longevity: '8-12 hours',
        sillage: 'Strong',
        occasion: ['Gift', 'Special Occasion'],
        season: ['All Year'],
    },
    {
        name: 'Pétale de Magnolia',
        brand: 'GoldenBuck',
        description:
            'A delicate and ethereal white floral fragrance that captures the beauty of magnolia in full bloom. Fresh bergamot and lychee create a luminous opening, while the magnolia heart is enriched with white lily and freesia. A soft landing of white cedarwood, sheer musk, and a touch of blonde amber creates a fragrance that is pure, feminine, and utterly enchanting.',
        shortDescription: 'Ethereal white magnolia with lychee and sheer musk',
        price: 225.0,
        images: [
            { url: 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=800', alt: 'Pétale de Magnolia' },
        ],
        category: 'Eau de Parfum',
        gender: 'Women',
        size: '75ml',
        fragranceNotes: {
            top: ['Bergamot', 'Lychee', 'Pear'],
            middle: ['Magnolia', 'White Lily', 'Freesia'],
            base: ['White Cedar', 'Sheer Musk', 'Blonde Amber'],
        },
        fragranceFamily: 'Floral',
        stock: 65,
        featured: false,
        tags: ['white floral', 'delicate', 'feminine', 'spring'],
        concentration: 'Moderate',
        longevity: '6-8 hours',
        sillage: 'Intimate',
        occasion: ['Day', 'Office', 'Wedding', 'Brunch'],
        season: ['Spring', 'Summer'],
    },
];

const adminUser = {
    firstName: 'Admin',
    lastName: 'GoldenBuck',
    email: 'adnanshaikh07@gmail.com',
    password: 'Admin@123',
    role: 'admin',
};

const demoUser = {
    firstName: 'Victoria',
    lastName: 'Laurent',
    email: 'victoria@example.com',
    password: 'Demo@123',
    role: 'user',
};

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/goldenbuck-perfumes');
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

            // Add a sample review to featured products
            if (product.featured) {
                product.reviews.push({
                    user: user._id,
                    rating: Math.floor(Math.random() * 2) + 4, // 4 or 5
                    title: 'Absolutely Stunning',
                    comment:
                        'This fragrance is a masterpiece. The longevity and sillage are exceptional, and I always receive compliments when wearing it. Worth every penny.',
                });
                product.calculateAverageRating();
                await product.save();
            }
        }
        console.log(`🌹 Created ${products.length} products`);

        console.log('\n✅ Database seeded successfully!\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
};

seedDatabase();
