import React, { useEffect, useState, useRef } from 'react';
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
    TagIcon,
    TicketIcon,
} from '@heroicons/react/24/outline';
import authService from '../services/auth.service';
import { saveProductData, saveShopData } from '../store/slices/shopSlice';
import { formatDateTime } from '../common/methodsCommon';
import reviewService from '../services/review.service';
import { NegativeCommentModal, UpcomingEventsModal } from '../components/notification/AINotifications';
import { X } from 'lucide-react';
import notificationService from '../services/notification.service';
import { Tag } from 'antd';
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
    const [isNotiModalOpen, setIsNotiModalOpen] = useState(false); // Mock notifications
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const notificationRef = useRef(null);


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
                const notifications = await authService.get_notifications();
                dispatch(saveShopData(response.data.shopInfo));
                dispatch(saveProductData(response.data.productInfo));
                setNotifications(notifications.data);
            } catch (error) {
                console.error('Failed to fetch shop info:', error);
            } finally {
                dispatch({ type: 'shop/setLoading', payload: false });
            }
        };
        fetchShopInfo();
    }, []);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsNotificationOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const renderUiNoti = () => {
        if (!selectedNotification) return null;

        const renderModal = () => {
            switch (selectedNotification.type) {
                case 'order_new':
                    return navigate("/seller/orders");

                case 'upcoming_events':
                    return <UpcomingEventsModal notification={selectedNotification} />;
                case 'negative_comments':
                    return (<NegativeCommentModal notification={selectedNotification} />);
                default:
                    return null;
            }
        };

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">Chi tiết thông báo</h2>
                        <button
                            onClick={() => setSelectedNotification(null)}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            aria-label="Đóng modal"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                    {renderModal()}
                </div>
            </div>
        );
    };
    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            const updated = notifications.data_list.map(noti => ({
                ...noti,
                is_read: true,
            }));
            setNotifications(prev => ({
                ...prev,
                data_list: updated,
                unread_count: 0,
            }));
        } catch (err) {
            console.error("Failed to mark all as read:", err);
        }
    };
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm fixed w-full z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="font-bold text-xl">Seller Center</div>
                    <div className="flex items-center space-x-4">
                        <button className="relative p-2 rounded-full hover:bg-gray-100" ref={notificationRef}
                            onClick={() => setIsNotificationOpen(!isNotificationOpen)}>
                            <BellIcon className="w-6 h-6" />
                            {notifications?.unread_count > 0 && (
                                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {notifications.unread_count}
                                </span>
                            )}
                            {isNotificationOpen && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2">
                                    <div className="px-4 py-2 border-b border-gray-100">
                                        <h3 className="font-medium">Thông báo</h3>
                                    </div>
                                    {isNotificationOpen && (
                                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50">
                                            {/* Header */}
                                            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                                                <h3 className="font-medium">Thông báo</h3>
                                                <button
                                                    onClick={handleMarkAllAsRead}
                                                    className="text-xs text-blue-600 hover:underline"
                                                >
                                                    Đánh dấu tất cả là đã đọc
                                                </button>
                                            </div>

                                            {/* Scrollable Notification List */}
                                            <div className="max-h-96 overflow-y-auto ">
                                                {notifications?.data_list?.length > 0 ? (
                                                    notifications.data_list.map((notification) => (
                                                        <div
                                                            key={notification._id}
                                                            className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-left relative border-b border-gray-100"
                                                            onClick={() => {
                                                                if (notification.type === 'order_new') {
                                                                    return navigate("/seller/orders");
                                                                }
                                                                setSelectedNotification(notification)
                                                            }}
                                                        >
                                                            {notification.is_created_by_ai && (
                                                                <Tag
                                                                    color="purple"
                                                                    className=" "
                                                                >
                                                                    Được tạo bởi AI
                                                                </Tag>
                                                            )}

                                                            <p className="text-sm text-gray-800">{notification.content}</p>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {formatDateTime(notification.created_at)}
                                                            </p>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="px-4 py-3 text-center text-sm text-gray-500">
                                                        Không có thông báo
                                                    </div>
                                                )}
                                            </div>

                                            {/* Footer */}
                                            {/* <div className="px-4 py-2 border-t border-gray-100">
                                                <Link to="/notifications" className="text-sm text-blue-600 hover:text-blue-700">
                                                    Xem thêm
                                                </Link>
                                            </div> */}
                                        </div>
                                    )}

                                    <div className="px-4 py-2 border-t border-gray-100">
                                        <Link to="/notifications" className="text-sm text-blue-600 hover:text-blue-700">
                                            Xem thêm
                                        </Link>
                                    </div>
                                </div>
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
            {renderUiNoti()}

        </div>
    );
};

export default SellerLayout; 