import React from 'react';
import { FiTruck, FiCheckCircle, FiSun } from 'react-icons/fi';
import './TopBar.css';

const TopBar = () => {
    return (
        <div className="top-bar">
            <div className="container top-bar-content">
                <div className="top-bar-item">
                    <FiTruck size={14} />
                    <span>Free Shipping Above ₹999</span>
                </div>
                <div className="top-bar-divider" />
                <div className="top-bar-item">
                    <FiCheckCircle size={14} />
                    <span>COD Available</span>
                </div>
                <div className="top-bar-divider" />
                <div className="top-bar-item">
                    <FiSun size={14} />
                    <span>Made for Indian Weather</span>
                </div>
            </div>
        </div>
    );
};

export default TopBar;
