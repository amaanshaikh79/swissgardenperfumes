import axios from 'axios';

/**
 * Shiprocket API Service
 * 
 * Credentials:
 * Email: adnan2015mohd@gmail.com
 * Password: swissgarden$100m
 */

const SHIPROCKET_API_URL = 'https://apiv2.shiprocket.in/v1/external';

// Cache for auth token (expires in 10 days)
let authToken = null;
let tokenExpiry = null;

/**
 * Authenticate with Shiprocket and get token
 * @returns {Promise<string>} Auth token
 */
export const authenticateShiprocket = async () => {
    try {
        // Return cached token if still valid (with 1 hour buffer)
        if (authToken && tokenExpiry && new Date() < new Date(tokenExpiry - 3600000)) {
            return authToken;
        }

        const email = process.env.SHIPROCKET_EMAIL || 'adnan2015mohd@gmail.com';
        const password = process.env.SHIPROCKET_PASSWORD || 'swissgarden$100m';

        console.log('🔐 Authenticating with Shiprocket...');

        const response = await axios.post(`${SHIPROCKET_API_URL}/auth/login`, {
            email,
            password,
        });

        if (response.data && response.data.token) {
            authToken = response.data.token;
            // Shiprocket tokens expire in 10 days
            tokenExpiry = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
            console.log('✅ Shiprocket authentication successful');
            return authToken;
        }

        throw new Error('No token received from Shiprocket');
    } catch (error) {
        console.error('❌ Shiprocket authentication failed:', error.response?.data || error.message);
        throw new Error(`Shiprocket authentication failed: ${error.response?.data?.message || error.message}`);
    }
};

/**
 * Create order in Shiprocket
 * @param {Object} orderData - Order details
 * @returns {Promise<Object>} Shiprocket order response
 */
export const createShiprocketOrder = async (orderData) => {
    try {
        const token = await authenticateShiprocket();

        const {
            orderNumber,
            orderDate,
            pickupLocation = 'Primary',
            channelId = '',
            comment = '',
            billing,
            shipping,
            items,
            paymentMethod,
            subTotal,
            length = 10,
            breadth = 10,
            height = 5,
            weight = 0.5,
        } = orderData;

        // Shiprocket order payload
        const payload = {
            order_id: orderNumber,
            order_date: orderDate,
            pickup_location: pickupLocation,
            channel_id: channelId,
            comment: comment,
            billing_customer_name: billing.name,
            billing_last_name: billing.lastName || '',
            billing_address: billing.address,
            billing_address_2: billing.address2 || '',
            billing_city: billing.city,
            billing_pincode: billing.pincode,
            billing_state: billing.state,
            billing_country: billing.country,
            billing_email: billing.email,
            billing_phone: billing.phone,
            shipping_is_billing: shipping ? false : true,
            shipping_customer_name: shipping ? shipping.name : billing.name,
            shipping_last_name: shipping ? (shipping.lastName || '') : (billing.lastName || ''),
            shipping_address: shipping ? shipping.address : billing.address,
            shipping_address_2: shipping ? (shipping.address2 || '') : (billing.address2 || ''),
            shipping_city: shipping ? shipping.city : billing.city,
            shipping_pincode: shipping ? shipping.pincode : billing.pincode,
            shipping_country: shipping ? shipping.country : billing.country,
            shipping_state: shipping ? shipping.state : billing.state,
            shipping_email: shipping ? shipping.email : billing.email,
            shipping_phone: shipping ? shipping.phone : billing.phone,
            order_items: items.map((item) => ({
                name: item.name,
                sku: item.sku || item.name.replace(/\s+/g, '-').toLowerCase(),
                units: item.quantity,
                selling_price: item.price,
                discount: item.discount || 0,
                tax: item.tax || 0,
                hsn: item.hsn || '',
            })),
            payment_method: paymentMethod === 'cod' ? 'COD' : 'Prepaid',
            shipping_charges: orderData.shippingCharges || 0,
            giftwrap_charges: 0,
            transaction_charges: 0,
            total_discount: orderData.discount || 0,
            sub_total: subTotal,
            length: length,
            breadth: breadth,
            height: height,
            weight: weight,
        };

        console.log(`📦 Creating Shiprocket order: ${orderNumber}`);

        const response = await axios.post(
            `${SHIPROCKET_API_URL}/orders/create/adhoc`,
            payload,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            }
        );

        if (response.data && response.data.order_id) {
            console.log(`✅ Shiprocket order created: ID ${response.data.order_id}, Shipment ID ${response.data.shipment_id}`);
            return {
                success: true,
                shiprocketOrderId: response.data.order_id,
                shiprocketShipmentId: response.data.shipment_id,
                awbCode: response.data.awb_code || null,
                courierName: response.data.courier_name || null,
            };
        }

        throw new Error('Failed to create order in Shiprocket');
    } catch (error) {
        console.error('❌ Shiprocket order creation failed:', error.response?.data || error.message);
        throw new Error(`Shiprocket order creation failed: ${error.response?.data?.message || error.message}`);
    }
};

/**
 * Get shipping rates (serviceability check)
 * @param {Object} params - { pickup_postcode, delivery_postcode, weight, cod }
 * @returns {Promise<Object>} Available courier options with rates
 */
export const getShippingRates = async ({ pickupPostcode, deliveryPostcode, weight, cod = 0 }) => {
    try {
        const token = await authenticateShiprocket();

        const response = await axios.get(`${SHIPROCKET_API_URL}/courier/serviceability`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            params: {
                pickup_postcode: pickupPostcode,
                delivery_postcode: deliveryPostcode,
                weight: weight,
                cod: cod,
            },
        });

        return {
            success: true,
            available: response.data.data?.available_courier_companies || [],
        };
    } catch (error) {
        console.error('❌ Shiprocket serviceability check failed:', error.response?.data || error.message);
        throw new Error(`Serviceability check failed: ${error.response?.data?.message || error.message}`);
    }
};

/**
 * Track shipment by AWB code or Order ID
 * @param {string} shipmentId - Shipment ID or AWB code
 * @returns {Promise<Object>} Tracking details
 */
export const trackShipment = async (shipmentId) => {
    try {
        const token = await authenticateShiprocket();

        const response = await axios.get(
            `${SHIPROCKET_API_URL}/courier/track/shipment/${shipmentId}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            }
        );

        return {
            success: true,
            tracking: response.data,
        };
    } catch (error) {
        console.error('❌ Shiprocket tracking failed:', error.response?.data || error.message);
        throw new Error(`Tracking failed: ${error.response?.data?.message || error.message}`);
    }
};

/**
 * Generate shipping label
 * @param {Array<number>} shipmentIds - Array of shipment IDs
 * @returns {Promise<Object>} Label URL
 */
export const generateLabel = async (shipmentIds) => {
    try {
        const token = await authenticateShiprocket();

        const response = await axios.post(
            `${SHIPROCKET_API_URL}/courier/generate/label`,
            { shipment_id: shipmentIds },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            }
        );

        return {
            success: true,
            labelUrl: response.data.label_url || response.data.label_created,
        };
    } catch (error) {
        console.error('❌ Shiprocket label generation failed:', error.response?.data || error.message);
        throw new Error(`Label generation failed: ${error.response?.data?.message || error.message}`);
    }
};

/**
 * Schedule pickup
 * @param {number} shipmentId - Shipment ID
 * @param {string} pickupDate - Pickup date (YYYY-MM-DD format)
 * @returns {Promise<Object>} Pickup response
 */
export const schedulePickup = async (shipmentId, pickupDate) => {
    try {
        const token = await authenticateShiprocket();

        const response = await axios.post(
            `${SHIPROCKET_API_URL}/courier/generate/pickup`,
            {
                shipment_id: [shipmentId],
                pickup_date: pickupDate,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            }
        );

        return {
            success: true,
            pickupStatus: response.data.pickup_status,
            response: response.data.response,
        };
    } catch (error) {
        console.error('❌ Shiprocket pickup scheduling failed:', error.response?.data || error.message);
        throw new Error(`Pickup scheduling failed: ${error.response?.data?.message || error.message}`);
    }
};

/**
 * Cancel shipment
 * @param {Array<number>} shipmentIds - Array of shipment IDs to cancel
 * @returns {Promise<Object>} Cancellation response
 */
export const cancelShipment = async (shipmentIds) => {
    try {
        const token = await authenticateShiprocket();

        const response = await axios.post(
            `${SHIPROCKET_API_URL}/orders/cancel`,
            { ids: shipmentIds },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            }
        );

        return {
            success: true,
            message: response.data.message || 'Shipment cancelled',
        };
    } catch (error) {
        console.error('❌ Shiprocket cancellation failed:', error.response?.data || error.message);
        throw new Error(`Shipment cancellation failed: ${error.response?.data?.message || error.message}`);
    }
};

/**
 * Get order details from Shiprocket
 * @param {string} orderNumber - Order number
 * @returns {Promise<Object>} Order details
 */
export const getShiprocketOrderDetails = async (orderNumber) => {
    try {
        const token = await authenticateShiprocket();

        const response = await axios.get(
            `${SHIPROCKET_API_URL}/orders/show/${orderNumber}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            }
        );

        return {
            success: true,
            order: response.data.data,
        };
    } catch (error) {
        console.error('❌ Shiprocket order fetch failed:', error.response?.data || error.message);
        throw new Error(`Order fetch failed: ${error.response?.data?.message || error.message}`);
    }
};

export default {
    authenticateShiprocket,
    createShiprocketOrder,
    getShippingRates,
    trackShipment,
    generateLabel,
    schedulePickup,
    cancelShipment,
    getShiprocketOrderDetails,
};
