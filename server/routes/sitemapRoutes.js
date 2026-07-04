import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// Static, indexable routes (auth-gated/transactional routes are intentionally excluded).
const STATIC_ROUTES = [
    { route: '/', changefreq: 'weekly', priority: '1.0' },
    { route: '/shop', changefreq: 'weekly', priority: '0.9' },
    { route: '/combo-set', changefreq: 'monthly', priority: '0.8' },
    { route: '/gifting', changefreq: 'monthly', priority: '0.7' },
    { route: '/pairing-guide', changefreq: 'monthly', priority: '0.6' },
    { route: '/about', changefreq: 'yearly', priority: '0.5' },
    { route: '/contact', changefreq: 'yearly', priority: '0.5' },
    { route: '/shipping-policy', changefreq: 'yearly', priority: '0.3' },
    { route: '/return-policy', changefreq: 'yearly', priority: '0.3' },
    { route: '/privacy-policy', changefreq: 'yearly', priority: '0.3' },
    { route: '/terms', changefreq: 'yearly', priority: '0.3' },
];

const escapeXml = (value) =>
    String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

/**
 * @desc    Dynamic XML sitemap (static routes + one entry per active product slug)
 * @route   GET /sitemap.xml
 * @access  Public
 */
router.get('/sitemap.xml', async (req, res, next) => {
    try {
        // Site origin: prefer explicit config, else derive from the request.
        const origin = (
            process.env.SITE_URL ||
            process.env.CLIENT_URL ||
            `${req.protocol}://${req.get('host')}`
        ).replace(/\/$/, '');

        let products = [];
        try {
            products = await Product.find({ isActive: true })
                .select('slug updatedAt')
                .lean();
        } catch (dbErr) {
            // If the DB is unavailable, still emit the static routes rather than 500.
            console.error('Sitemap product query failed:', dbErr.message);
        }

        const urls = [
            ...STATIC_ROUTES.map((r) => ({
                loc: `${origin}${r.route}`,
                changefreq: r.changefreq,
                priority: r.priority,
            })),
            ...products
                .filter((p) => p.slug)
                .map((p) => ({
                    loc: `${origin}/product/${encodeURIComponent(p.slug)}`,
                    lastmod: p.updatedAt ? new Date(p.updatedAt).toISOString() : undefined,
                    changefreq: 'weekly',
                    priority: '0.8',
                })),
        ];

        const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
    .map(
        (u) =>
            `  <url>\n    <loc>${escapeXml(u.loc)}</loc>${
                u.lastmod ? `\n    <lastmod>${escapeXml(u.lastmod)}</lastmod>` : ''
            }${u.changefreq ? `\n    <changefreq>${u.changefreq}</changefreq>` : ''}${
                u.priority ? `\n    <priority>${u.priority}</priority>` : ''
            }\n  </url>`
    )
    .join('\n')}
</urlset>`;

        res.set('Content-Type', 'application/xml');
        res.status(200).send(body);
    } catch (error) {
        next(error);
    }
});

export default router;
