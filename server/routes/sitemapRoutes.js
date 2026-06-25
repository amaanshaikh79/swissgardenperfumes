import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// Static, indexable routes (auth-gated/transactional routes are intentionally excluded).
const STATIC_ROUTES = [
    '/',
    '/shop',
    '/combo-set',
    '/gifting',
    '/fragrance-finder',
    '/pairing-guide',
    '/about',
    '/contact',
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
            ...STATIC_ROUTES.map((route) => ({ loc: `${origin}${route}` })),
            ...products
                .filter((p) => p.slug)
                .map((p) => ({
                    loc: `${origin}/product/${encodeURIComponent(p.slug)}`,
                    lastmod: p.updatedAt ? new Date(p.updatedAt).toISOString() : undefined,
                })),
        ];

        const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
    .map(
        (u) =>
            `  <url>\n    <loc>${escapeXml(u.loc)}</loc>${
                u.lastmod ? `\n    <lastmod>${escapeXml(u.lastmod)}</lastmod>` : ''
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
