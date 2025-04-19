import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
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
import authService from '../services/auth.service';
import { saveProductData, saveShopData } from '../store/slices/shopSlice';
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
    const loading = useSelector((state) => state.shop.loading);
    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    const navigationItems = [
        { path: '/seller/dashboard', icon: HomeIcon, label: 'Tổng quan' },
        { path: '/seller/shop', icon: CogIcon, label: 'Quản lý cửa hàng' },
        { path: '/seller/products', icon: ShoppingBagIcon, label: 'Quản lý Sản phẩm' },
        { path: '/seller/orders', icon: ClipboardDocumentListIcon, label: 'Quản lý Đơn hàng' },
        { path: '/seller/reviews', icon: StarIcon, label: 'Đánh giá & Phản hồi' },
        { path: '/seller/messages', icon: ChatBubbleLeftRightIcon, label: 'Tin nhắn' },
    ];
    useEffect(() => {
        const fetchShopInfo = async () => {
            try {
                dispatch({ type: 'shop/setLoading', payload: true });
                const response = await authService.get_shop_info();
                dispatch(saveShopData(response.data.shopInfo));
                dispatch(saveProductData(response.data.productInfo));
            } catch (error) {
                console.error('Failed to fetch shop info:', error);
            } finally {
                dispatch({ type: 'shop/setLoading', payload: false });
            }
        };
        fetchShopInfo();
    }, []);
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
                <main className="ml-64 flex-1 p-8 relative">
                    {children}

                    {/* Loading Overlay */}
                    {loading && (
                        <div className="absolute inset-0 bg-white bg-opacity-70 z-[9999]">
                            <div className="w-full h-full flex flex-col items-center justify-center">
                                <svg className="animate-spin h-10 w-10 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span className="text-gray-600 font-medium">Vui lòng đợi...</span>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default SellerLayout; 