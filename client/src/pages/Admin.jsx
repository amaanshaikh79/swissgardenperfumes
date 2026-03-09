import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
    FiPackage, FiUsers, FiShoppingBag, FiDollarSign, FiTrendingUp,
    FiTrash2, FiMail, FiCalendar, FiPhone, FiMapPin, FiShield,
    FiUserCheck, FiUserX, FiRefreshCw, FiMessageSquare, FiEye,
    FiChevronDown, FiChevronUp, FiPlus, FiEdit2
} from 'react-icons/fi';
import { adminAPI, productsAPI, ordersAPI, contactAPI } from '../services/api';
import toast from 'react-hot-toast';
import ProductModal from '../components/admin/ProductModal';
import './Admin.css';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState(null);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedUser, setExpandedUser] = useState(null);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [expandedOrder, setExpandedOrder] = useState(null);

    const fetchData = async (tab) => {
        setLoading(true);
        try {
            if (tab === 'overview') {
                const { data } = await adminAPI.getStats();
                setStats(data.stats || data);
            } else if (tab === 'products') {
                const { data } = await productsAPI.getAll({ limit: 100 });
                setProducts(data.products);
            } else if (tab === 'orders') {
                const { data } = await ordersAPI.getAll();
                setOrders(data.orders);
            } else if (tab === 'users') {
                const { data } = await adminAPI.getUsers();
                setUsers(data.users);
            } else if (tab === 'contacts') {
                const { data } = await contactAPI.getAll();
                setContacts(data.contacts || []);
            }
        } catch (err) {
            console.error('Admin fetch error:', err);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(activeTab);
    }, [activeTab]);

    const handleRefresh = () => fetchData(activeTab);

    // Order actions
    const updateOrderStatus = async (orderId, status) => {
        try {
            await ordersAPI.updateStatus(orderId, { status });
            setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, orderStatus: status } : o));
            toast.success(`Order updated to ${status}`);
        } catch {
            toast.error('Failed to update order');
        }
    };

    // Product actions
    const openAddProduct = () => {
        setEditingProduct(null);
        setIsProductModalOpen(true);
    };

    const openEditProduct = (product) => {
        setEditingProduct(product);
        setIsProductModalOpen(true);
    };

    const handleSaveProduct = async (productData) => {
        try {
            if (editingProduct) {
                await productsAPI.update(editingProduct._id, productData);
                toast.success('Product updated successfully');
            } else {
                await productsAPI.create(productData);
                toast.success('Product created successfully');
            }
            fetchData('products');
            setIsProductModalOpen(false);
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to save product');
        }
    };

    const deleteProduct = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            await productsAPI.delete(productId);
            setProducts((prev) => prev.filter((p) => p._id !== productId));
            toast.success('Product deleted');
        } catch {
            toast.error('Failed to delete product');
        }
    };

    // User actions
    const updateUserRole = async (userId, role) => {
        try {
            await adminAPI.updateUserRole(userId, { role });
            setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, role } : u));
            toast.success(`User role updated to ${role}`);
        } catch {
            toast.error('Failed to update user role');
        }
    };

    const deleteUser = async (userId, name) => {
        if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
        try {
            await adminAPI.deleteUser(userId);
            setUsers((prev) => prev.filter((u) => u._id !== userId));
            toast.success('User deleted');
        } catch {
            toast.error('Failed to delete user');
        }
    };

    // Contact actions
    const deleteContact = async (contactId) => {
        try {
            await contactAPI.delete(contactId);
            setContacts((prev) => prev.filter((c) => c._id !== contactId));
            toast.success('Message deleted');
        } catch {
            toast.error('Failed to delete message');
        }
    };

    const tabs = [
        { key: 'overview', label: 'Overview', icon: <FiTrendingUp size={16} /> },
        { key: 'users', label: 'Users', icon: <FiUsers size={16} /> },
        { key: 'products', label: 'Products', icon: <FiPackage size={16} /> },
        { key: 'orders', label: 'Orders', icon: <FiShoppingBag size={16} /> },
        { key: 'contacts', label: 'Messages', icon: <FiMessageSquare size={16} /> },
    ];

    const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    });

    const formatDateTime = (date) => new Date(date).toLocaleString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    return (
        <>
            <Helmet><title>Admin Dashboard | swissgarden Perfumes</title></Helmet>
            <div className="admin-page">
                <div className="container">
                    <div className="admin-header">
                        <h1 className="page-title">Admin Dashboard</h1>
                        <button className="btn btn-ghost btn-sm" onClick={handleRefresh}>
                            <FiRefreshCw size={14} /> Refresh
                        </button>
                    </div>

                    <div className="admin-tabs">
                        {tabs.map((tab) => (
                            <button key={tab.key}
                                className={`admin-tab ${activeTab === tab.key ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.key)}
                            >
                                {tab.icon} {tab.label}
                                {tab.key === 'users' && users.length > 0 && (
                                    <span className="admin-tab-count">{users.length}</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="page-loader"><div className="spinner" /></div>
                    ) : (
                        <div className="admin-content">

                            {/* ═══ OVERVIEW TAB ═══ */}
                            {activeTab === 'overview' && stats && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <div className="admin-stats-grid">
                                        <div className="admin-stat-card">
                                            <div className="stat-icon stat-icon-revenue"><FiDollarSign size={24} /></div>
                                            <div>
                                                <span className="stat-value">${stats.totalRevenue?.toFixed(0) || '0'}</span>
                                                <span className="stat-label">Total Revenue</span>
                                            </div>
                                        </div>
                                        <div className="admin-stat-card">
                                            <div className="stat-icon stat-icon-orders"><FiShoppingBag size={24} /></div>
                                            <div>
                                                <span className="stat-value">{stats.totalOrders || 0}</span>
                                                <span className="stat-label">Total Orders</span>
                                            </div>
                                        </div>
                                        <div className="admin-stat-card">
                                            <div className="stat-icon stat-icon-products"><FiPackage size={24} /></div>
                                            <div>
                                                <span className="stat-value">{stats.totalProducts || 0}</span>
                                                <span className="stat-label">Active Products</span>
                                            </div>
                                        </div>
                                        <div className="admin-stat-card">
                                            <div className="stat-icon stat-icon-users"><FiUsers size={24} /></div>
                                            <div>
                                                <span className="stat-value">{stats.totalUsers || 0}</span>
                                                <span className="stat-label">Registered Users</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Status Breakdown */}
                                    {stats.ordersByStatus?.length > 0 && (
                                        <div className="admin-section">
                                            <h3 className="admin-section-title">Orders by Status</h3>
                                            <div className="admin-status-pills">
                                                {stats.ordersByStatus.map((s) => (
                                                    <div key={s._id} className="admin-status-pill">
                                                        <span className={`badge badge-${s._id === 'Delivered' ? 'success' : s._id === 'Cancelled' ? 'error' : 'gold'}`}>
                                                            {s._id}
                                                        </span>
                                                        <span className="admin-status-count">{s.count}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Recent Orders */}
                                    {stats.recentOrders?.length > 0 && (
                                        <div className="admin-section">
                                            <h3 className="admin-section-title">Recent Orders</h3>
                                            <div className="admin-table-wrap">
                                                <table className="admin-table">
                                                    <thead>
                                                        <tr><th>Order #</th><th>Customer</th><th>Email</th><th>Total</th><th>Status</th><th>Payment</th><th>Date</th></tr>
                                                    </thead>
                                                    <tbody>
                                                        {stats.recentOrders.map((o) => (
                                                            <tr key={o._id}>
                                                                <td className="admin-accent">{o.orderNumber}</td>
                                                                <td>{o.user?.firstName} {o.user?.lastName}</td>
                                                                <td className="admin-muted">{o.user?.email}</td>
                                                                <td className="admin-accent">${o.totalPrice?.toFixed(2)}</td>
                                                                <td><span className={`badge badge-${o.orderStatus === 'Delivered' ? 'success' : o.orderStatus === 'Cancelled' ? 'error' : 'gold'}`}>{o.orderStatus}</span></td>
                                                                <td><span className={`badge ${o.isPaid ? 'badge-success' : 'badge-warning'}`}>{o.isPaid ? 'Paid' : 'Pending'}</span></td>
                                                                <td className="admin-muted">{formatDate(o.createdAt)}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {/* Top Products */}
                                    {stats.topProducts?.length > 0 && (
                                        <div className="admin-section">
                                            <h3 className="admin-section-title">Top Selling Products</h3>
                                            <div className="admin-table-wrap">
                                                <table className="admin-table">
                                                    <thead><tr><th>Product</th><th>Price</th><th>Sold</th></tr></thead>
                                                    <tbody>
                                                        {stats.topProducts.map((p) => (
                                                            <tr key={p._id}>
                                                                <td>
                                                                    <div className="admin-product-cell">
                                                                        {p.images?.[0]?.url && <img src={p.images[0].url} alt={p.name} className="admin-product-thumb" />}
                                                                        <span>{p.name}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="admin-accent">${p.price?.toFixed(2)}</td>
                                                                <td>{p.sold || 0}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* ═══ USERS TAB ═══ */}
                            {activeTab === 'users' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <div className="admin-section-bar">
                                        <h3 className="admin-section-title">
                                            All Registered Users <span className="admin-count-badge">{users.length}</span>
                                        </h3>
                                    </div>

                                    {users.length === 0 ? (
                                        <div className="admin-empty">
                                            <FiUsers size={48} />
                                            <p>No users registered yet</p>
                                        </div>
                                    ) : (
                                        <div className="admin-users-list">
                                            {users.map((u, i) => (
                                                <motion.div
                                                    key={u._id}
                                                    className="admin-user-card"
                                                    initial={{ opacity: 0, y: 15 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.05 }}
                                                >
                                                    <div className="admin-user-main" onClick={() => setExpandedUser(expandedUser === u._id ? null : u._id)}>
                                                        <div className="admin-user-avatar">
                                                            {u.firstName?.[0]}{u.lastName?.[0]}
                                                        </div>
                                                        <div className="admin-user-info">
                                                            <h4 className="admin-user-name">{u.firstName} {u.lastName}</h4>
                                                            <div className="admin-user-meta">
                                                                <span><FiMail size={12} /> {u.email}</span>
                                                                {u.phone && <span><FiPhone size={12} /> {u.phone}</span>}
                                                            </div>
                                                        </div>
                                                        <div className="admin-user-badges">
                                                            <span className={`badge badge-${u.role === 'admin' ? 'gold' : 'default'}`}>
                                                                {u.role === 'admin' ? '👑 Admin' : '👤 User'}
                                                            </span>
                                                        </div>
                                                        <div className="admin-user-date">
                                                            <FiCalendar size={12} />
                                                            <span>Joined {formatDate(u.createdAt)}</span>
                                                        </div>
                                                        <button className="admin-user-expand">
                                                            {expandedUser === u._id ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                                                        </button>
                                                    </div>

                                                    {/* Expanded Details */}
                                                    {expandedUser === u._id && (
                                                        <motion.div
                                                            className="admin-user-details"
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                        >
                                                            <div className="admin-user-detail-grid">
                                                                <div className="admin-user-detail-item">
                                                                    <span className="admin-detail-label">User ID</span>
                                                                    <span className="admin-detail-value admin-mono">{u._id}</span>
                                                                </div>
                                                                <div className="admin-user-detail-item">
                                                                    <span className="admin-detail-label">Email</span>
                                                                    <span className="admin-detail-value">{u.email}</span>
                                                                </div>
                                                                <div className="admin-user-detail-item">
                                                                    <span className="admin-detail-label">Phone</span>
                                                                    <span className="admin-detail-value">{u.phone || '—'}</span>
                                                                </div>
                                                                <div className="admin-user-detail-item">
                                                                    <span className="admin-detail-label">Registered</span>
                                                                    <span className="admin-detail-value">{formatDateTime(u.createdAt)}</span>
                                                                </div>
                                                                <div className="admin-user-detail-item">
                                                                    <span className="admin-detail-label">Last Updated</span>
                                                                    <span className="admin-detail-value">{formatDateTime(u.updatedAt)}</span>
                                                                </div>
                                                                <div className="admin-user-detail-item">
                                                                    <span className="admin-detail-label">Wishlist Items</span>
                                                                    <span className="admin-detail-value">{u.wishlist?.length || 0}</span>
                                                                </div>
                                                                {u.addresses?.length > 0 && (
                                                                    <div className="admin-user-detail-item admin-detail-full">
                                                                        <span className="admin-detail-label">Addresses</span>
                                                                        <div className="admin-detail-addresses">
                                                                            {u.addresses.map((addr, ai) => (
                                                                                <span key={ai} className="admin-address-tag">
                                                                                    <FiMapPin size={10} /> {addr.street}, {addr.city}, {addr.state} {addr.zipCode}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className="admin-user-actions">
                                                                {u.role === 'user' ? (
                                                                    <button className="btn btn-sm btn-outline" onClick={() => updateUserRole(u._id, 'admin')}>
                                                                        <FiUserCheck size={14} /> Promote to Admin
                                                                    </button>
                                                                ) : (
                                                                    <button className="btn btn-sm btn-ghost" onClick={() => updateUserRole(u._id, 'user')}>
                                                                        <FiUserX size={14} /> Demote to User
                                                                    </button>
                                                                )}
                                                                <button className="btn btn-sm btn-danger" onClick={() => deleteUser(u._id, `${u.firstName} ${u.lastName}`)}>
                                                                    <FiTrash2 size={14} /> Delete User
                                                                </button>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* ═══ PRODUCTS TAB ═══ */}
                            {activeTab === 'products' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <div className="admin-section-bar">
                                        <h3 className="admin-section-title">
                                            All Products <span className="admin-count-badge">{products.length}</span>
                                        </h3>
                                        <button className="btn btn-sm btn-primary" onClick={openAddProduct}>
                                            <FiPlus size={16} /> Add Product
                                        </button>
                                    </div>
                                    <div className="admin-table-wrap">
                                        <table className="admin-table">
                                            <thead>
                                                <tr><th>Product</th><th>Brand</th><th>Category</th><th>Price</th><th>Stock</th><th>Rating</th><th>Sold</th><th>Actions</th></tr>
                                            </thead>
                                            <tbody>
                                                {products.map((p) => (
                                                    <tr key={p._id}>
                                                        <td>
                                                            <div className="admin-product-cell">
                                                                {p.images?.[0]?.url && <img src={p.images[0].url} alt={p.name} className="admin-product-thumb" />}
                                                                <div>
                                                                    <span className="admin-product-name">{p.name}</span>
                                                                    <span className="admin-product-sub">{p.gender} · {p.size}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>{p.brand}</td>
                                                        <td className="admin-muted">{p.category}</td>
                                                        <td className="admin-accent">${p.price.toFixed(2)}</td>
                                                        <td>
                                                            <span className={`badge badge-${p.stock > 10 ? 'success' : p.stock > 0 ? 'warning' : 'error'}`}>
                                                                {p.stock}
                                                            </span>
                                                        </td>
                                                        <td>{p.rating ? `⭐ ${p.rating}` : '—'}</td>
                                                        <td>{p.sold || 0}</td>
                                                        <td>
                                                            <div className="admin-actions">
                                                                <button className="admin-action-btn" onClick={() => openEditProduct(p)} title="Edit">
                                                                    <FiEdit2 size={14} />
                                                                </button>
                                                                <button className="admin-action-btn admin-action-danger" onClick={() => deleteProduct(p._id)} title="Delete">
                                                                    <FiTrash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </motion.div>
                            )}

                            {/* ═══ ORDERS TAB ═══ */}
                            {activeTab === 'orders' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <div className="admin-section-bar">
                                        <h3 className="admin-section-title">
                                            All Orders <span className="admin-count-badge">{orders.length}</span>
                                        </h3>
                                    </div>
                                    {orders.length === 0 ? (
                                        <div className="admin-empty">
                                            <FiShoppingBag size={48} />
                                            <p>No orders yet</p>
                                        </div>
                                    ) : (
                                        <div className="admin-table-wrap">
                                            <table className="admin-table">
                                                <thead>
                                                    <tr><th>Order #</th><th>Customer</th><th>Email</th><th>Items</th><th>Total</th><th>Status</th><th>Payment</th><th>Date</th></tr>
                                                </thead>
                                                <tbody>
                                                    {orders.map((o) => (
                                                        <React.Fragment key={o._id}>
                                                            <tr className="admin-order-row" onClick={() => setExpandedOrder(expandedOrder === o._id ? null : o._id)} style={{ cursor: 'pointer' }}>
                                                                <td className="admin-accent">
                                                                    {o.orderNumber}
                                                                    {expandedOrder === o._id ? <FiChevronUp size={14} style={{ marginLeft: '5px' }} /> : <FiChevronDown size={14} style={{ marginLeft: '5px' }} />}
                                                                </td>
                                                                <td>{o.user?.firstName} {o.user?.lastName}</td>
                                                                <td className="admin-muted">{o.user?.email}</td>
                                                                <td>{o.orderItems?.length || 0} items</td>
                                                                <td className="admin-accent">${o.totalPrice?.toFixed(2)}</td>
                                                                <td onClick={(e) => e.stopPropagation()}>
                                                                    <select className="admin-status-select" value={o.orderStatus}
                                                                        onChange={(e) => updateOrderStatus(o._id, e.target.value)}>
                                                                        {['Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].map((s) => (
                                                                            <option key={s} value={s}>{s}</option>
                                                                        ))}
                                                                    </select>
                                                                </td>
                                                                <td><span className={`badge ${o.isPaid ? 'badge-success' : 'badge-warning'}`}>{o.isPaid ? 'Paid' : 'Pending'}</span></td>
                                                                <td className="admin-muted">{formatDate(o.createdAt)}</td>
                                                            </tr>
                                                            {expandedOrder === o._id && (
                                                                <tr>
                                                                    <td colSpan="8" style={{ padding: 0 }}>
                                                                        <motion.div
                                                                            initial={{ opacity: 0, height: 0 }}
                                                                            animate={{ opacity: 1, height: 'auto' }}
                                                                            className="admin-order-details"
                                                                        >
                                                                            <div className="admin-order-grid">
                                                                                <div className="admin-order-items">
                                                                                    <h4 className="admin-detail-label">Order Items</h4>
                                                                                    {o.orderItems.map((item, idx) => (
                                                                                        <div key={idx} className="admin-order-item">
                                                                                            <img src={item.image} alt={item.name} className="admin-order-item-thumb" />
                                                                                            <div className="admin-order-item-info">
                                                                                                <span className="admin-order-item-name">{item.name}</span>
                                                                                                <span className="admin-order-item-meta">{item.size} · x{item.quantity}</span>
                                                                                            </div>
                                                                                            <span className="admin-order-item-price">${(item.price * item.quantity).toFixed(2)}</span>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                                <div className="admin-order-sidebar">
                                                                                    <div className="admin-order-summary">
                                                                                        <h4 className="admin-detail-label">Order Summary</h4>
                                                                                        <div className="admin-summary-row"><span>Subtotal</span> <span>${o.itemsPrice?.toFixed(2)}</span></div>
                                                                                        <div className="admin-summary-row"><span>Tax</span> <span>${o.taxPrice?.toFixed(2)}</span></div>
                                                                                        <div className="admin-summary-row"><span>Shipping</span> <span>${o.shippingPrice?.toFixed(2)}</span></div>
                                                                                        <div className="admin-summary-row admin-summary-total"><span>Total</span> <span>${o.totalPrice?.toFixed(2)}</span></div>
                                                                                    </div>
                                                                                    <div className="admin-order-address">
                                                                                        <h4 className="admin-detail-label">Shipping Address</h4>
                                                                                        <div className="admin-address-text">
                                                                                            <p>{o.shippingAddress?.street}</p>
                                                                                            <p>{o.shippingAddress?.city}, {o.shippingAddress?.state} {o.shippingAddress?.zipCode}</p>
                                                                                            <p>{o.shippingAddress?.country}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="admin-order-address">
                                                                                        <h4 className="admin-detail-label">Payment</h4>
                                                                                        <div className="admin-address-text">
                                                                                            <p>Method: {o.paymentMethod.toUpperCase()}</p>
                                                                                            <p>Status: {o.isPaid ? 'Paid' : 'Unpaid'}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </motion.div>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </React.Fragment>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* ═══ CONTACTS/MESSAGES TAB ═══ */}
                            {activeTab === 'contacts' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <div className="admin-section-bar">
                                        <h3 className="admin-section-title">
                                            Contact Messages <span className="admin-count-badge">{contacts.length}</span>
                                        </h3>
                                    </div>
                                    {contacts.length === 0 ? (
                                        <div className="admin-empty">
                                            <FiMessageSquare size={48} />
                                            <p>No messages yet</p>
                                        </div>
                                    ) : (
                                        <div className="admin-messages-list">
                                            {contacts.map((c, i) => (
                                                <motion.div
                                                    key={c._id}
                                                    className={`admin-message-card ${c.status === 'unread' ? 'unread' : ''}`}
                                                    initial={{ opacity: 0, y: 15 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.05 }}
                                                >
                                                    <div className="admin-message-header">
                                                        <div>
                                                            <h4 className="admin-message-name">{c.name}</h4>
                                                            <span className="admin-message-email">{c.email}</span>
                                                        </div>
                                                        <div className="admin-message-meta">
                                                            <span className={`badge badge-${c.status === 'unread' ? 'gold' : c.status === 'replied' ? 'success' : 'default'}`}>
                                                                {c.status}
                                                            </span>
                                                            <span className="admin-message-date">{formatDate(c.createdAt)}</span>
                                                        </div>
                                                    </div>
                                                    <h5 className="admin-message-subject">{c.subject}</h5>
                                                    <p className="admin-message-body">{c.message}</p>
                                                    <div className="admin-message-actions">
                                                        <button className="admin-action-btn admin-action-danger" onClick={() => deleteContact(c._id)}>
                                                            <FiTrash2 size={14} /> Delete
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                        </div>
                    )}
                </div>
            </div>
            <ProductModal
                isOpen={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                product={editingProduct}
                onSave={handleSaveProduct}
            />
        </>
    );
};

export default AdminDashboard;
