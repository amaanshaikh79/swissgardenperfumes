import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FiPackage, FiClock, FiCheck, FiTruck } from 'react-icons/fi';
import { ordersAPI } from '../services/api';
import './Orders.css';

const statusIcons = {
    Processing: <FiClock size={16} />,
    Confirmed: <FiCheck size={16} />,
    Shipped: <FiTruck size={16} />,
    Delivered: <FiPackage size={16} />,
};

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await ordersAPI.getMy();
                setOrders(data.orders);
            } catch (err) {
                console.error('Failed to fetch orders:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) {
        return <div className="page-loader" style={{ paddingTop: '120px' }}><div className="spinner" /></div>;
    }

    return (
        <>
            <Helmet><title>My Orders | swissgarden Perfumes</title></Helmet>
            <div className="orders-page">
                <div className="container-sm">
                    <h1 className="page-title">My Orders</h1>
                    {orders.length === 0 ? (
                        <div className="orders-empty">
                            <FiPackage size={48} />
                            <p>No orders yet. Start exploring our collection!</p>
                        </div>
                    ) : (
                        <div className="orders-list">
                            {orders.map((order, i) => (
                                <motion.div
                                    key={order._id}
                                    className="order-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                >
                                    <div className="order-card-header">
                                        <div>
                                            <h3 className="order-number">{order.orderNumber}</h3>
                                            <span className="order-date">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                        </div>
                                        <span className={`badge badge-${order.orderStatus === 'Delivered' ? 'success' : order.orderStatus === 'Cancelled' ? 'error' : 'gold'}`}>
                                            {statusIcons[order.orderStatus]} {order.orderStatus}
                                        </span>
                                    </div>
                                    <div className="order-items-preview">
                                        {order.orderItems.map((item) => (
                                            <div key={item._id} className="order-item-mini">
                                                {item.image && <img src={item.image} alt={item.name} />}
                                                <div>
                                                    <span className="order-item-name">{item.name}</span>
                                                    <span className="order-item-qty">Qty: {item.quantity}</span>
                                                </div>
                                                <span className="order-item-price">${item.price.toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="order-card-footer">
                                        <span className="order-total">Total: <strong>${order.totalPrice.toFixed(2)}</strong></span>
                                        <span className={`badge ${order.isPaid ? 'badge-success' : 'badge-warning'}`}>
                                            {order.isPaid ? 'Paid' : 'Pending'}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Orders;
