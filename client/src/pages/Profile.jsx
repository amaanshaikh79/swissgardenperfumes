import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Orders.css';

const Profile = () => {
    const { user, updateProfile } = useAuth();
    const [form, setForm] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        phone: user?.phone || '',
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateProfile(form);
            toast.success('Profile updated!');
        } catch (error) {
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Helmet><title>My Profile | GoldBerg Perfumes</title></Helmet>
            <div className="profile-page">
                <div className="container-sm">
                    <h1 className="page-title">My Profile</h1>
                    <div className="profile-grid">
                        <div className="profile-sidebar">
                            <div className="profile-avatar">{user?.firstName?.[0]}</div>
                            <h3 className="profile-name">{user?.firstName} {user?.lastName}</h3>
                            <p className="profile-email">{user?.email}</p>
                            <span className="badge badge-gold" style={{ marginTop: '1rem' }}>
                                {user?.role === 'admin' ? 'Administrator' : 'Member'}
                            </span>
                        </div>
                        <div className="profile-main">
                            <h2 className="profile-section-title">Edit Profile</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="profile-form-row">
                                    <div className="form-group">
                                        <label className="form-label">First Name</label>
                                        <input className="form-input" value={form.firstName}
                                            onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Last Name</label>
                                        <input className="form-input" value={form.lastName}
                                            onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input className="form-input" value={user?.email || ''} disabled style={{ opacity: 0.5 }} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Phone</label>
                                    <input className="form-input" placeholder="+1 (555) 000-0000" value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                                </div>
                                <button className="btn btn-primary" type="submit" disabled={loading}>
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Profile;
