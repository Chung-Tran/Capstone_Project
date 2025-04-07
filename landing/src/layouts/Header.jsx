import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Search, User, Bell, Heart, ChevronDown, Menu, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
const Header = () => {
    const dispatch = useDispatch();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const { isAuthenticated, userRole, userInfo, cartCount, wishlistCount, notifications } = useSelector((state) => state.auth);
    // Refs for closing dropdowns when clicking outside
    const notificationRef = useRef(null);
    const userMenuRef = useRef(null);
    const categoryRef = useRef(null);
    const navigate = useNavigate();
    // Handle scroll event to change header styling
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsNotificationOpen(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false);
            }
            if (categoryRef.current && !categoryRef.current.contains(event.target)) {
                setIsCategoryOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Categories data
    const categories = [
        { name: 'Điện thoại', path: '/dien-thoai' },
        { name: 'Máy tính', path: '/may-tinh' },
        { name: 'Thiết bị', path: '/thiet-bi' },
    ];

    // Notifications data
    const notificationsList = [
        { id: 1, text: 'Ưu đãi mới: Giảm 50% cho đơn hàng đầu tiên', time: '5 phút trước' },
        { id: 2, text: 'Flash Sale sắp diễn ra', time: '1 giờ trước' },
        { id: 3, text: 'Đơn hàng #123 đã được giao thành công', time: '2 giờ trước' },
    ];

    // Search handler
    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            console.log('Search performed');
        }
    };
    const handleLogout = () => {
        dispatch(logout());
    };
    const handleUserIconClick = () => {
        if (!isAuthenticated) {
            navigate('/login');
        } else {
            setIsUserMenuOpen(!isUserMenuOpen);
        }
    };

    return (
        <header className={`sticky top-0 w-full z-50 bg-white transition-all duration-300 ${isScrolled ? 'shadow-lg' : ''}`}>
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo and Navigation */}
                    <div className="flex items-center space-x-12">
                        {/* Mobile Menu Toggle */}
                        <button
                            className="lg:hidden text-gray-700 hover:text-blue-600"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>

                        {/* Logo */}
                        <Link to="/" className="flex items-center space-x-2">
                            <img src="/logo.svg" alt="Logo" className="h-8 w-auto" />
                            <span className="text-xl font-bold text-gray-800 hidden sm:block">ShopMart</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex items-center space-x-8">
                            <div className="relative" ref={categoryRef}>
                                <button
                                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 font-medium text-base"
                                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                                >
                                    <span>Danh mục</span>
                                    <ChevronDown size={16} />
                                </button>

                                {isCategoryOpen && (
                                    <div className="absolute top-full left-0 w-48 bg-white shadow-lg rounded-lg py-2 mt-2">
                                        {categories.map((category, index) => (
                                            <Link
                                                key={index}
                                                to={category.path}
                                                className="block px-4 py-2 text-base text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                                                onClick={() => setIsCategoryOpen(false)}
                                            >
                                                {category.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <Link to="/danh-cho-ban" className="text-gray-700 hover:text-blue-600 font-medium text-base">
                                Dành cho bạn
                            </Link>
                            <Link to="/khuyen-mai" className="text-gray-700 hover:text-blue-600 font-medium text-base">
                                Khuyến mãi
                            </Link>
                            <Link to="/san-pham-moi" className="text-gray-700 hover:text-blue-600 font-medium text-base">
                                Sản phẩm mới
                            </Link>
                        </nav>
                    </div>

                    {/* Search and Actions */}
                    <div className="flex items-center space-x-6">
                        {/* Search Bar */}
                        <div className="hidden lg:block relative">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm..."
                                    className="w-[300px] px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none bg-gray-50"
                                    onKeyDown={handleSearch}
                                />
                                <button className="absolute right-0 top-0 h-full px-2 text-gray-500 hover:text-blue-600">
                                    <Search size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Action Icons */}
                        <div className="flex items-center space-x-4">
                            {/* Notifications */}
                            {isAuthenticated && (
                                <div className="relative hidden lg:block" ref={notificationRef}>
                                    <button
                                        className="p-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-full"
                                        onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                    >
                                        <Bell size={20} />
                                        {notifications > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                                                {notifications}
                                            </span>
                                        )}
                                    </button>

                                    {isNotificationOpen && (
                                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2">
                                            <div className="px-4 py-2 border-b border-gray-100">
                                                <h3 className="font-medium">Thông báo</h3>
                                            </div>
                                            {notificationsList.map((notification) => (
                                                <div key={notification.id} className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                                                    <p className="text-sm text-gray-800">{notification.text}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                                                </div>
                                            ))}
                                            <div className="px-4 py-2 border-t border-gray-100">
                                                <Link to="/notifications" className="text-sm text-blue-600 hover:text-blue-700">
                                                    Xem tất cả thông báo
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Wishlist */}
                            {
                                isAuthenticated && (
                                    <Link to="/wishlist" className="relative p-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-full">
                                        <Heart size={20} />
                                        {wishlistCount >= 0 && (
                                            <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                                                {wishlistCount}
                                            </span>
                                        )}
                                    </Link>
                                )}
                            {/* Cart */}
                            {isAuthenticated && (
                                <Link to="/cart" className="relative p-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-full">
                                    <ShoppingCart size={20} />
                                    {cartCount >= 0 && (
                                        <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                                            {cartCount}
                                        </span>
                                    )}
                                </Link>
                            )}

                            {/* User Menu */}
                            <div className="relative" ref={userMenuRef}>
                                <button
                                    className="p-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-full"
                                    onClick={handleUserIconClick}
                                >
                                    <User size={20} />
                                </button>

                                {isUserMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2">
                                        {isAuthenticated ? (
                                            <>
                                                <div className="px-4 py-2 border-b border-gray-100">
                                                    <p className="text-sm font-medium">Xin chào!</p>
                                                    <p className="text-xs text-gray-500">{userInfo?.fullname}</p>
                                                </div>
                                                <Link to="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                                                    Tài khoản của tôi
                                                </Link>
                                                <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                                                    Đơn hàng của tôi
                                                </Link>
                                                <button
                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                                                    onClick={handleLogout}
                                                >
                                                    Đăng xuất
                                                </button>
                                            </>
                                        ) : null}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden fixed inset-0 bg-white z-40 pt-20">
                        <div className="px-4">
                            {/* Mobile Search */}
                            <div className="mb-6">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm..."
                                        className="w-full px-4 py-2 text-sm border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none bg-gray-50"
                                        onKeyDown={handleSearch}
                                    />
                                    <button className="absolute right-0 top-0 h-full px-4 text-gray-500 hover:text-blue-600">
                                        <Search size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Mobile Navigation */}
                            <nav className="space-y-4">
                                <div>
                                    <button
                                        className="w-full flex justify-between items-center text-left text-gray-700 hover:text-blue-600 font-medium text-base"
                                        onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                                    >
                                        <span>Danh mục</span>
                                        <ChevronDown size={16} />
                                    </button>
                                    {isCategoryOpen && (
                                        <div className="mt-2 space-y-2 pl-4">
                                            {categories.map((category, index) => (
                                                <Link
                                                    key={index}
                                                    to={category.path}
                                                    className="block text-base text-gray-700 hover:text-blue-600"
                                                    onClick={() => {
                                                        setIsCategoryOpen(false);
                                                        setIsMobileMenuOpen(false);
                                                    }}
                                                >
                                                    {category.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <Link
                                    to="/danh-cho-ban"
                                    className="block text-base text-gray-700 hover:text-blue-600"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Dành cho bạn
                                </Link>
                                <Link
                                    to="/khuyen-mai"
                                    className="block text-base text-gray-700 hover:text-blue-600"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Khuyến mãi
                                </Link>
                                <Link
                                    to="/san-pham-moi"
                                    className="block text-base text-gray-700 hover:text-blue-600"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    Sản phẩm mới
                                </Link>
                            </nav>

                            {/* Mobile User Section */}
                            <div className="mt-6 border-t pt-4">
                                {isAuthenticated ? (
                                    <>
                                        <div className="mb-4">
                                            <p className="font-medium">Xin chào!</p>
                                            <p className="text-sm text-gray-500">user@example.com</p>
                                        </div>
                                        <div className="space-y-3">
                                            <Link
                                                to="/account"
                                                className="block text-base text-gray-700 hover:text-blue-600"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                Tài khoản của tôi
                                            </Link>
                                            <Link
                                                to="/orders"
                                                className="block text-base text-gray-700 hover:text-blue-600"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                            >
                                                Đơn hàng của tôi
                                            </Link>
                                            <button
                                                className="block w-full text-left text-base text-gray-700 hover:text-blue-600"
                                                onClick={() => {/* Xử lý đăng xuất */ }}
                                            >
                                                Đăng xuất
                                            </button>
                                        </div>
                                    </>
                                ) : null}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;