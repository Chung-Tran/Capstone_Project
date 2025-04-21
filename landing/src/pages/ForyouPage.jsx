import React, { useState, useEffect } from 'react';
import { ChevronRight, TrendingUp, Heart, Clock, ThumbsUp, ShoppingBag, ChevronLeft } from 'lucide-react';
import ProductCardItem from '../components/product/ProductCard';
import CarouselList from '../components/CarouselList';
import { formatCurrency } from '../common/methodsCommon';
import { useDispatch, useSelector } from 'react-redux';
// Horizontal product card for recently viewed
const HorizontalProductCard = ({ product }) => {
    // Format giá theo VND

    return (
        <div className="flex bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-2 gap-3">
            <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="flex-grow overflow-hidden">
                <h3 className="font-medium text-gray-800 text-sm truncate mb-1">{product.name}</h3>
                <div className="flex items-center gap-2">
                    <span className="font-bold text-red-600 text-sm">{formatCurrency(product.price)}</span>
                    {product.originalPrice > product.price && (
                        <span className="text-xs text-gray-500 line-through">{formatCurrency(product.originalPrice)}</span>
                    )}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                    <div className="flex items-center">
                        <span className="text-yellow-500 mr-1">★</span>
                        <span>{product.rating}</span>
                    </div>
                    <span>Đã bán {product.soldCount}</span>
                </div>
            </div>
        </div>
    );
};

// Main component - For You Page
const ForYouPage = () => {
    const { isAuthenticated, userRole, user, cartCount, wishlistCount, notifications } = useSelector((state) => state.auth);
    // Demo data
    const trendingProducts = Array(10).fill().map((_, i) => ({
        id: `trending-${i + 1}`,
        name: `Sản phẩm thịnh hành ${i + 1}`,
        price: 250000 + (i * 50000),
        originalPrice: 350000 + (i * 50000),
        discount: 30,
        rating: 4.5 + (Math.random() * 0.5),
        reviewCount: 50 + Math.floor(Math.random() * 100),
        image: "/api/placeholder/400/400",
        images: ["/api/placeholder/400/400", "/api/placeholder/400/400"],
        badge: i % 3 === 0 ? "Hot" : null,
        isNew: i % 5 === 0,
        stockStatus: "Còn hàng",
        soldCount: 100 + Math.floor(Math.random() * 900)
    }));

    const recommendedProducts = Array(10).fill().map((_, i) => ({
        id: `recommended-${i + 1}`,
        name: `Đề xuất cho bạn: Sản phẩm cao cấp ${i + 1}`,
        price: 350000 + (i * 40000),
        originalPrice: 450000 + (i * 40000),
        discount: 20,
        rating: 4.3 + (Math.random() * 0.6),
        reviewCount: 30 + Math.floor(Math.random() * 120),
        image: "/api/placeholder/400/400",
        images: ["/api/placeholder/400/400", "/api/placeholder/400/400"],
        badge: i % 4 === 0 ? "Best Seller" : null,
        isNew: i % 6 === 0,
        stockStatus: "Còn hàng",
        soldCount: 150 + Math.floor(Math.random() * 800)
    }));
    const recentlyViewed = Array(5).fill().map((_, i) => ({
        id: `recent-${i + 1}`,
        name: `Sản phẩm đã xem gần đây ${i + 1}`,
        price: 199000 + (i * 30000),
        originalPrice: 259000 + (i * 30000),
        discount: 25,
        rating: 4.2 + (Math.random() * 0.6),
        reviewCount: 20 + Math.floor(Math.random() * 80),
        image: "/api/placeholder/400/400",
        soldCount: 80 + Math.floor(Math.random() * 500)
    }));

    return (
        <div className=" mx-auto px-4 py-6">
            {
                isAuthenticated && (
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 mb-8 text-white">
                        <h1 className="text-2xl font-bold mb-2">Chào {user.fullName} 👋</h1>
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
                )
            }

            {/* Trending products */}
            <CarouselList
                title="Đang thịnh hành"
                icon={<TrendingUp size={18} />}
                viewAll="/trending"
            >
                {trendingProducts.map(product => (
                    <div key={product.id} className="flex-shrink-0 w-64">
                        <ProductCardItem product={product} />
                    </div>
                ))}
            </CarouselList>

            {/* Recommended products */}
            <CarouselList
                title="Đề xuất cho bạn"
                icon={<ThumbsUp size={18} />}
                viewAll="/recommended"
            >
                {recommendedProducts.map(product => (
                    <div key={product.id} className="flex-shrink-0 w-64">
                        <ProductCardItem product={product} />
                    </div>
                ))}
            </CarouselList>

            {/* Recently viewed */}
            <CarouselList
                title="Đã xem gần đây"
                icon={<Clock size={18} />}
                viewAll="/history"
            >
                {recentlyViewed.map(product => (
                    <div key={product.id} className="flex-shrink-0 w-72">
                        <HorizontalProductCard product={product} />
                    </div>
                ))}
            </CarouselList>
        </div>
    );
};

export default ForYouPage;