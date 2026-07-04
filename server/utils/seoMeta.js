/**
 * Server-side SEO meta injection.
 *
 * The client is a Vite React SPA whose per-route <head> tags are written in the
 * browser via a Helmet shim. Crawlers and social scrapers that do not execute
 * JavaScript would otherwise see only the generic homepage tags on every URL.
 *
 * This module injects route-specific <title>/<meta>/<link>/JSON-LD into the
 * built index.html BEFORE it is sent, by replacing the region between the
 * <!--SEO--> and <!--/SEO--> markers. The client Helmet still runs on top for
 * SPA navigation parity; server output is authoritative for the initial byte.
 */
import Product from '../models/Product.js';

const SITE_URL = (
    process.env.SITE_URL ||
    process.env.CLIENT_URL ||
    'https://swissgardenperfumes.com'
).replace(/\/+$/, '');

const OG_IMAGE = `${SITE_URL}/og-default.jpg`;
const BRAND = 'SwissGarden Perfumes';

const SEO_REGION = /<!--SEO-->[\s\S]*?<!--\/SEO-->/;

// HTML-attribute-safe escape for interpolated values.
const esc = (v) =>
    String(v ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

// Serialize JSON-LD, neutralizing any </script> breakout in string values.
const jsonLdScript = (obj) =>
    `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;

// ─── Global entities (schema.org) ────────────────────────────────
const ORGANIZATION = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: BRAND,
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/apple-touch-icon.png`,
    email: 'contact@swissgardenperfumes.com',
    telephone: '+91-9354936369',
    address: {
        '@type': 'PostalAddress',
        streetAddress: 'C-589 DDA Flat, Pocket 11, Jasola',
        addressLocality: 'New Delhi',
        postalCode: '110025',
        addressCountry: 'IN',
    },
    sameAs: ['https://www.instagram.com/swissgardenperfumes.official_'],
};

const WEBSITE = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: `${SITE_URL}/`,
    name: BRAND,
    publisher: { '@id': `${SITE_URL}/#organization` },
    potentialAction: {
        '@type': 'SearchAction',
        target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_URL}/shop?search={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
    },
};

// Kept in sync with client/src/pages/Contact.jsx FAQS array.
const CONTACT_FAQS = [
    {
        q: 'How long do your fragrances last?',
        a: 'Our attars are formulated with high-concentration oils for the Indian climate. Most scents last 8–12 hours on skin and even longer on fabric.',
    },
    {
        q: 'Are your perfumes long-lasting in Indian weather?',
        a: 'Yes. Our non-alcoholic, oil-based attars are built for heat and humidity, staying close to the skin and lasting through the day.',
    },
    {
        q: 'Do you offer Cash on Delivery?',
        a: 'Yes, Cash on Delivery is available across India. Prepaid orders above ₹200 ship free; a small fee applies to low-value COD orders.',
    },
    {
        q: 'What is your return policy?',
        a: 'We offer 7-day returns on unused, sealed products. Contact support@swissgardenperfumes.com with your order ID and photos.',
    },
    {
        q: 'How do I track my order?',
        a: 'Once shipped, you receive tracking details by email. You can also view live order status in your account under My Orders.',
    },
];

const faqSchema = () => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: CONTACT_FAQS.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
});

// ─── Static route metadata ───────────────────────────────────────
const STATIC_ROUTES = {
    '/': {
        title: 'SwissGarden Perfumes — Premium Attars at Smart Prices',
        description:
            'SwissGarden Perfumes — premium non-alcoholic roll-on attars crafted for everyday wear in India. Long-lasting fragrances starting at ₹799, Cash on Delivery available.',
    },
    '/shop': {
        title: 'Shop All Attars & Perfumes | SwissGarden Perfumes',
        description:
            'Browse the full SwissGarden collection of non-alcoholic roll-on attars. Long-lasting premium fragrances for him, her, and unisex — from ₹799 with free prepaid shipping.',
    },
    '/combo-set': {
        title: 'Build Your Trio — Any 3 Attars for ₹2,397 | SwissGarden Perfumes',
        description:
            'Create your own combo: pick any three SwissGarden attars for ₹2,397 and save ₹200. Mix moods and gift-ready roll-on fragrances crafted for the Indian climate.',
    },
    '/gifting': {
        title: 'Perfume Gifting & Gift Sets | SwissGarden Perfumes',
        description:
            'Gift-ready attar sets and roll-on fragrances from SwissGarden Perfumes. Beautifully packaged, long-lasting scents for every occasion.',
    },
    '/pairing-guide': {
        title: 'Scent Pairing Guide | SwissGarden Perfumes',
        description:
            'Learn how to layer and pair SwissGarden attars for a signature scent. Practical fragrance pairing tips for day, night, and every mood.',
    },
    '/about': {
        title: 'About Us | SwissGarden Perfumes',
        description:
            'SwissGarden Perfumes crafts non-alcoholic, long-lasting roll-on attars in India — Swiss precision in formulation, Indian craft. Discover the Mood Collection.',
    },
    '/contact': {
        title: 'Contact Us | SwissGarden Perfumes',
        description:
            'Get in touch with SwissGarden Perfumes for orders, fragrance advice, and support. Email, WhatsApp, and phone support across India.',
        faq: true,
    },
    '/privacy-policy': {
        title: 'Privacy Policy | SwissGarden Perfumes',
        description: 'How SwissGarden Perfumes collects, uses, and protects your personal information.',
    },
    '/return-policy': {
        title: 'Return Policy | SwissGarden Perfumes',
        description: 'SwissGarden Perfumes 7-day return policy for unused, sealed products, plus how to start a return.',
    },
    '/shipping-policy': {
        title: 'Shipping Policy | SwissGarden Perfumes',
        description: 'Shipping timelines, charges, and Cash on Delivery details for SwissGarden Perfumes orders across India.',
    },
    '/terms': {
        title: 'Terms & Conditions | SwissGarden Perfumes',
        description: 'The terms and conditions governing use of the SwissGarden Perfumes website and purchases.',
    },
};

// Routes (exact or prefix) that must never be indexed.
const NOINDEX_EXACT = new Set([
    '/checkout',
    '/profile',
    '/orders',
    '/wishlist',
    '/admin',
    '/login',
    '/register',
    '/forgot-password',
    '/auth/callback',
]);
const NOINDEX_PREFIXES = ['/reset-password', '/order-success', '/admin', '/orders'];

const isNoindex = (path) =>
    NOINDEX_EXACT.has(path) || NOINDEX_PREFIXES.some((p) => path.startsWith(p));

// ─── Tag builders ────────────────────────────────────────────────
function buildTags({ title, description, canonical, robots, image, ogType, jsonLd = [] }) {
    const safeTitle = esc(title);
    const safeDesc = esc(description);
    const img = image || OG_IMAGE;
    const lines = [
        `<title>${safeTitle}</title>`,
        `<meta name="description" content="${safeDesc}" />`,
        `<meta name="robots" content="${robots}" />`,
        `<link rel="canonical" href="${esc(canonical)}" />`,
        `<link rel="alternate" hreflang="en-in" href="${esc(canonical)}" />`,
        `<link rel="alternate" hreflang="x-default" href="${esc(canonical)}" />`,
        `<meta property="og:title" content="${safeTitle}" />`,
        `<meta property="og:description" content="${safeDesc}" />`,
        `<meta property="og:type" content="${ogType || 'website'}" />`,
        `<meta property="og:site_name" content="${BRAND}" />`,
        `<meta property="og:locale" content="en_IN" />`,
        `<meta property="og:url" content="${esc(canonical)}" />`,
        `<meta property="og:image" content="${esc(img)}" />`,
        `<meta property="og:image:alt" content="${safeTitle}" />`,
        `<meta name="twitter:card" content="summary_large_image" />`,
        `<meta name="twitter:title" content="${safeTitle}" />`,
        `<meta name="twitter:description" content="${safeDesc}" />`,
        `<meta name="twitter:image" content="${esc(img)}" />`,
        ...jsonLd.map(jsonLdScript),
    ];
    return `<!--SEO-->\n    ${lines.join('\n    ')}\n    <!--/SEO-->`;
}

const INDEX_ROBOTS = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
const NOINDEX_ROBOTS = 'noindex, nofollow';

function normalizePath(path) {
    if (!path) return '/';
    // Strip query/hash and trailing slash (except root).
    const clean = path.split('?')[0].split('#')[0];
    if (clean.length > 1 && clean.endsWith('/')) return clean.slice(0, -1);
    return clean;
}

async function buildProductTags(slug) {
    const product = await Product.findOne({ slug, isActive: true })
        .select('name description shortDescription images price stock category rating numReviews slug')
        .lean();

    if (!product) {
        return buildTags({
            title: `Product Not Found | ${BRAND}`,
            description: 'The product you are looking for is unavailable. Browse the full SwissGarden collection instead.',
            canonical: `${SITE_URL}/shop`,
            robots: NOINDEX_ROBOTS,
        });
    }

    const canonical = `${SITE_URL}/product/${encodeURIComponent(slug)}`;
    const firstImage = product.images?.[0]?.url;
    const absImage = firstImage
        ? firstImage.startsWith('http')
            ? firstImage
            : `${SITE_URL}${firstImage.startsWith('/') ? '' : '/'}${firstImage}`
        : OG_IMAGE;
    const images = (product.images || [])
        .map((i) => (i?.url?.startsWith('http') ? i.url : i?.url ? `${SITE_URL}${i.url.startsWith('/') ? '' : '/'}${i.url}` : null))
        .filter(Boolean);
    const description =
        product.shortDescription || (product.description ? product.description.slice(0, 160) : `${product.name} by ${BRAND}.`);

    const nextYear = new Date().getUTCFullYear() + 1;

    const productLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        '@id': `${canonical}#product`,
        url: canonical,
        name: product.name,
        ...(images.length > 0 && { image: images }),
        description: product.shortDescription || product.description?.slice(0, 5000),
        sku: String(product._id || product.slug),
        ...(product.category && { category: product.category }),
        brand: { '@type': 'Brand', name: BRAND },
        offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: 'INR',
            availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            itemCondition: 'https://schema.org/NewCondition',
            priceValidUntil: `${nextYear}-12-31`,
            url: canonical,
        },
        ...(product.numReviews > 0 && product.rating > 0 && {
            aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: product.rating,
                reviewCount: product.numReviews,
                bestRating: 5,
                worstRating: 1,
            },
        }),
    };

    const breadcrumbLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
            { '@type': 'ListItem', position: 2, name: 'Shop', item: `${SITE_URL}/shop` },
            { '@type': 'ListItem', position: 3, name: product.name },
        ],
    };

    return buildTags({
        title: `${product.name} | ${BRAND}`,
        description,
        canonical,
        robots: INDEX_ROBOTS,
        image: absImage,
        ogType: 'product',
        jsonLd: [productLd, breadcrumbLd],
    });
}

/**
 * Inject route-specific SEO tags into the index.html template.
 * @param {string} template - the built index.html contents
 * @param {string} rawPath - req.path
 * @returns {Promise<string>}
 */
export async function injectSeo(template, rawPath) {
    if (!SEO_REGION.test(template)) return template; // marker missing — serve as-is
    const path = normalizePath(rawPath);

    let tags;

    if (path.startsWith('/product/')) {
        const slug = decodeURIComponent(path.slice('/product/'.length));
        tags = await buildProductTags(slug);
    } else if (STATIC_ROUTES[path]) {
        const meta = STATIC_ROUTES[path];
        const canonical = `${SITE_URL}${path === '/' ? '/' : path}`;
        const jsonLd = [];
        if (path === '/') jsonLd.push(ORGANIZATION, WEBSITE);
        if (meta.faq) jsonLd.push(faqSchema());
        tags = buildTags({
            title: meta.title,
            description: meta.description,
            canonical,
            robots: INDEX_ROBOTS,
            jsonLd,
        });
    } else if (isNoindex(path)) {
        tags = buildTags({
            title: `SwissGarden Perfumes`,
            description: 'SwissGarden Perfumes — premium non-alcoholic attars crafted in India.',
            canonical: `${SITE_URL}${path}`,
            robots: NOINDEX_ROBOTS,
        });
    } else {
        // Unknown route (client-side 404). Do not index thin/unknown URLs.
        tags = buildTags({
            title: `Page Not Found | ${BRAND}`,
            description: 'The page you are looking for could not be found. Explore the SwissGarden collection instead.',
            canonical: `${SITE_URL}${path}`,
            robots: NOINDEX_ROBOTS,
        });
    }

    return template.replace(SEO_REGION, tags);
}

export { SITE_URL };
