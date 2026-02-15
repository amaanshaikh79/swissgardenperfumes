import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Product from '../models/Product.js';
import User from '../models/User.js';

dotenv.config();

const products = [
    {
        name: 'Dark Oud Elixir',
        brand: 'ScentGold',
        description:
            'A commanding oud fragrance that opens with a burst of bergamot and pink pepper, flowing into a heart of rich oud wood and Damascus rose. The base rests on aged sandalwood, amber, and warm tonka bean. An independent fragrance inspired by popular luxury oud profiles — crafted for everyday wear in India.',
        shortDescription: 'Rich oud with rose, sandalwood & amber – long lasting oud fragrance',
        price: 1099,
        compareAtPrice: 1499,
        images: [
            { url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800', alt: 'Dark Oud Elixir' },
        ],
        category: 'Eau de Parfum',
        gender: 'Unisex',
        size: '50ml',
        fragranceNotes: {
            top: ['Bergamot', 'Pink Pepper', 'Saffron'],
            middle: ['Oud', 'Damascus Rose', 'Jasmine'],
            base: ['Sandalwood', 'Amber', 'Tonka Bean'],
        },
        fragranceFamily: 'Oriental',
        stock: 120,
        featured: true,
        tags: ['bestseller', 'oud', 'luxury', 'unisex', 'long-lasting'],
        concentration: 'Strong',
        longevity: '8-12 hours',
        sillage: 'Strong',
        occasion: ['Evening', 'Special Occasion', 'Date Night'],
        season: ['Fall', 'Winter'],
    },
    {
        name: 'Rose Velvet',
        brand: 'ScentGold',
        description:
            'A sophisticated floral symphony capturing the essence of an elegant garden at twilight. Velvety Turkish rose petals intertwine with powdery iris, while violet leaf adds depth. The dry-down reveals rich suede, musk, and patchouli — romantic and modern. An independent fragrance profile inspired by popular luxury floral scents.',
        shortDescription: 'Elegant rose & iris blend with suede undertones',
        price: 799,
        images: [
            { url: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=800', alt: 'Rose Velvet' },
        ],
        category: 'Eau de Parfum',
        gender: 'Women',
        size: '50ml',
        fragranceNotes: {
            top: ['Violet Leaf', 'Bergamot', 'Blackcurrant'],
            middle: ['Turkish Rose', 'Iris', 'Peony'],
            base: ['Suede', 'Musk', 'Patchouli'],
        },
        fragranceFamily: 'Floral',
        stock: 200,
        featured: true,
        tags: ['floral', 'elegant', 'feminine', 'bestseller'],
        concentration: 'Moderate',
        longevity: '8-12 hours',
        sillage: 'Moderate',
        occasion: ['Day', 'Office', 'Date Night'],
        season: ['Spring', 'Summer'],
    },
    {
        name: 'Midnight Amber',
        brand: 'ScentGold',
        description:
            'Step into the mystique of the night with this captivating amber fragrance. Rich labdanum and amber meld with exotic spices — cardamom, nutmeg, and star anise — creating an intoxicating warmth. Smoky benzoin, vanilla, and a whisper of leather evoke moonlit evenings. Perfect for Indian winters.',
        shortDescription: 'Deep amber with exotic spices & smoky warmth – perfect for winters',
        price: 1299,
        compareAtPrice: 1699,
        images: [
            { url: 'https://images.unsplash.com/photo-1594035910387-fea081fdd6b6?w=800', alt: 'Midnight Amber' },
        ],
        category: 'Eau de Parfum',
        gender: 'Unisex',
        size: '50ml',
        fragranceNotes: {
            top: ['Cardamom', 'Star Anise', 'Pink Pepper'],
            middle: ['Labdanum', 'Amber', 'Nutmeg'],
            base: ['Benzoin', 'Vanilla', 'Leather'],
        },
        fragranceFamily: 'Oriental',
        stock: 80,
        featured: true,
        tags: ['amber', 'spicy', 'intense', 'evening', 'bestseller'],
        concentration: 'Intense',
        longevity: '12+ hours',
        sillage: 'Strong',
        occasion: ['Evening', 'Special Occasion'],
        season: ['Fall', 'Winter'],
    },
    {
        name: 'Aqua Marine',
        brand: 'ScentGold',
        description:
            'A refreshing aquatic scent perfect for Indian summers and everyday office wear. Sparkling lemon and marine accord dance with aromatic lavender and geranium. A base of cedarwood and ambergris provides a clean, sophisticated finish — fresh, confident, and long lasting even in humid weather.',
        shortDescription: 'Fresh aquatic fragrance – perfect for office & summer wear',
        price: 599,
        images: [
            { url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800', alt: 'Aqua Marine' },
        ],
        category: 'Eau de Parfum',
        gender: 'Men',
        size: '50ml',
        fragranceNotes: {
            top: ['Lemon', 'Marine Accord', 'Grapefruit'],
            middle: ['Lavender', 'Geranium', 'Violet Leaf'],
            base: ['White Cedar', 'Ambergris', 'White Musk'],
        },
        fragranceFamily: 'Aquatic',
        stock: 300,
        featured: true,
        tags: ['fresh', 'summer', 'aquatic', 'office', 'daily-wear'],
        concentration: 'Moderate',
        longevity: '8-12 hours',
        sillage: 'Moderate',
        occasion: ['Day', 'Casual', 'Office'],
        season: ['Spring', 'Summer'],
    },
    {
        name: 'Noir Intense',
        brand: 'ScentGold',
        description:
            'A dark and seductive fragrance for the modern man. Bergamot and black pepper create a powerful opening, giving way to oud, vetiver, and dark chocolate. Indonesian patchouli and cedar create warmth that is both dangerous and irresistible. Compliment magnet on dates.',
        shortDescription: 'Dark & seductive – oud, chocolate & vetiver blend',
        price: 899,
        compareAtPrice: 1199,
        images: [
            { url: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800', alt: 'Noir Intense' },
        ],
        category: 'Eau de Parfum',
        gender: 'Men',
        size: '50ml',
        fragranceNotes: {
            top: ['Bergamot', 'Black Pepper', 'Elemi'],
            middle: ['Oud', 'Vetiver', 'Dark Chocolate'],
            base: ['Patchouli', 'Atlas Cedar', 'Amber'],
        },
        fragranceFamily: 'Woody',
        stock: 150,
        featured: true,
        tags: ['dark', 'masculine', 'seductive', 'date-night', 'bestseller'],
        concentration: 'Strong',
        longevity: '8-12 hours',
        sillage: 'Strong',
        occasion: ['Evening', 'Date Night', 'Party'],
        season: ['Fall', 'Winter'],
    },
    {
        name: 'Bloom Garden',
        brand: 'ScentGold',
        description:
            'A regal floral masterpiece. Dewy lily of the valley and hyacinth open the composition, leading to a voluptuous heart of tuberose and gardenia. The velvety base of orris, white musk, and cashmere wood creates refined elegance. Perfect for daily wear in Indian spring weather.',
        shortDescription: 'Regal floral – tuberose, gardenia & cashmere wood',
        price: 699,
        images: [
            { url: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800', alt: 'Bloom Garden' },
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
        stock: 180,
        featured: true,
        tags: ['floral', 'elegant', 'feminine', 'daily-wear'],
        concentration: 'Moderate',
        longevity: '6-8 hours',
        sillage: 'Moderate',
        occasion: ['Day', 'Office', 'Brunch'],
        season: ['Spring', 'Summer'],
    },
    {
        name: 'Sacred Santal',
        brand: 'ScentGold',
        description:
            'A meditative journey inspired by sacred Indian sandalwood. Creamy sandalwood enriched with warm cardamom and smoky incense. Pure Mysore-style sandalwood, cedarwood, and a touch of vanilla create spiritual serenity. Made for the Indian weather — smooth and skin-hugging.',
        shortDescription: 'Sacred sandalwood & incense – the Indian classic',
        price: 999,
        compareAtPrice: 1299,
        images: [
            { url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800', alt: 'Sacred Santal' },
        ],
        category: 'Eau de Parfum',
        gender: 'Unisex',
        size: '50ml',
        fragranceNotes: {
            top: ['Cardamom', 'Pink Pepper', 'Bergamot'],
            middle: ['Incense', 'Iris', 'Violet'],
            base: ['Sandalwood', 'Cedarwood', 'Vanilla'],
        },
        fragranceFamily: 'Woody',
        stock: 90,
        featured: false,
        tags: ['sandalwood', 'woody', 'unisex', 'Indian-classic'],
        concentration: 'Strong',
        longevity: '8-12 hours',
        sillage: 'Strong',
        occasion: ['Day', 'Evening', 'Office'],
        season: ['All Year'],
    },
    {
        name: 'Party Pop',
        brand: 'ScentGold',
        description:
            'Celebrate life with this effervescent and joyful fragrance. Fizzy champagne accord and blackcurrant burst forth, while peach blossom and pink peppercorn add playful sophistication. Musks, praline, and blonde wood create sheer indulgence — the perfect party companion.',
        shortDescription: 'Fizzy, fruity & fun – the ultimate party fragrance',
        price: 649,
        images: [
            { url: 'https://images.unsplash.com/photo-1595425959630-babef8b4e923?w=800', alt: 'Party Pop' },
        ],
        category: 'Eau de Parfum',
        gender: 'Women',
        size: '50ml',
        fragranceNotes: {
            top: ['Champagne Accord', 'Blackcurrant', 'Lemon Zest'],
            middle: ['Peach Blossom', 'Pink Peppercorn', 'Rose'],
            base: ['Praline', 'Musk', 'Blonde Wood'],
        },
        fragranceFamily: 'Gourmand',
        stock: 250,
        featured: false,
        tags: ['fruity', 'party', 'feminine', 'sweet'],
        concentration: 'Moderate',
        longevity: '6-8 hours',
        sillage: 'Moderate',
        occasion: ['Party', 'Date Night', 'Celebrations'],
        season: ['Spring', 'Summer', 'Fall'],
    },
    {
        name: 'Tobacco Royale',
        brand: 'ScentGold',
        description:
            'An indulgent gourmand fragrance that wraps you in pure warmth. Rich tobacco leaf and Madagascar vanilla create an addictive combination, enhanced by honey, cinnamon bark, and dried fruit. Amber, benzoin, and rare woods provide a warm cocoon that lasts well into the night.',
        shortDescription: 'Indulgent tobacco & vanilla – warm & addictive',
        price: 1199,
        compareAtPrice: 1499,
        images: [
            { url: 'https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?w=800', alt: 'Tobacco Royale' },
        ],
        category: 'Eau de Parfum',
        gender: 'Unisex',
        size: '50ml',
        fragranceNotes: {
            top: ['Cinnamon Bark', 'Dried Fruit', 'Cardamom'],
            middle: ['Tobacco Leaf', 'Honey', 'Jasmine'],
            base: ['Vanilla', 'Amber', 'Benzoin'],
        },
        fragranceFamily: 'Gourmand',
        stock: 100,
        featured: true,
        tags: ['gourmand', 'tobacco', 'bestseller', 'unisex', 'winter'],
        concentration: 'Intense',
        longevity: '12+ hours',
        sillage: 'Enormous',
        occasion: ['Evening', 'Winter', 'Special Occasion'],
        season: ['Fall', 'Winter'],
    },
    {
        name: 'Citrus Rush',
        brand: 'ScentGold',
        description:
            'Capture fresh energy in a bottle. This vibrant citrus composition opens with juicy blood orange, lemon, and kumquat, leading to an aromatic heart of neroli, petitgrain, and white tea. Vetiver, white musk, and ambrette seed ensure this stays fresh and sophisticated all day.',
        shortDescription: 'Vibrant citrus with white tea – energetic & fresh daily wear',
        price: 499,
        images: [
            { url: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=800', alt: 'Citrus Rush' },
        ],
        category: 'Eau de Parfum',
        gender: 'Unisex',
        size: '50ml',
        fragranceNotes: {
            top: ['Blood Orange', 'Lemon', 'Kumquat'],
            middle: ['Neroli', 'Petitgrain', 'White Tea'],
            base: ['Vetiver', 'White Musk', 'Ambrette Seed'],
        },
        fragranceFamily: 'Citrus',
        stock: 400,
        featured: false,
        tags: ['citrus', 'fresh', 'summer', 'budget', 'daily-wear'],
        concentration: 'Moderate',
        longevity: '6-8 hours',
        sillage: 'Moderate',
        occasion: ['Day', 'Casual', 'Office'],
        season: ['Spring', 'Summer'],
    },
    {
        name: 'The ScentGold Discovery Set',
        brand: 'ScentGold',
        description:
            'Experience the best of ScentGold with this curated discovery set. Contains 5 miniatures of our top-selling fragrances: Dark Oud Elixir, Rose Velvet, Aqua Marine, Noir Intense, and Citrus Rush — each 10ml. Presented in a premium gift box. The perfect way to find your signature scent.',
        shortDescription: 'Curated 5-piece discovery set – the perfect gift',
        price: 999,
        compareAtPrice: 1499,
        images: [
            { url: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800', alt: 'The ScentGold Discovery Set' },
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
        stock: 150,
        featured: true,
        tags: ['gift-set', 'collection', 'bestseller', 'combo'],
        concentration: 'Strong',
        longevity: '8-12 hours',
        sillage: 'Strong',
        occasion: ['Gift', 'Special Occasion'],
        season: ['All Year'],
    },
    {
        name: 'White Magnolia',
        brand: 'ScentGold',
        description:
            'A delicate and ethereal white floral fragrance capturing the beauty of magnolia in full bloom. Fresh bergamot and lychee create a luminous opening, while the magnolia heart is enriched with white lily and freesia. Soft cedarwood, sheer musk, and blonde amber create pure enchantment.',
        shortDescription: 'Ethereal white magnolia with lychee & sheer musk',
        price: 749,
        images: [
            { url: 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=800', alt: 'White Magnolia' },
        ],
        category: 'Eau de Parfum',
        gender: 'Women',
        size: '50ml',
        fragranceNotes: {
            top: ['Bergamot', 'Lychee', 'Pear'],
            middle: ['Magnolia', 'White Lily', 'Freesia'],
            base: ['White Cedar', 'Sheer Musk', 'Blonde Amber'],
        },
        fragranceFamily: 'Floral',
        stock: 220,
        featured: false,
        tags: ['white-floral', 'delicate', 'feminine', 'spring'],
        concentration: 'Moderate',
        longevity: '6-8 hours',
        sillage: 'Intimate',
        occasion: ['Day', 'Office', 'Wedding', 'Brunch'],
        season: ['Spring', 'Summer'],
    },
];

const adminUser = {
    firstName: 'Admin',
    lastName: 'ScentGold',
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
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/scentgold');
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
                    { title: 'Best value perfume in India', comment: 'My friends thought I was wearing a ₹8000 perfume. The quality is incredible for the price. COD made it easy to try.' },
                    { title: 'Compliment magnet', comment: 'Got so many compliments at work. The projection is perfect and it lasts all day. Will definitely buy the combo next time.' },
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
        console.log(`🌹 Created ${products.length} products`);

        console.log('\n✅ Database seeded successfully!\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
};

seedDatabase();
