import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import {
    HomeIcon,
    ShoppingBagIcon,
    ClipboardDocumentListIcon,
    ChatBubbleLeftRightIcon,
    StarIcon,
    CogIcon,
    ChartBarIcon,
    BellIcon,
} from '@heroicons/react/24/outline';

const SidebarLink = ({ to, icon: Icon, children, active }) => (
    <Link
        to={to}
        className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${active ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'
            }`}
    >
        <Icon className="w-6 h-6" />
        <span>{children}</span>
    </Link>
);

const SellerLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [notifications, setNotifications] = useState(0); // Mock notifications

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const navigationItems = [
        { path: '/seller/dashboard', icon: HomeIcon, label: 'Tổng quan' },
        { path: '/seller/shop', icon: CogIcon, label: 'Quản lý Shop' },
        { path: '/seller/products', icon: ShoppingBagIcon, label: 'Quản lý Sản phẩm' },
        { path: '/seller/orders', icon: ClipboardDocumentListIcon, label: 'Quản lý Đơn hàng' },
        { path: '/seller/reviews', icon: StarIcon, label: 'Đánh giá & Phản hồi' },
        { path: '/seller/messages', icon: ChatBubbleLeftRightIcon, label: 'Tin nhắn' },
        { path: '/seller/analytics', icon: ChartBarIcon, label: 'Thống kê & Báo cáo' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm fixed w-full z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="font-bold text-xl">Seller Center</div>
                    <div className="flex items-center space-x-4">
                        <button className="relative p-2 rounded-full hover:bg-gray-100">
                            <BellIcon className="w-6 h-6" />
                            {notifications > 0 && (
                                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {notifications}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                            Đăng xuất
                        </button>
                    </div>
                </div>
            </header>

            {/* Sidebar and Main Content */}
            <div className="flex pt-16">
                {/* Sidebar */}
                <aside className="w-64 fixed h-full bg-white shadow-sm">
                    <nav className="mt-4 px-2 space-y-1">
                        {navigationItems.map((item) => (
                            <SidebarLink
                                key={item.path}
                                to={item.path}
                                icon={item.icon}
                                active={location.pathname === item.path}
                            >
                                {item.label}
                            </SidebarLink>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="ml-64 flex-1 p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default SellerLayout; 