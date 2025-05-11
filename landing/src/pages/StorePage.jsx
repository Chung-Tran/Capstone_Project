import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Search, ShoppingCart, Heart, Menu, X, ChevronRight, Tag, Star, StarHalf, Clock, MessageSquare, Check, Percent, Info, MapPin, Calendar, Clock3 } from 'lucide-react';
import shopService from '../services/shop.service';
import { useLoading } from '../utils/useLoading';
import { showToast } from '../utils/toast';
import { formatCurrency } from '../common/methodsCommon';

export default function StorePage() {
    const { id: shopId } = useParams();
    const { setLoading } = useLoading();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState('all');
    const [shopInfo, setShopInfo] = useState(null);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([
        { id: 'all', name: 'Tất cả sản phẩm' }
    ]);
    const [isFollowing, setIsFollowing] = useState(false);

    // Lấy thông tin shop và sản phẩm khi component được mount
    useEffect(() => {
        if (shopId) {
            fetchShopData();
        }
    }, [shopId]);

    // Lấy dữ liệu shop và sản phẩm
    const fetchShopData = async () => {
        setLoading(true);
        try {
            // Lấy thông tin shop
            const shopResponse = await shopService.getShopById(shopId);
            if (shopResponse.isSuccess) {
                setShopInfo(shopResponse.data);
                // Kiểm tra người dùng có đang theo dõi shop không
                setIsFollowing(shopResponse.data.isFollowing || false);
                
                // Lấy danh mục sản phẩm của shop
                if (shopResponse.data.categories && shopResponse.data.categories.length > 0) {
                    const shopCategories = [
                        { id: 'all', name: 'Tất cả sản phẩm' },
                        ...shopResponse.data.categories.map(cat => ({
                            id: cat._id || cat.id,
                            name: cat.name
                        }))
                    ];
                    setCategories(shopCategories);
                }
            } else {
                showToast.error('Không thể tải thông tin cửa hàng');
            }

            // Lấy sản phẩm của shop
            const productsResponse = await shopService.getShopProducts(shopId);
            if (productsResponse.isSuccess) {
                const productsData = productsResponse.data.products || productsResponse.data || [];
                
                // Đảm bảo chỉ lấy sản phẩm của shop này
                const filteredProducts = productsData.filter(product => {
                    // Kiểm tra store_id có thể là chuỗi hoặc object với _id
                    const productStoreId = typeof product.store_id === 'object' 
                        ? product.store_id?._id 
                        : product.store_id;
                    
                    return productStoreId === shopId;
                });
                
                console.log(`Filtered from ${productsData.length} to ${filteredProducts.length} products`);
                setProducts(filteredProducts);
            } else {
                showToast.error('Không thể tải danh sách sản phẩm');
            }
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu shop:', error);
            showToast.error('Đã xảy ra lỗi khi tải dữ liệu cửa hàng');
        } finally {
            setLoading(false);
        }
    };

    // Xử lý khi người dùng chọn danh mục
    const handleCategoryClick = async (categoryId) => {
        setActiveCategory(categoryId);
        if (isMenuOpen) {
            setIsMenuOpen(false);
        }

        setLoading(true);
        try {
            // Lấy sản phẩm theo danh mục được chọn
            const params = categoryId === 'all' ? {} : { category_id: categoryId };
            const productsResponse = await shopService.getShopProducts(shopId, params);
            if (productsResponse.isSuccess) {
                const productsData = productsResponse.data.products || productsResponse.data || [];
                
                // Đảm bảo chỉ lấy sản phẩm của shop này
                const filteredProducts = productsData.filter(product => {
                    // Kiểm tra store_id có thể là chuỗi hoặc object với _id
                    const productStoreId = typeof product.store_id === 'object' 
                        ? product.store_id?._id 
                        : product.store_id;
                    
                    return productStoreId === shopId;
                });
                
                console.log(`Category ${categoryId}: Filtered from ${productsData.length} to ${filteredProducts.length} products`);
                setProducts(filteredProducts);
            } else {
                showToast.error('Không thể tải danh sách sản phẩm');
            }
        } catch (error) {
            console.error('Lỗi khi lọc sản phẩm theo danh mục:', error);
            showToast.error('Đã xảy ra lỗi khi lọc sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    // Xử lý khi người dùng theo dõi hoặc bỏ theo dõi shop
    const handleFollowToggle = async () => {
        try {
            setLoading(true);
            if (isFollowing) {
                const response = await shopService.unfollowShop(shopId);
                if (response.isSuccess) {
                    setIsFollowing(false);
                    // Cập nhật số lượng người theo dõi
                    setShopInfo(prev => ({
                        ...prev,
                        followers: (prev.followers || 0) - 1
                    }));
                    showToast.success('Đã bỏ theo dõi cửa hàng');
                } else {
                    showToast.error('Không thể bỏ theo dõi cửa hàng');
                }
            } else {
                const response = await shopService.followShop(shopId);
                if (response.isSuccess) {
                    setIsFollowing(true);
                    // Cập nhật số lượng người theo dõi
                    setShopInfo(prev => ({
                        ...prev,
                        followers: (prev.followers || 0) + 1
                    }));
                    showToast.success('Đã theo dõi cửa hàng');
                } else {
                    showToast.error('Không thể theo dõi cửa hàng');
                }
            }
        } catch (error) {
            console.error('Lỗi khi theo dõi/bỏ theo dõi shop:', error);
            showToast.error('Đã xảy ra lỗi');
        } finally {
            setLoading(false);
        }
    };
    
    // Xử lý khi người dùng nhấn nút nhắn tin
    const handleMessageShop = () => {
        // Implement logic để mở chat với shop
        showToast.info('Tính năng nhắn tin đang được phát triển');
    };

    const renderRatingStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<Star key={`star-${i}`} size={16} className="fill-yellow-400 text-yellow-400" />);
        }

        if (hasHalfStar) {
            stars.push(<StarHalf key="half-star" size={16} className="fill-yellow-400 text-yellow-400" />);
        }

        return stars;
    };

    const calculateDiscount = (original, discounted) => {
        if (!original || !discounted || original <= discounted) return 0;
        return Math.round(((original - discounted) / original) * 100);
    };

    // Nếu chưa có dữ liệu shop thì hiển thị loading hoặc placeholder
    if (!shopInfo) {
        return (
            <div className="bg-gray-50 min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Đang tải thông tin cửa hàng...</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen">
            {/* Hero Section with Banner */}
            <div className="relative h-80 overflow-hidden">
                <img 
                    src={shopInfo.banner || '/api/placeholder/1200/300'} 
                    alt="Shop Banner" 
                    className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                
                {/* Shop Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div className="flex items-center">
                            <img 
                                src={shopInfo.store_logo || '/api/placeholder/80/80'} 
                                alt="Shop Logo" 
                                className="h-20 w-20 rounded-full border-4 border-white shadow-lg object-cover" 
                            />
                            <div className="ml-4">
                                <h2 className="text-2xl md:text-3xl font-bold text-white">{shopInfo.store_name}</h2>
                                <div className="flex items-center mt-1">
                                    <div className="flex">
                                        {renderRatingStars(shopInfo.average_rating || 0)}
                                    </div>
                                    <span className="ml-2 text-white text-sm">{shopInfo.average_rating || 0}</span>
                                    <span className="mx-2 text-white">•</span>
                                    <span className="text-white text-sm">{shopInfo.followers?.toLocaleString() || 0} người theo dõi</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex space-x-3 mt-4 md:mt-0">
                            <button 
                                onClick={handleMessageShop}
                                className="bg-white text-blue-600 font-medium py-2 px-4 rounded-full hover:bg-gray-100 transition flex items-center shadow-md"
                            >
                                <MessageSquare size={18} className="mr-2" />
                                Nhắn tin
                            </button>
                            
                            <button 
                                onClick={handleFollowToggle}
                                className={`font-medium py-2 px-4 rounded-full flex items-center shadow-md transition ${
                                    isFollowing 
                                    ? 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100' 
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                            >
                                {isFollowing ? (
                                    <>
                                        <Check size={18} className="mr-2" />
                                        Đã theo dõi
                                    </>
                                ) : (
                                    <>
                                        <span className="mr-2">+</span>
                                        Theo dõi
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Container */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Shop Info Card */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-xl shadow p-6 sticky top-24">
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                                <Info size={18} className="mr-2 text-blue-600" />
                                Thông tin cửa hàng
                            </h3>
                            <div className="space-y-5">
                                <p className="text-gray-700 border-b border-gray-100 pb-4">{shopInfo.description || 'Chưa có mô tả'}</p>
                                
                                <div className="flex items-start">
                                    <MapPin size={18} className="text-gray-400 mr-3 mt-1 flex-shrink-0" />
                                    <p className="text-gray-700">{shopInfo.address || 'Không có địa chỉ'}</p>
                                </div>
                                
                                <div className="flex items-start">
                                    <Clock3 size={18} className="text-gray-400 mr-3 mt-1 flex-shrink-0" />
                                    <p className="text-gray-700">{shopInfo.operating_hours || '8:00 - 21:00 (Thứ 2 - Chủ nhật)'}</p>
                                </div>
                                
                                <div className="flex items-start">
                                    <Calendar size={18} className="text-gray-400 mr-3 mt-1 flex-shrink-0" />
                                    <p className="text-gray-700">Hoạt động từ {shopInfo.established_year || new Date().getFullYear()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Products Section */}
                    <div className="md:col-span-3">
                        {/* Categories Nav */}
                        <div className="bg-white rounded-xl shadow p-4 mb-6 overflow-x-auto sticky top-0 z-10">
                            <div className="flex space-x-4 min-w-max">
                                {categories.map(category => (
                                    <button
                                        key={category.id}
                                        onClick={() => handleCategoryClick(category.id)}
                                        className={`px-4 py-2 rounded-full transition ${
                                            activeCategory === category.id
                                            ? 'bg-blue-600 text-white font-medium'
                                            : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        {category.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Products Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products && products.length > 0 ? (
                                products.map(product => (
                                    <div key={product._id} className="bg-white rounded-xl shadow overflow-hidden hover:shadow-md transition group">
                                        <div className="relative overflow-hidden">
                                            <img 
                                                src={product.main_image || '/api/placeholder/300/300'} 
                                                alt={product.name} 
                                                className="w-full h-56 object-cover transition-transform group-hover:scale-105" 
                                            />
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent h-20"></div>
                                            
                                            <div className="absolute top-3 right-3 flex flex-col gap-2">
                                                <button className="h-9 w-9 flex items-center justify-center bg-white rounded-full shadow hover:bg-gray-100 transition">
                                                    <Heart size={18} className="text-gray-500 hover:text-red-500" />
                                                </button>
                                                <button className="h-9 w-9 flex items-center justify-center bg-white rounded-full shadow hover:bg-gray-100 transition">
                                                    <ShoppingCart size={18} className="text-gray-500 hover:text-blue-500" />
                                                </button>
                                            </div>
                                            
                                            {product.original_price && product.price < product.original_price && (
                                                <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center">
                                                    <Percent size={12} className="mr-1" />
                                                    {calculateDiscount(product.original_price, product.price)}%
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-medium text-gray-800 mb-2 line-clamp-2 h-12 text-lg">{product.name}</h3>
                                            <div className="mb-3 flex items-baseline">
                                                <span className="font-bold text-xl text-red-600">{formatCurrency(product.price)}</span>
                                                {product.original_price && product.original_price > product.price && (
                                                    <span className="text-sm text-gray-500 line-through ml-2">
                                                        {formatCurrency(product.original_price)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <div className="flex">
                                                        {renderRatingStars(product.average_rating || 0)}
                                                    </div>
                                                    <span className="ml-1 text-xs text-gray-500">({product.total_reviews || 0})</span>
                                                </div>
                                                <button className="bg-blue-600 text-white text-sm px-4 py-2 rounded-full hover:bg-blue-700 transition flex items-center">
                                                    <ShoppingCart size={14} className="mr-1" />
                                                    Thêm
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-3 py-16 text-center">
                                    <div className="bg-white rounded-xl p-8 shadow-sm">
                                        <div className="text-gray-400 flex justify-center mb-4">
                                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                                                <line x1="8" y1="21" x2="16" y2="21"></line>
                                                <line x1="12" y1="17" x2="12" y2="21"></line>
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-700 mb-2">Không có sản phẩm nào</h3>
                                        <p className="text-gray-500">Không tìm thấy sản phẩm nào trong danh mục này</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Load More Button */}
                        {products && products.length > 9 && (
                            <div className="mt-10 flex justify-center">
                                <button className="px-8 py-3 border border-blue-600 text-blue-600 rounded-full hover:bg-blue-50 transition font-medium flex items-center">
                                    Xem thêm sản phẩm
                                    <ChevronRight size={18} className="ml-1" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}