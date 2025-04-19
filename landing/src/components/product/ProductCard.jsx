import React, { useState } from 'react';
import { Heart, ShoppingCart, Star, Award, Truck, Eye, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../../common/methodsCommon';
const ProductCardItem = ({ product }) => {
    const [isHovered, setIsHovered] = useState(false);

    // Sử dụng product demo nếu không có dữ liệu được truyền vào
    const demoProduct = {
        id: 1,
        name: "Áo Thun Nam Cao Cấp Cotton",
        price: 399000,
        originalPrice: 599000,
        discount: 33,
        rating: 4.8,
        reviewCount: 124,
        image: "/api/placeholder/400/500",
        images: ["/api/placeholder/400/500", "/api/placeholder/400/500"],
        badge: "Hot",
        isFreeShipping: true,
        isNew: true,
        stockStatus: "Còn hàng",
        soldCount: 89
    };

    const item = product || demoProduct;

    return (
        <div
            className="bg-white rounded-lg shadow-md transition-all duration-300 hover:shadow-xl relative w-64 overflow-hidden"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Badges */}
            <div className="absolute top-2 left-2 z-10 flex flex-col gap-2">
                {item.discount > 0 && (
                    <span className="bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold">
                        -{item.discount}%
                    </span>
                )}
                {item.badge && (
                    <span className="bg-orange-500 text-white px-2 py-1 rounded-md text-xs font-bold">
                        {item.badge}
                    </span>
                )}
                {item.isNew && (
                    <span className="bg-green-500 text-white px-2 py-1 rounded-md text-xs font-bold">
                        Mới
                    </span>
                )}
            </div>

            {/* Wishlist button */}
            <button className="absolute top-2 right-2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-red-200 transition-colors">
                <Heart size={18} className="text-gray-500 hover:text-red-500" />
            </button>

            {/* Image gallery with hover effect */}
            <div className="relative h-64 overflow-hidden rounded-t-lg">
                <img
                    src={item?.main_image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
            </div>

            {/* Product content */}
            <div className="p-4">
                {/* Rating */}
                <div className="flex items-center mb-2">
                    <div className="flex items-center mr-2">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                size={14}
                                className={i < Math.floor(item.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                            />
                        ))}
                    </div>
                    <span className="text-xs text-gray-600">({item.reviewCount} đánh giá)</span>
                </div>

                {/* Product name */}
                <h3 className="font-medium text-gray-800 mb-1 truncate hover:text-blue-600 transition-colors">
                    {item.name}
                </h3>

                {/* Price */}
                <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-lg text-gray-900">{formatCurrency(item.price)}</span>
                    {item.originalPrice > item.price && (
                        <span className="text-sm text-gray-500 line-through">{formatCurrency(item.originalPrice)}</span>
                    )}
                </div>

                {/* Status indicators */}
                <div className="flex flex-col gap-1 mb-3 text-xs">
                    {item.soldCount > 0 && (
                        <div className="flex items-center text-gray-600">
                            <Award size={14} className="mr-1 text-purple-500" />
                            <span>Đã bán {item.soldCount}</span>
                        </div>
                    )}
                    {item.isFreeShipping && (
                        <div className="flex items-center text-gray-600">
                            <Truck size={14} className="mr-1 text-green-500" />
                            <span>Miễn phí vận chuyển</span>
                        </div>
                    )}
                    <div className={`flex items-center ${item.stockStatus === 'Còn hàng' ? 'text-green-600' : 'text-red-500'}`}>
                        <span className={`w-2 h-2 rounded-full mr-1 ${item.stockStatus === 'Còn hàng' ? 'bg-green-600' : 'bg-red-500'}`}></span>
                        <span>{item.stockStatus}</span>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                    <button className="flex-1 text-black py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center text-black rounded-lg border border-gray-300 hover:bg-gray-100">
                        <ShoppingCart size={16} className="mr-1" />
                        Thêm vào giỏ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCardItem;