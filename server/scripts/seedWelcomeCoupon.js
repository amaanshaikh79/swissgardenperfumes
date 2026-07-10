/**
 * Idempotent seed for the WELCOME10 newsletter coupon.
 *
 * The exit-intent popup and newsletter welcome email promise WELCOME10, so the
 * coupon must exist in the database or the code fails at checkout. Run once:
 *
 *   node server/scripts/seedWelcomeCoupon.js
 *
 * Safe to re-run — upserts by code and never resets usage counters.
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { default: Coupon } = await import('../models/Coupon.js');

const run = async () => {
    if (!process.env.MONGO_URI) {
        console.error('❌ MONGO_URI not set');
        process.exit(1);
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✨ Connected to MongoDB');

    const result = await Coupon.findOneAndUpdate(
        { code: 'WELCOME10' },
        {
            // $setOnInsert only — never clobber usage counters on re-run
            $setOnInsert: {
                code: 'WELCOME10',
                description: 'Newsletter welcome offer — 10% off your first order',
                discountType: 'percentage',
                discountValue: 10,
                maxDiscount: 200,
                minOrderAmount: 499,
                usageLimit: null,
                perUserLimit: 1,
                expiryDate: new Date('2030-12-31'),
                isActive: true,
            },
        },
        { upsert: true, new: true, rawResult: true }
    );

    const created = !result.lastErrorObject?.updatedExisting;
    console.log(
        created
            ? '✅ WELCOME10 coupon created (10% off, cap ₹200, min order ₹499, 1 use per user)'
            : 'ℹ️  WELCOME10 coupon already exists — left untouched'
    );

    await mongoose.disconnect();
    process.exit(0);
};

run().catch((err) => {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
});
