import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiHeart } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/product/ProductCard';
import './Orders.css';

const Wishlist = () => {
    const { user, refreshUser } = useAuth();

    useEffect(() => { refreshUser(); }, [refreshUser]);

    const wishlistItems = user?.wishlist || [];

    return (
        <>
            <Helmet><title>My Wishlist | GoldenBuck Perfumes</title></Helmet>
            <div className="wishlist-page">
                <div className="container">
                    <h1 className="page-title">My Wishlist</h1>
                    {wishlistItems.length === 0 ? (
                        <div className="wishlist-empty">
                            <FiHeart size={48} />
                            <p>Your wishlist is empty</p>
                        </div>
                    ) : (
                        <div className="grid-products">
                            {wishlistItems.map((product, i) => (
                                <ProductCard key={product._id || i} product={product} index={i} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Wishlist;
