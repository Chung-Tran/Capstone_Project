import React, { useEffect, useState } from 'react';
import {
    TrendingUp, Heart, Clock, ThumbsUp, ShoppingBag,
    ChevronRight, Star, ShoppingCart
} from 'lucide-react';
import productService from '../services/product.service';
import { showToast } from '../utils/toast';
import { useLoading } from '../utils/useLoading';
import customerItemsService from '../services/customerItems.service';
import { useDispatch, useSelector } from 'react-redux';
import { incrementCartCount, incrementWishlistCount } from '../store/slices/authSlice';

// Horizontal product card for recently viewed
const HorizontalProductCard = ({ product }) => {
    const dispatch = useDispatch();

    const handleAddItem = async (itemType) => {
        try {
            await customerItemsService.addItem({
                product_id: product._id || product.id,
                type: itemType,
                quantity: itemType === 'cart' ? 1 : undefined
            });
            
            if (itemType === 'cart') {
                dispatch(incrementCartCount());
            } else {
                dispatch(incrementWishlistCount());
            }
            
            showToast.success(itemType === 'cart' ? 'Đã thêm vào giỏ hàng' : 'Đã thêm vào danh sách yêu thích');
        } catch (error) {
            console.log(error);
            showToast.error(error.message || 'Đã xảy ra lỗi');
        }
    };

    return (
        <div className="flex bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-2 gap-3">
            <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                <img
                    src={product.main_image || product.image || "/api/placeholder/400/400"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="flex-grow overflow-hidden">
                <h3 className="font-medium text-gray-800 text-sm truncate mb-1">{product.name}</h3>
                <div className="flex items-center gap-2">
                    <span className="font-bold text-red-600 text-sm">
                        {product.price.toLocaleString('vi-VN')}đ
                    </span>
                    {(product.original_price || product.originalPrice) > product.price && (
                        <span className="text-xs text-gray-500 line-through">
                            {(product.original_price || product.originalPrice).toLocaleString('vi-VN')}đ
                        </span>
                    )}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                    <div className="flex items-center">
                        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                        <span className="ml-1">{product.average_rating || product.rating || 4.5}</span>
                    </div>
                    <span>Đã bán {product.quantitySold || product.soldCount || 0}</span>
                </div>
            </div>
        </div>
    );
};


const ProductCard = ({ product, type = "default" }) => {
    const discount = product.discount || Math.floor(Math.random() * 30);
    const discountedPrice = product.price * (1 - discount / 100);
    const ratings = product.rating || (Math.random() * 2 + 3).toFixed(1);
    const sold = Math.floor(Math.random() * 500) + 50;
    const dispatch = useDispatch();
    
    const typeStyles = {
        trending: {
            badge: "bg-orange-600",
            badgeText: "Thịnh hành",
            priceColor: "text-orange-700",
            hoverBorder: "group-hover:border-orange-400"
        },
        recommended: {
            badge: "bg-purple-600",
            badgeText: "Gợi ý",
            priceColor: "text-purple-700",
            hoverBorder: "group-hover:border-purple-400"
        },
        recent: {
            badge: "bg-blue-600",
            badgeText: "Đã xem",
            priceColor: "text-blue-700",
            hoverBorder: "group-hover:border-blue-400"
        },
        default: {
            badge: "bg-gray-600",
            badgeText: "Khuyến mãi",
            priceColor: "text-gray-800",
            hoverBorder: "group-hover:border-gray-400"
        }
    };
    const style = typeStyles[type] || typeStyles.default;

    const handleAddItem = async (itemType) => {
        try {
            await customerItemsService.addItem({
                product_id: product._id,
                type: itemType,
                quantity: itemType === 'cart' ? 1 : undefined
            });
            if (itemType == 'cart') {
                dispatch(incrementCartCount());
            } else {
                dispatch(incrementWishlistCount());
            }
            showToast.success(itemType === 'cart' ? 'Đã thêm vào giỏ hàng' : 'Đã thêm vào wishlist');
        } catch (error) {
            console.log(error)
            showToast.error(error.message || 'Đã xảy ra lỗi');
        }
    };
    return (
        <div className={`group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 ${style.hoverBorder}`}>
            <div className="relative overflow-hidden">
                <img
                    src={product.main_image}
                    alt={product.name}
                    className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-500"
                />

                {discount > 0 && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        -{discount}%
                    </div>
                )}

                <div className={`absolute top-3 right-3 ${style.badge} text-white text-xs font-bold px-2 py-1 rounded-full`}>
                    {style.badgeText}
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                    <div className="flex space-x-2">
                        <button className="bg-white p-2 rounded-full shadow hover:bg-gray-100 transition-colors"
                            onClick={() => handleAddItem('cart')}
                        >
                            <ShoppingCart className="h-5 w-5 text-gray-800" />
                        </button>
                        <button className="bg-white p-2 rounded-full shadow hover:bg-gray-100 transition-colors"
                            onClick={() => handleAddItem('wishlist')}
                        >
                            <Heart className="h-5 w-5 text-gray-800" />
                        </button>
                    </div>
                </div>
            </div>
            <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm text-gray-600 ml-1">{ratings} <span className="text-gray-400">({Math.floor(Math.random() * 100) + 10})</span></span>
                    </div>
                    <span className="text-xs text-gray-500">{sold} đã bán</span>
                </div>

                <a className="font-medium text-gray-800 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors" href={`san-pham/${product._id}`}>{product.name}</a>

                <div className="flex flex-col items-start justify-between mt-auto pt-2 border-t border-gray-100">
                    <div className="flex items-center mb-2 w-full">
                        {discount > 0 ? (
                            <>
                                <span className={`${style.priceColor} font-bold text-lg mr-2`}>
                                    {Math.round(discountedPrice).toLocaleString('vi-VN')}đ
                                </span>
                                <span className="text-gray-400 text-sm line-through">
                                    {product.price.toLocaleString('vi-VN')}đ
                                </span>
                            </>
                        ) : (
                            <span className={`${style.priceColor} font-bold text-lg`}>
                                {product.price.toLocaleString('vi-VN')}đ
                            </span>
                        )}
                    </div>
                    <button className="w-full text-black py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-100"
                        onClick={() => handleAddItem('cart')}
                    >
                        <ShoppingCart size={16} className="mr-1" />
                        Thêm vào giỏ
                    </button>
                </div>
            </div>
        </div>
    );
};

// Carousel List Component
const CarouselList = ({ title, icon, viewAll, children }) => {
    return (
        <section className="mb-10">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <div className="w-1 h-8 bg-blue-600 rounded-full mr-3"></div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                        {title}
                        {icon && <span className="ml-3 text-blue-600">{icon}</span>}
                    </h2>
                </div>
                {viewAll && (
                    <a href={viewAll} className="text-blue-600 hover:text-blue-700 font-medium flex items-center group">
                        Xem tất cả
                        <ChevronRight className="h-5 w-5 ml-1 transform group-hover:translate-x-1 transition-transform" />
                    </a>
                )}
            </div>
            <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                <div className="flex space-x-5">
                    {children}
                </div>
            </div>
        </section>
    );
};

function ForYouPage() {
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const { setLoading } = useLoading();
    const [trendingProducts, setTrendingProducts] = useState([]);
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [recentlyViewed, setRecentlyViewed] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [resFeatured, resNew] = await Promise.all([
                    productService.product_featured(10, 0),
                    productService.product_news(10, 0)
                ]);

                if (!resFeatured.isSuccess || !resNew.isSuccess) {
                    showToast.error("Lỗi lấy sản phẩm");
                }
                
                setTrendingProducts(resFeatured.data);
                setRecommendedProducts(resNew.data);
                
                // Demo data for recently viewed products
                setRecentlyViewed(Array(4).fill().map((_, i) => ({
                    id: `recent-${i + 1}`,
                    name: `Sản phẩm đã xem gần đây ${i + 1}`,
                    price: 199000 + (i * 30000),
                    original_price: 259000 + (i * 30000),
                    discount: 25,
                    rating: 4.2 + (Math.random() * 0.6),
                    review_count: 20 + Math.floor(Math.random() * 80),
                    image: "/api/placeholder/400/400",
                    soldCount: 80 + Math.floor(Math.random() * 500)
                })));
                
            } catch (err) {
                showToast.error("Đã xảy ra lỗi khi tải sản phẩm");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="min-h-screen flex flex-col">
            {/* User welcome banner for authenticated users */}
            {isAuthenticated && (
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-6 px-4 mb-8 text-white">
                    <div className="container mx-auto">
                        <h1 className="text-2xl font-bold mb-2">Chào {user.fullName || 'bạn'} 👋</h1>
                        <p className="opacity-90 mb-4">Khám phá các sản phẩm được cá nhân hóa dành riêng cho bạn hôm nay.</p>
                        <div className="flex gap-3">
                            <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium text-sm shadow-md flex items-center gap-1">
                                <ShoppingBag size={16} />
                                Đơn hàng của tôi
                            </button>
                            <button className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-1">
                                <Heart size={16} />
                                Danh sách yêu thích
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Trending Products */}
            <section className="py-8 bg-white">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center">
                            <div className="w-1 h-8 bg-orange-600 rounded-full mr-3"></div>
                            <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                                Đang thịnh hành
                                <TrendingUp className="ml-3 text-orange-600 h-6 w-6" />
                            </h2>
                        </div>
                        <button className="text-orange-600 hover:text-orange-700 font-medium flex items-center group">
                            Xem tất cả
                            <ChevronRight className="h-5 w-5 ml-1 transform group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {trendingProducts.map((product, index) => (
                            <ProductCard
                                key={index}
                                product={product}
                                type="trending"
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Recommended For You */}
            <section className="py-8">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center">
                            <div className="w-1 h-8 bg-purple-600 rounded-full mr-3"></div>
                            <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                                Đề xuất cho bạn
                                <ThumbsUp className="ml-3 text-purple-600 h-6 w-6" />
                            </h2>
                        </div>
                        <button className="text-purple-600 hover:text-purple-700 font-medium flex items-center group">
                            Xem tất cả
                            <ChevronRight className="h-5 w-5 ml-1 transform group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {recommendedProducts.map((product, index) => (
                            <ProductCard
                                key={index}
                                product={product}
                                type="recommended"
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Recently Viewed */}
            <section className="py-8 bg-white">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center">
                            <div className="w-1 h-8 bg-blue-600 rounded-full mr-3"></div>
                            <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                                Đã xem gần đây
                                <Clock className="ml-3 text-blue-600 h-6 w-6" />
                            </h2>
                        </div>
                        <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center group">
                            Xem tất cả
                            <ChevronRight className="h-5 w-5 ml-1 transform group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {recentlyViewed.map((product, index) => (
                            <HorizontalProductCard key={index} product={product} />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

export default ForYouPage;