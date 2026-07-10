import mongoose from 'mongoose';

// Atomic sequence counter used to generate collision-free order numbers.
// Using a count-derived number is racy (duplicate orderNumbers under concurrency)
// and not immune to deletions; an atomic $inc guarantees monotonic uniqueness.
const counterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    seq: { type: Number, default: 1000 },
});

const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    name: { type: String, required: true },
    image: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    size: { type: String },
});

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        orderItems: [orderItemSchema],
        shippingAddress: {
            street: { type: String, required: true },
            landmark: { type: String },
            city: { type: String, required: true },
            state: { type: String, required: true },
            zipCode: { type: String, required: true },
            country: { type: String, required: true },
            phone: { type: String, required: true },
        },
        paymentMethod: {
            type: String,
            required: true,
            enum: ['razorpay', 'cod'],
        },
        orderNumber: {
            type: String,
            unique: true,
        },
        paymentResult: {
            id: String,
            status: String,
            updateTime: String,
            emailAddress: String,
        },
        itemsPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        taxPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        shippingPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        codCharge: {
            type: Number,
            default: 0,
        },
        comboDiscount: {
            type: Number,
            default: 0,
        },
        couponCode: {
            type: String,
            default: null,
        },
        couponDiscount: {
            type: Number,
            default: 0,
        },
        totalPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        isPaid: {
            type: Boolean,
            default: false,
        },
        paidAt: Date,
        orderStatus: {
            type: String,
            enum: ['Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
            default: 'Processing',
        },
        deliveredAt: Date,
        trackingNumber: String,
        deliveryPartner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'DeliveryPartner',
        },
        // Shiprocket integration fields
        shiprocket: {
            shiprocketOrderId: { type: Number },
            shiprocketShipmentId: { type: Number },
            awbCode: { type: String },
            courierName: { type: String },
            courierCompanyId: { type: Number },
            pickupScheduledDate: { type: Date },
            trackingUrl: { type: String },
            estimatedDeliveryDate: { type: Date },
            shippingStatus: {
                type: String,
                enum: ['pending', 'pickup_scheduled', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled', 'rto'],
                default: 'pending',
            },
            statusHistory: [{
                status: String,
                timestamp: Date,
                location: String,
                remarks: String,
            }],
            createdAt: { type: Date },
            error: { type: String }, // Store any Shiprocket API errors
        },
        notes: String,
    },
    {
        timestamps: true,
    }
);

// Generate unique order number via an atomic counter (collision-free under concurrency).
orderSchema.pre('save', async function (next) {
    if (this.isNew && !this.orderNumber) {
        try {
            // Seed the counter base once (idempotent). Done separately from $inc
            // because MongoDB rejects the same field in both $inc and $setOnInsert,
            // and an upsert-with-$inc-only would otherwise start the sequence at 1
            // (yielding GB-000001 and risking collisions with historical numbers).
            await Counter.updateOne(
                { _id: 'order' },
                { $setOnInsert: { seq: 1000 } },
                { upsert: true }
            );
            const c = await Counter.findOneAndUpdate(
                { _id: 'order' },
                { $inc: { seq: 1 } },
                { new: true }
            );
            this.orderNumber = `GB-${String(c.seq).padStart(6, '0')}`;
        } catch (err) {
            return next(err);
        }
    }
    next();
});

const Order = mongoose.model('Order', orderSchema);
export default Order;
