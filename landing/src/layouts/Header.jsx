import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Search, User, Bell, Heart, ChevronDown, Menu, X, MessageCircleIcon } from 'lucide-react';
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
    const { isAuthenticated, userRole, user, cartCount, wishlistCount, notifications } = useSelector((state) => state.auth);
    const { categories } = useSelector((state) => state.common);
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

    // Notifications data
    const notificationsList = [
        { id: 1, text: 'Ưu đãi mới: Giảm 50% cho đơn hàng đầu tiên', time: '5 phút trước' },
        { id: 2, text: 'Flash Sale sắp diễn ra', time: '1 giờ trước' },
        { id: 3, text: 'Đơn hàng #123 đã được giao thành công', time: '2 giờ trước' },
    ];
    const removeVietnameseTones = (str) => {
        return str.normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D');
    };

    const convertToSlug = (text) => {
        return removeVietnameseTones(text)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-') // Thay thế các ký tự không phải chữ hoặc số bằng dấu gạch ngang
            .replace(/^-+|-+$/g, '');    // Loại bỏ dấu gạch ngang ở đầu và cuối chuỗi
    };

    // Search handler
    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            const keyword = e.target.value;
            const slug = convertToSlug(keyword);
            navigate(`/tim-kiem?keyword=${encodeURIComponent(keyword)}`);
        }
    };
    const handleLogout = () => {
        dispatch(logout());
        navigate('/')
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
                            <img src="/logo.png" alt="Logo" className="h-12 w-auto" />
                            {/* <span className="text-xl font-bold text-gray-800 hidden sm:block">ShopMart</span> */}
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
                                        {categories?.slice(0, 15)?.map((category, index) => (
                                            <Link
                                                key={index}
                                                to={`/danh-muc/${category._id}`}
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
                                <button className="absolute right-0 top-0 h-full px-2 text-gray-500 hover:text-blue-600" onClick={handleSearch}>
                                    <Search size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Action Icons */}
                        <div className="flex items-center space-x-3">

                            {isAuthenticated && (
                                <Link to="/tin-nhan" className="relative p-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-full">
                                    <MessageCircleIcon size={20} />

                                </Link>
                            )}

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
                                    <Link to="/san-pham-yeu-thich" className="relative p-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-full">
                                        <Heart size={20} />
                                        {wishlistCount.length >= 0 && (
                                            <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                                                {wishlistCount.length}
                                            </span>
                                        )}
                                    </Link>
                                )}
                            {/* Cart */}
                            {isAuthenticated && (
                                <Link to="/gio-hang" className="relative p-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-full">
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
                                    className="p-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-full flex items-center justify-center"
                                    onClick={handleUserIconClick}
                                >
                                    {
                                        isAuthenticated && !!user?.avatar ? (
                                            <img src={user?.avatar} alt="User Avatar" className="w-6 h-6 rounded-full" />
                                        ) : (
                                            <User size={20} />
                                        )
                                    }
                                    <span className="text-sm font-medium ml-1">{user?.username}</span>
                                </button>

                                {isUserMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2">
                                        {isAuthenticated ? (
                                            <>
                                                <div className="px-4 py-2 border-b border-gray-100">
                                                    <p className="text-sm font-medium">Xin chào!</p>
                                                    <p className="text-xs text-gray-500">{user?.fullName}</p>
                                                </div>
                                                <Link to="/tai-khoan/thong-tin-tai-khoan" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                                                    Tài khoản của tôi
                                                </Link>
                                                <Link to="/tai-khoan/lich-su-don-hang" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">
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
            </div>
        </header>
    );
};

export default Header;