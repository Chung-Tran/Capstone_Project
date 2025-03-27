import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';

const SellerHeader = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <header className="bg-gray-800 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center">
                        <span className="text-xl font-bold">Seller Dashboard</span>
                    </div>
                    <nav className="flex space-x-4">
                        <Link to="/seller/dashboard" className="hover:text-gray-300">Dashboard</Link>
                        <Link to="/seller/products" className="hover:text-gray-300">Sản phẩm</Link>
                        <Link to="/seller/orders" className="hover:text-gray-300">Đơn hàng</Link>
                        <button onClick={handleLogout} className="hover:text-gray-300">
                            Đăng xuất
                        </button>
                    </nav>
                </div>
            </div>
        </header>
    );
};

const SellerFooter = () => {
    return (
        <footer className="bg-gray-800 text-white py-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <p>&copy; {new Date().getFullYear()} Seller Dashboard. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

const SellerLayout = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col">
            <SellerHeader />
            <main className="flex-grow bg-gray-100 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
            <SellerFooter />
        </div>
    );
};

export default SellerLayout;