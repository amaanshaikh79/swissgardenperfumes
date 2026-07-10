import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// ⚠️  Load .env IMMEDIATELY before any other imports that need env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '.env');

console.log(`\n📁 Environment Setup:`);
console.log(`   .env path: ${envPath}`);
console.log(`   .env exists: ${fs.existsSync(envPath)}`);

if (fs.existsSync(envPath)) {
    const result = dotenv.config({ path: envPath });
    if (result.error) {
        console.warn(`⚠️  Failed to parse .env file:`, result.error.message);
    } else {
        console.log(`✅ .env file loaded successfully (${Object.keys(result.parsed || {}).length} variables)\n`);
    }
} else {
    console.log(`ℹ️  No .env file found — using platform environment variables (Render/production mode)\n`);
}

console.log(`🔑 Verification:`);
console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`   RAZORPAY_KEY_ID: ${process.env.RAZORPAY_KEY_ID ? '✓ Loaded' : '✗ Missing'}`);
console.log(`   RAZORPAY_KEY_SECRET: ${process.env.RAZORPAY_KEY_SECRET ? '✓ Loaded' : '✗ Missing'}`);
console.log(`   MONGO_URI: ${process.env.MONGO_URI ? '✓ Loaded' : '✗ Missing'}`);
console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? '✓ Loaded' : '✗ Missing'}`);
console.log(`   GOOGLE_CLIENT_ID: ${process.env.GOOGLE_CLIENT_ID ? '✓ Loaded' : '✗ Missing'}`);
console.log(`   OPENROUTER_API_KEY: ${process.env.OPENROUTER_API_KEY ? '✓ Loaded' : '✗ Missing (chatbot will return fallback)'}\n`);
if (!process.env.OPENROUTER_API_KEY) {
    console.warn('⚠️  OPENROUTER_API_KEY not set — AI chatbot will return a friendly fallback to users');
}

// Fail fast: a missing or weak JWT_SECRET must never silently default to a known value.
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    console.error('❌ FATAL: JWT_SECRET is missing or too weak (must be >= 32 chars). Refusing to start.');
    process.exit(1);
}
if (!process.env.JWT_EXPIRE) {
    process.env.JWT_EXPIRE = '30d';
}
if (!process.env.JWT_COOKIE_EXPIRE) {
    process.env.JWT_COOKIE_EXPIRE = '30';
}

// NOW import everything else that depends on env vars
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import connectDB from './config/db.js';
import { getAllowedOrigins } from './config/urls.js';
import { injectSeo } from './utils/seoMeta.js';
import errorHandler from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import oauthRoutes from './routes/oauthRoutes.js';
import deliveryPartnerRoutes from './routes/deliveryPartnerRoutes.js';
import returnRoutes from './routes/returnRoutes.js';
import sitemapRoutes from './routes/sitemapRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import newsletterRoutes from './routes/newsletterRoutes.js';
import shiprocketRoutes from './routes/shiprocketRoutes.js';
import shiprocketWebhookRoutes from './routes/shiprocketWebhookRoutes.js';
import passport, { initializePassport } from './config/passport.js';

// Register OAuth strategies NOW (after dotenv has loaded env vars)
console.log('\n🔐 OAuth Strategies:');
initializePassport();

const app = express();

// Trust proxy for Render/Heroku load balancers
app.set('trust proxy', 1);

// Enable compression for all compressible responses
app.use(compression());

// ─── Security Middleware ────────────────────────────────────────
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Auth rate limiting (stricter)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, message: 'Too many auth attempts, please try again later.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
// OTP rate limiting — prevent brute-force of 6-digit codes
app.use('/api/auth/send-otp', authLimiter);
app.use('/api/auth/verify-otp', authLimiter);

// Chat rate limiting — cost control for OpenRouter calls
const chatLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 20,
    message: { success: false, reply: 'Too many chat requests — please wait a moment and try again.' },
});
app.use('/api/chat', chatLimiter);

// Newsletter rate limiting — abuse control for the public subscribe endpoint
const newsletterLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: { success: false, message: 'Too many subscription attempts — please try again later.' },
});
app.use('/api/newsletter', newsletterLimiter);

// ─── Body & Cookie Parsing ─────────────────────────────────────
// Webhook route needs raw body for Razorpay HMAC signature verification
// Must be registered BEFORE express.json() so the raw bytes are preserved
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }), (req, res, next) => {
    req.rawBody = req.body.toString('utf8');
    try {
        req.body = JSON.parse(req.rawBody);
    } catch {
        return res.status(400).json({ success: false, message: 'Invalid JSON payload' });
    }
    next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Sanitize Data ─────────────────────────────────────────────
app.use(mongoSanitize());

// ─── CORS ───────────────────────────────────────────────────────
// Fail fast in production unless we can resolve a public origin. Render injects
// RENDER_EXTERNAL_URL automatically, so an explicit CLIENT_URL is optional there.
if (
    process.env.NODE_ENV === 'production' &&
    !process.env.CLIENT_URL &&
    !process.env.RENDER_EXTERNAL_URL
) {
    throw new Error(
        'Set CLIENT_URL in production (or deploy on Render, which auto-provides RENDER_EXTERNAL_URL)'
    );
}

// Allowlist of trusted origins (CLIENT_URL + Render default URL + dev localhost).
const allowedOrigins = getAllowedOrigins();

// Allow this project's own Vercel preview deployments (explicit own-project regex,
// not a blanket *.vercel.app, to avoid trusting unrelated tenants).
const vercelPreview = /\.vercel\.app$/;

app.use(
    cors({
        origin: (origin, cb) => {
            // Same-origin requests / curl / server-to-server have no Origin header.
            if (!origin) return cb(null, true);
            try {
                const url = new URL(origin);
                if (allowedOrigins.includes(origin) || vercelPreview.test(url.hostname)) {
                    return cb(null, true);
                }
                // Dev convenience: allow any localhost port (Vite may pick a
                // free port when 5173 is taken). Never applies in production.
                if (
                    process.env.NODE_ENV !== 'production' &&
                    (url.hostname === 'localhost' || url.hostname === '127.0.0.1')
                ) {
                    return cb(null, true);
                }
            } catch {
                // Malformed Origin header — reject.
            }
            return cb(new Error('Not allowed by CORS'));
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
);

// ─── Static Files ───────────────────────────────────────────────
app.use('/uploads', express.static('uploads'));

// ─── Passport Initialization (MUST be before routes) ──────────────
app.use(passport.initialize());

// ─── API Routes ─────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/auth', oauthRoutes);
app.use('/api/delivery-partners', deliveryPartnerRoutes);
app.use('/api/returns', returnRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/shiprocket', shiprocketRoutes);
app.use('/api/shiprocket', shiprocketWebhookRoutes);

// ─── Dynamic XML Sitemap ────────────────────────────────────────
// MUST be mounted before any SPA static/catch-all so the "/*" fallback
// does not shadow it and return index.html instead.
app.use('/', sitemapRoutes);

// ─── Health Check ───────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    const dbConnected = mongoose.connection.readyState === 1;
    res.status(dbConnected ? 200 : 503).json({
        success: dbConnected,
        message: dbConnected
            ? 'SwissGarden Perfumes API is running'
            : 'API up but database unavailable',
        db: dbConnected ? 'connected' : 'disconnected',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString(),
    });
});

// ─── Static Client Serving ──────────────────────────────────────
// Serve the built React client whenever a build exists — NOT gated on
// NODE_ENV. This makes the deploy resilient: visiting the domain serves the
// app even if NODE_ENV was not set to "production", instead of "Cannot GET /".
const clientDistPath = path.join(__dirname, '../client/dist');
const clientIndexPath = path.join(clientDistPath, 'index.html');

if (fs.existsSync(clientIndexPath)) {
    // Read the built index.html once; the SPA catch-all injects per-route SEO
    // tags into it before sending so crawlers get correct head tags without JS.
    const indexTemplate = fs.readFileSync(clientIndexPath, 'utf8');

    // Serve static files with production caching headers.
    // index:false so "/" is NOT auto-served the raw index.html here — it must
    // fall through to the SPA catch-all below so the homepage gets its
    // server-injected SEO tags (Organization/WebSite JSON-LD, canonical, etc.).
    app.use(express.static(clientDistPath, {
        index: false,
        maxAge: '1d', // default maxAge fallback
        etag: true,
        lastModified: true,
        setHeaders: (res, filePath) => {
            // Normalize path separators for Windows/Unix compatibility
            const normalizedPath = filePath.replace(/\\/g, '/');

            if (normalizedPath.includes('/assets/')) {
                // Vite hashed assets are immutable and can be cached forever
                res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            } else if (
                normalizedPath.includes('/Video/') ||
                /\.(webp|mp4|mov|jpg|jpeg|png|gif|svg|ico)$/i.test(normalizedPath)
            ) {
                // Media assets are cached for 30 days
                res.setHeader('Cache-Control', 'public, max-age=2592000');
            } else if (normalizedPath.endsWith('sw.js') || normalizedPath.endsWith('service-worker.js')) {
                // Service workers must not be cached in browser storage indefinitely
                res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
            } else {
                // HTML files and JSON configuration should be validated on every request
                res.setHeader('Cache-Control', 'no-cache');
            }
        }
    }));

    // SPA fallback: serve index.html for any non-API GET route so client-side
    // routes (and a refresh on /shop, /product/..., etc.) resolve correctly.
    // Per-route SEO tags (title, description, canonical, OG, JSON-LD) are injected
    // server-side so crawlers/social scrapers see correct head tags without JS.
    // API paths fall through to the JSON 404 / error handler below.
    app.get('*', async (req, res, next) => {
        if (req.path.startsWith('/api/')) return next();
        res.setHeader('Cache-Control', 'no-cache');
        try {
            const html = await injectSeo(indexTemplate, req.path);
            res.type('html').send(html);
        } catch (err) {
            console.error('SEO injection failed, serving base index.html:', err.message);
            res.sendFile(clientIndexPath);
        }
    });

    console.log(`🗂️  Serving client build from ${clientDistPath}`);
} else {
    console.warn('⚠️  No client build found at client/dist — frontend will not be served. Run "npm run build".');
}

// ─── Error Handler ──────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ───────────────────────────────────────────────
// Await the database connection before binding the port so a production
// connection failure exits (connectDB self-exits) before traffic is accepted.
if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 5000;
    const HOST = '0.0.0.0';
    connectDB().then(() => {
        app.listen(PORT, HOST, () => {
            console.log(`
      ╔═══════════════════════════════════════════╗
      ║                                           ║
      ║   🏆 SwissGarden Perfumes API Server        ║
      ║                                           ║
      ║   Port:        ${PORT}                       ║
      ║   Host:        ${HOST}                 ║
      ║   Environment: ${process.env.NODE_ENV || 'development'}            ║
      ║                                           ║
      ╚═══════════════════════════════════════════╝
      `);
        });
    });
} else {
    // Serverless (Vercel) entry: connect lazily without binding a port.
    connectDB();
}

export default app;
