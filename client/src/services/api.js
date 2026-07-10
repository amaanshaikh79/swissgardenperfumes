import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') + '/api'
    : '/api';

const API = axios.create({
    baseURL,
    withCredentials: true,
    timeout: 45000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - add token
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle errors
API.interceptors.response.use(
    (response) => response,
    (error) => {
        // Detect timeout / network failures so callers can surface a retryable
        // error state instead of an infinite spinner (e.g. Render cold starts).
        if (error.code === 'ECONNABORTED' || !error.response) {
            error.isNetworkError = true;
        } else if (error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Dispatch a custom event instead of a hard redirect.
            // AuthContext listens for this event and sets user to null,
            // which causes ProtectedRoute to navigate via React Router
            // (preserving SPA state instead of forcing a full page reload).
            window.dispatchEvent(new CustomEvent('auth-unauthorized'));
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data) => API.post('/auth/register', data),
    login: (data) => API.post('/auth/login', data),
    logout: () => API.post('/auth/logout'),
    getMe: () => API.get('/auth/me'),
    updateProfile: (data) => API.put('/auth/profile', data),
    updatePassword: (data) => API.put('/auth/password', data),
    toggleWishlist: (productId) => API.put(`/auth/wishlist/${productId}`),
    forgotPassword: (data) => API.post('/auth/forgot-password', data),
    resetPassword: (token, data) => API.put(`/auth/reset-password/${token}`, data),
};

// Products API
export const productsAPI = {
    getAll: (params) => API.get('/products', { params }),
    getFeatured: () => API.get('/products/featured'),
    getBySlug: (slug) => API.get(`/products/slug/${slug}`),
    getById: (id) => API.get(`/products/${id}`),
    create: (data) => API.post('/products', data),
    update: (id, data) => API.put(`/products/${id}`, data),
    delete: (id) => API.delete(`/products/${id}`),
    addReview: (id, data) => API.post(`/products/${id}/reviews`, data),
};

// Orders API
export const ordersAPI = {
    create: (data) => API.post('/orders', data),
    getMy: () => API.get('/orders/my'),
    getById: (id) => API.get(`/orders/${id}`),
    getAll: (params) => API.get('/orders', { params }),
    updateStatus: (id, data) => API.put(`/orders/${id}/status`, data),
    updateToPaid: (id, data) => API.put(`/orders/${id}/pay`, data),
    cancel: (id) => API.put(`/orders/${id}/cancel`),
};

// Contact API
export const contactAPI = {
    submit: (data) => API.post('/contact', data),
    getAll: (params) => API.get('/contact', { params }),
    update: (id, data) => API.put(`/contact/${id}`, data),
    delete: (id) => API.delete(`/contact/${id}`),
};

// Newsletter API
export const newsletterAPI = {
    subscribe: (data) => API.post('/newsletter/subscribe', data),
};

// Payment API (Razorpay)
export const paymentAPI = {
    getConfig: () => API.get('/payment/config'),
    createOrder: (data) => API.post('/payment/create-order', data),
    verify: (data) => API.post('/payment/verify', data),
    getDetails: (paymentId) => API.get(`/payment/${paymentId}`),
};

// Coupon API
export const couponAPI = {
    apply: (data) => API.post('/coupons/apply', data),
    getAll: () => API.get('/coupons'),
    create: (data) => API.post('/coupons', data),
    update: (id, data) => API.put(`/coupons/${id}`, data),
    delete: (id) => API.delete(`/coupons/${id}`),
};

// Delivery Partner API
export const deliveryPartnerAPI = {
    getAll: () => API.get('/delivery-partners'),
    get: (id) => API.get(`/delivery-partners/${id}`),
    create: (data) => API.post('/delivery-partners', data),
    update: (id, data) => API.put(`/delivery-partners/${id}`, data),
    delete: (id) => API.delete(`/delivery-partners/${id}`),
    toggleStatus: (id) => API.patch(`/delivery-partners/${id}/toggle`),
};

// Return API
export const returnAPI = {
    getAll: () => API.get('/returns'),
    getMy: () => API.get('/returns/my'),
    get: (id) => API.get(`/returns/${id}`),
    create: (data) => API.post('/returns', data),
    updateStatus: (id, data) => API.put(`/returns/${id}/status`, data),
    cancel: (id) => API.delete(`/returns/${id}`),
};

// Chat API
export const chatAPI = {
    sendMessage: (messages) => API.post('/chat', { messages }),
};

// Shiprocket API
export const shiprocketAPI = {
    retryOrder: (orderId) => API.post(`/shiprocket/retry/${orderId}`),
    schedulePickup: (orderId, data) => API.post(`/shiprocket/schedule-pickup/${orderId}`, data),
    generateLabel: (orderId) => API.get(`/shiprocket/generate-label/${orderId}`),
    track: (orderId) => API.get(`/shiprocket/track/${orderId}`),
    cancel: (orderId) => API.post(`/shiprocket/cancel/${orderId}`),
    bulkSchedulePickup: (data) => API.post('/shiprocket/bulk-schedule-pickup', data),
    getOrderDetails: (orderNumber) => API.get(`/shiprocket/order-details/${orderNumber}`),
    getShippingRates: (data) => API.post('/shiprocket/shipping-rates', data),
};

// Admin API
export const adminAPI = {
    getStats: () => API.get('/admin/stats'),
    getUsers: (params) => API.get('/admin/users', { params }),
    updateUserRole: (id, data) => API.put(`/admin/users/${id}/role`, data),
    deleteUser: (id) => API.delete(`/admin/users/${id}`),
};

export default API;
