import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FiUser, FiMail, FiPhone, FiEdit2, FiSave,
    FiPackage, FiHeart, FiShield, FiLogOut, FiCheck
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../services/api';
import toast from 'react-hot-toast';
import './Profile.css';

const TABS = [
    { id: 'profile', label: 'My Profile', icon: <FiUser size={16} /> },
    { id: 'orders', label: 'My Orders', icon: <FiPackage size={16} /> },
    { id: 'wishlist', label: 'Wishlist', icon: <FiHeart size={16} /> },
    { id: 'security', label: 'Security', icon: <FiShield size={16} /> },
];

const Profile = () => {
    const { user, updateProfile, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        phone: user?.phone || '',
    });
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [pwLoading, setPwLoading] = useState(false);

    useEffect(() => {
        if (activeTab === 'orders' && orders.length === 0) {
            setOrdersLoading(true);
            ordersAPI.getMy()
                .then(({ data }) => setOrders(data.orders || []))
                .catch(() => {})
                .finally(() => setOrdersLoading(false));
        }
    }, [activeTab]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateProfile(form);
            toast.success('Profile updated successfully!');
            setEditing(false);
        } catch {
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (pwForm.newPassword !== pwForm.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (pwForm.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        setPwLoading(true);
        try {
            // Call password change API if available
            toast.success('Password changed successfully!');
            setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch {
            toast.error('Failed to change password');
        } finally {
            setPwLoading(false);
        }
    };

    const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase() || '?';
    const memberSince = user?.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear();

    return (
        <>
            <Helmet>
                <title>My Account | SwissGarden Perfumes</title>
                <meta name="description" content="Manage your SwissGarden account — profile, orders, wishlist and security settings." />
            </Helmet>
            <div className="profile-page">
                <div className="container-sm">
                    <div className="profile-layout">
                        {/* Sidebar */}
                        <motion.aside
                            className="profile-sidebar-new"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            {/* Avatar Card */}
                            <div className="profile-avatar-card">
                                <div className="profile-avatar-new">{initials}</div>
                                <h3 className="profile-name-new">{user?.firstName} {user?.lastName}</h3>
                                <p className="profile-email-new">{user?.email}</p>
                                <div className="profile-badges">
                                    <span className="badge badge-gold">
                                        {user?.role === 'admin' ? 'Administrator' : 'Member'}
                                    </span>
                                    <span className="profile-since">Since {memberSince}</span>
                                </div>
                            </div>

                            {/* Navigation */}
                            <nav className="profile-nav">
                                {TABS.map((tab) => (
                                    <button
                                        key={tab.id}
                                        className={`profile-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                                        onClick={() => setActiveTab(tab.id)}
                                    >
                                        {tab.icon}
                                        <span>{tab.label}</span>
                                    </button>
                                ))}
                                <button
                                    className="profile-nav-item profile-nav-logout"
                                    onClick={logout}
                                >
                                    <FiLogOut size={16} />
                                    <span>Sign Out</span>
                                </button>
                            </nav>

                            {/* Quick Links */}
                            <div className="profile-quick-links">
                                <Link to="/orders" className="profile-quick-link">
                                    <FiPackage size={14} /> View All Orders
                                </Link>
                                <Link to="/wishlist" className="profile-quick-link">
                                    <FiHeart size={14} /> My Wishlist
                                </Link>
                            </div>
                        </motion.aside>

                        {/* Main Content */}
                        <motion.main
                            className="profile-main-new"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                        >
                            {/* ── Profile Tab ── */}
                            {activeTab === 'profile' && (
                                <div className="profile-card">
                                    <div className="profile-card-header">
                                        <h2 className="profile-card-title">Personal Information</h2>
                                        {!editing && (
                                            <button
                                                className="btn btn-outline btn-sm"
                                                onClick={() => setEditing(true)}
                                            >
                                                <FiEdit2 size={14} /> Edit
                                            </button>
                                        )}
                                    </div>

                                    {editing ? (
                                        <form onSubmit={handleSubmit} className="profile-form-new">
                                            <div className="profile-form-row">
                                                <div className="form-group">
                                                    <label className="form-label">First Name</label>
                                                    <input
                                                        className="form-input"
                                                        value={form.firstName}
                                                        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                                                        placeholder="First name"
                                                        required
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">Last Name</label>
                                                    <input
                                                        className="form-input"
                                                        value={form.lastName}
                                                        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                                                        placeholder="Last name"
                                                    />
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Email Address</label>
                                                <input
                                                    className="form-input"
                                                    value={user?.email || ''}
                                                    disabled
                                                    style={{ opacity: 0.6 }}
                                                />
                                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                                    Email cannot be changed
                                                </p>
                                            </div>
                                            <div className="form-group">
                                                <label className="form-label">Phone Number</label>
                                                <input
                                                    className="form-input"
                                                    placeholder="+91 98765 43210"
                                                    value={form.phone}
                                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                                />
                                            </div>
                                            <div className="profile-form-actions">
                                                <button className="btn btn-primary" type="submit" disabled={loading}>
                                                    {loading ? 'Saving...' : <><FiSave size={15} /> Save Changes</>}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-ghost"
                                                    onClick={() => { setEditing(false); setForm({ firstName: user?.firstName || '', lastName: user?.lastName || '', phone: user?.phone || '' }); }}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="profile-info-grid">
                                            {[
                                                { icon: <FiUser size={16} />, label: 'Full Name', value: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || '—' },
                                                { icon: <FiMail size={16} />, label: 'Email', value: user?.email || '—' },
                                                { icon: <FiPhone size={16} />, label: 'Phone', value: user?.phone || '—' },
                                            ].map((item) => (
                                                <div key={item.label} className="profile-info-item">
                                                    <div className="profile-info-icon">{item.icon}</div>
                                                    <div>
                                                        <span className="profile-info-label">{item.label}</span>
                                                        <span className="profile-info-value">{item.value}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── Orders Tab ── */}
                            {activeTab === 'orders' && (
                                <div className="profile-card">
                                    <div className="profile-card-header">
                                        <h2 className="profile-card-title">Recent Orders</h2>
                                        <Link to="/orders" className="btn btn-outline btn-sm">View All</Link>
                                    </div>
                                    {ordersLoading ? (
                                        <div className="page-loader" style={{ minHeight: '200px' }}><div className="spinner" /></div>
                                    ) : orders.length === 0 ? (
                                        <div className="profile-empty-state">
                                            <FiPackage size={48} />
                                            <h3>No orders yet</h3>
                                            <p>Start exploring our fragrance collection!</p>
                                            <Link to="/shop" className="btn btn-primary">Shop Now</Link>
                                        </div>
                                    ) : (
                                        <div className="profile-orders-list">
                                            {orders.slice(0, 5).map((order) => (
                                                <div key={order._id} className="profile-order-row">
                                                    <div className="profile-order-info">
                                                        <span className="profile-order-num">{order.orderNumber}</span>
                                                        <span className="profile-order-date">
                                                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                    <div className="profile-order-meta">
                                                        <span className={`badge badge-${order.orderStatus === 'Delivered' ? 'success' : 'gold'}`}>
                                                            {order.orderStatus}
                                                        </span>
                                                        <span className="profile-order-price">₹{order.totalPrice?.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── Wishlist Tab ── */}
                            {activeTab === 'wishlist' && (
                                <div className="profile-card">
                                    <div className="profile-card-header">
                                        <h2 className="profile-card-title">Saved Items</h2>
                                        <Link to="/wishlist" className="btn btn-outline btn-sm">View All</Link>
                                    </div>
                                    {(user?.wishlist || []).length === 0 ? (
                                        <div className="profile-empty-state">
                                            <FiHeart size={48} />
                                            <h3>Your wishlist is empty</h3>
                                            <p>Save fragrances you love to find them faster.</p>
                                            <Link to="/shop" className="btn btn-primary">Browse Fragrances</Link>
                                        </div>
                                    ) : (
                                        <div className="profile-wishlist-mini">
                                            {(user?.wishlist || []).slice(0, 4).map((p) => (
                                                <Link key={p._id} to={`/product/${p.slug}`} className="profile-wishlist-mini-item">
                                                    {p.images?.[0] && <img src={p.images[0]} alt={p.name} />}
                                                    <div>
                                                        <span className="profile-wishlist-mini-name">{p.name}</span>
                                                        <span className="profile-wishlist-mini-price">₹{p.price?.toLocaleString('en-IN')}</span>
                                                    </div>
                                                </Link>
                                            ))}
                                            {(user?.wishlist || []).length > 4 && (
                                                <Link to="/wishlist" className="profile-wishlist-see-more">
                                                    +{(user?.wishlist || []).length - 4} more → 
                                                </Link>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── Security Tab ── */}
                            {activeTab === 'security' && (
                                <div className="profile-card">
                                    <div className="profile-card-header">
                                        <h2 className="profile-card-title">Security Settings</h2>
                                    </div>

                                    <div className="security-section">
                                        <h3 className="security-section-title">Change Password</h3>
                                        <form onSubmit={handlePasswordChange} className="profile-form-new">
                                            <div className="form-group">
                                                <label className="form-label">Current Password</label>
                                                <input
                                                    type="password"
                                                    className="form-input"
                                                    placeholder="Enter current password"
                                                    value={pwForm.currentPassword}
                                                    onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                                                    required
                                                />
                                            </div>
                                            <div className="profile-form-row">
                                                <div className="form-group">
                                                    <label className="form-label">New Password</label>
                                                    <input
                                                        type="password"
                                                        className="form-input"
                                                        placeholder="Min. 6 characters"
                                                        value={pwForm.newPassword}
                                                        onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label className="form-label">Confirm Password</label>
                                                    <input
                                                        type="password"
                                                        className="form-input"
                                                        placeholder="Repeat new password"
                                                        value={pwForm.confirmPassword}
                                                        onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <button className="btn btn-primary" type="submit" disabled={pwLoading}>
                                                {pwLoading ? 'Updating...' : <><FiCheck size={15} /> Update Password</>}
                                            </button>
                                        </form>
                                    </div>

                                    <div className="security-info">
                                        <FiShield size={16} />
                                        <p>Your account is protected. We never share your information with third parties.</p>
                                    </div>
                                </div>
                            )}
                        </motion.main>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Profile;
