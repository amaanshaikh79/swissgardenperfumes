import axios from 'axios';

const API = axios.create({
    baseURL: '/api',
    withCredentials: true,
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
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Don't redirect if already on login page
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
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
};

// Contact API
export const contactAPI = {
    submit: (data) => API.post('/contact', data),
    getAll: (params) => API.get('/contact', { params }),
    update: (id, data) => API.put(`/contact/${id}`, data),
    delete: (id) => API.delete(`/contact/${id}`),
};

// Payment API (Razorpay)
export const paymentAPI = {
    getConfig: () => API.get('/payment/config'),
    createOrder: (data) => API.post('/payment/create-order', data),
    verify: (data) => API.post('/payment/verify', data),
    getDetails: (paymentId) => API.get(`/payment/${paymentId}`),
};

// Admin API
export const adminAPI = {
    getStats: () => API.get('/admin/stats'),
    getUsers: (params) => API.get('/admin/users', { params }),
    updateUserRole: (id, data) => API.put(`/admin/users/${id}/role`, data),
    deleteUser: (id) => API.delete(`/admin/users/${id}`),
};

export default API;
