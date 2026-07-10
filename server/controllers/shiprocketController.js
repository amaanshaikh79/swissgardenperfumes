import Order from '../models/Order.js';
import {
    createShiprocketOrder,
    schedulePickup,
    generateLabel,
    trackShipment,
    cancelShipment,
    getShippingRates,
    getShiprocketOrderDetails,
} from '../services/shiprocketService.js';

/**
 * @desc    Retry creating Shiprocket order for failed orders
 * @route   POST /api/shiprocket/retry/:orderId
 * @access  Admin
 */
export const retryShiprocketOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.orderId).populate('user orderItems.product');

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Check if order already has Shiprocket data
        if (order.shiprocket?.shiprocketOrderId) {
            return res.status(400).json({
                success: false,
                message: 'Shiprocket order already exists for this order',
            });
        }

        // Prepare shipping address
        const shipping = order.shippingAddress;
        const user = order.user;

        // Extract user name
        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
        const nameParts = fullName.split(' ');
        const firstName = nameParts[0] || 'Customer';
        const lastName = nameParts.slice(1).join(' ') || '';

        // Calculate total weight
        const totalWeight = order.orderItems.reduce((sum, item) => {
            return sum + (0.5 * item.quantity);
        }, 0);

        // Prepare order data for Shiprocket
        const shiprocketData = {
            orderNumber: order.orderNumber,
            orderDate: order.createdAt.toISOString().split('T')[0],
            pickupLocation: process.env.SHIPROCKET_PICKUP_LOCATION || 'Primary',
            channelId: '',
            comment: order.notes || '',
            billing: {
                name: firstName,
                lastName: lastName,
                address: `${shipping.street}${shipping.landmark ? ', ' + shipping.landmark : ''}`,
                address2: '',
                city: shipping.city,
                pincode: shipping.zipCode,
                state: shipping.state,
                country: shipping.country,
                email: user.email,
                phone: shipping.phone || user.phone || '9999999999',
            },
            shipping: null,
            items: order.orderItems.map((item) => ({
                name: item.name,
                sku: `SKU-${item.product._id.toString().slice(-8)}`,
                quantity: item.quantity,
                price: item.price,
                discount: 0,
                tax: 0,
                hsn: '',
            })),
            paymentMethod: order.paymentMethod,
            subTotal: order.totalPrice,
            shippingCharges: order.shippingPrice,
            discount: (order.comboDiscount || 0) + (order.couponDiscount || 0),
            weight: totalWeight,
            length: 15,
            breadth: 12,
            height: 8,
        };

        const shiprocketResponse = await createShiprocketOrder(shiprocketData);

        if (shiprocketResponse.success) {
            order.shiprocket = {
                shiprocketOrderId: shiprocketResponse.shiprocketOrderId,
                shiprocketShipmentId: shiprocketResponse.shiprocketShipmentId,
                awbCode: shiprocketResponse.awbCode,
                courierName: shiprocketResponse.courierName,
                shippingStatus: 'pending',
                createdAt: new Date(),
                error: null,
            };

            if (shiprocketResponse.awbCode) {
                order.trackingNumber = shiprocketResponse.awbCode;
            }

            await order.save();

            res.status(200).json({
                success: true,
                message: 'Shiprocket order created successfully',
                shiprocket: order.shiprocket,
            });
        } else {
            throw new Error('Failed to create Shiprocket order');
        }
    } catch (error) {
        console.error('Retry Shiprocket order error:', error);
        next(error);
    }
};

/**
 * @desc    Schedule pickup for Shiprocket order
 * @route   POST /api/shiprocket/schedule-pickup/:orderId
 * @access  Admin
 */
export const scheduleOrderPickup = async (req, res, next) => {
    try {
        const { pickupDate } = req.body; // YYYY-MM-DD format

        if (!pickupDate) {
            return res.status(400).json({ success: false, message: 'Pickup date is required' });
        }

        const order = await Order.findById(req.params.orderId);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (!order.shiprocket?.shiprocketShipmentId) {
            return res.status(400).json({
                success: false,
                message: 'Shiprocket shipment not found for this order',
            });
        }

        const result = await schedulePickup(order.shiprocket.shiprocketShipmentId, pickupDate);

        if (result.success) {
            order.shiprocket.pickupScheduledDate = new Date(pickupDate);
            order.shiprocket.shippingStatus = 'pickup_scheduled';
            await order.save();

            res.status(200).json({
                success: true,
                message: 'Pickup scheduled successfully',
                pickup: result,
            });
        } else {
            throw new Error('Failed to schedule pickup');
        }
    } catch (error) {
        console.error('Schedule pickup error:', error);
        next(error);
    }
};

/**
 * @desc    Generate shipping label
 * @route   GET /api/shiprocket/generate-label/:orderId
 * @access  Admin
 */
export const generateShippingLabel = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.orderId);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (!order.shiprocket?.shiprocketShipmentId) {
            return res.status(400).json({
                success: false,
                message: 'Shiprocket shipment not found for this order',
            });
        }

        const result = await generateLabel([order.shiprocket.shiprocketShipmentId]);

        if (result.success) {
            res.status(200).json({
                success: true,
                labelUrl: result.labelUrl,
                message: 'Label generated successfully',
            });
        } else {
            throw new Error('Failed to generate label');
        }
    } catch (error) {
        console.error('Generate label error:', error);
        next(error);
    }
};

/**
 * @desc    Get tracking details
 * @route   GET /api/shiprocket/track/:orderId
 * @access  Public
 */
export const getTrackingDetails = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.orderId);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Ownership check: only the order owner or an admin may view tracking details
        if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to view this order tracking' });
        }

        if (!order.shiprocket?.shiprocketShipmentId) {
            return res.status(400).json({
                success: false,
                message: 'Tracking information not available yet',
            });
        }

        const result = await trackShipment(order.shiprocket.shiprocketShipmentId);

        if (result.success) {
            res.status(200).json({
                success: true,
                tracking: result.tracking,
                order: {
                    orderNumber: order.orderNumber,
                    awbCode: order.shiprocket.awbCode,
                    courierName: order.shiprocket.courierName,
                    shippingStatus: order.shiprocket.shippingStatus,
                },
            });
        } else {
            throw new Error('Failed to get tracking details');
        }
    } catch (error) {
        console.error('Get tracking error:', error);
        next(error);
    }
};

/**
 * @desc    Cancel Shiprocket shipment
 * @route   POST /api/shiprocket/cancel/:orderId
 * @access  Admin
 */
export const cancelShiprocketShipment = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.orderId);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (!order.shiprocket?.shiprocketOrderId) {
            return res.status(400).json({
                success: false,
                message: 'Shiprocket order not found',
            });
        }

        const result = await cancelShipment([order.shiprocket.shiprocketOrderId]);

        if (result.success) {
            order.shiprocket.shippingStatus = 'cancelled';
            order.orderStatus = 'Cancelled';
            await order.save();

            res.status(200).json({
                success: true,
                message: 'Shipment cancelled successfully',
            });
        } else {
            throw new Error('Failed to cancel shipment');
        }
    } catch (error) {
        console.error('Cancel shipment error:', error);
        next(error);
    }
};

/**
 * @desc    Get shipping rates (serviceability check)
 * @route   POST /api/shiprocket/shipping-rates
 * @access  Public
 */
export const getShippingRatesController = async (req, res, next) => {
    try {
        const { deliveryPostcode, weight = 0.5, cod = 0 } = req.body;

        if (!deliveryPostcode) {
            return res.status(400).json({
                success: false,
                message: 'Delivery postcode is required',
            });
        }

        // Pickup postcode from env or default
        const pickupPostcode = process.env.SHIPROCKET_PICKUP_PINCODE || '110025';

        const result = await getShippingRates({
            pickupPostcode,
            deliveryPostcode,
            weight,
            cod,
        });

        if (result.success) {
            res.status(200).json({
                success: true,
                couriers: result.available,
            });
        } else {
            throw new Error('Failed to get shipping rates');
        }
    } catch (error) {
        console.error('Get shipping rates error:', error);
        next(error);
    }
};

/**
 * @desc    Bulk schedule pickup for multiple orders
 * @route   POST /api/shiprocket/bulk-schedule-pickup
 * @access  Admin
 */
export const bulkSchedulePickup = async (req, res, next) => {
    try {
        const { orderIds, pickupDate } = req.body;

        if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Order IDs array is required',
            });
        }

        if (!pickupDate) {
            return res.status(400).json({
                success: false,
                message: 'Pickup date is required',
            });
        }

        const results = {
            success: [],
            failed: [],
        };

        for (const orderId of orderIds) {
            try {
                const order = await Order.findById(orderId);

                if (!order || !order.shiprocket?.shiprocketShipmentId) {
                    results.failed.push({ orderId, reason: 'Order or shipment not found' });
                    continue;
                }

                const result = await schedulePickup(order.shiprocket.shiprocketShipmentId, pickupDate);

                if (result.success) {
                    order.shiprocket.pickupScheduledDate = new Date(pickupDate);
                    order.shiprocket.shippingStatus = 'pickup_scheduled';
                    await order.save();
                    results.success.push({ orderId, orderNumber: order.orderNumber });
                } else {
                    results.failed.push({ orderId, reason: 'Pickup scheduling failed' });
                }
            } catch (err) {
                results.failed.push({ orderId, reason: err.message });
            }
        }

        res.status(200).json({
            success: true,
            message: `Scheduled ${results.success.length} orders, ${results.failed.length} failed`,
            results,
        });
    } catch (error) {
        console.error('Bulk schedule pickup error:', error);
        next(error);
    }
};

/**
 * @desc    Get Shiprocket order details from Shiprocket API
 * @route   GET /api/shiprocket/order-details/:orderNumber
 * @access  Admin
 */
export const getShiprocketOrder = async (req, res, next) => {
    try {
        const { orderNumber } = req.params;

        const result = await getShiprocketOrderDetails(orderNumber);

        if (result.success) {
            res.status(200).json({
                success: true,
                order: result.order,
            });
        } else {
            throw new Error('Failed to get order details');
        }
    } catch (error) {
        console.error('Get Shiprocket order error:', error);
        next(error);
    }
};
