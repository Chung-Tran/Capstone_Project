import React, { useState } from 'react';
import { Heart, ShoppingCart, Star, Award, Truck, Eye, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../../common/methodsCommon';
import { Rating } from 'react-simple-star-rating';
import customerItemsService from '../../services/customerItems.service';
import { useDispatch } from 'react-redux';
import { showToast } from '../../utils/toast';
import { incrementCartCount, incrementWishlistCount } from '../../store/slices/authSlice';
import { useRequireAuth } from '../../hooks/useRequireAuth';
const ProductCardItem = ({ product }) => {
    const [isHovered, setIsHovered] = useState(false);
    const dispatch = useDispatch();
    const requireAuth = useRequireAuth()

    const item = product

    const handleAddItem = async (product, itemType) => {
        requireAuth(async () => {
            try {
                await customerItemsService.addItem({
                    product_id: product._id,
                    type: itemType,
                    quantity: itemType === 'cart' ? 1 : undefined
                });
                if (itemType === 'cart') {
                    dispatch(incrementCartCount());
                } else {
                    dispatch(incrementWishlistCount(product._id));
                }
                showToast.success(itemType === 'cart' ? 'Đã thêm vào giỏ hàng' : 'Đã thêm vào sản phẩm yêu thích');
            } catch (error) {
                console.log(error);
                showToast.error(error.message || 'Đã xảy ra lỗi');
            }
        })

    };
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
            <button className="absolute top-2 right-2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-red-200 transition-colors"
                onClick={() => handleAddItem(item, 'wishlist')}
            >
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
                        <Rating
                            initialValue={product.average_rating}
                            size={20}
                            allowFraction
                            readonly
                            SVGstyle={{ display: 'inline-block' }}
                            fillColor="#facc15"
                            emptyColor="#e5e7eb"
                        />
                    </div>
                    <span className="text-xs text-gray-600">({item.total_reviews} đánh giá)</span>
                </div>

                {/* Product name */}
                <a href={`/san-pham/${item._id}`} className="block mb-2 text-gray-800 hover:text-blue-600 transition-colors">
                    <h3 className="font-medium text-gray-800 mb-1 truncate">{item.name}</h3>
                </a>
                {/* <h3 className="font-medium text-gray-800 mb-1 truncate hover:text-blue-600 transition-colors">
                    {item.name}
                </h3> */}

                {/* Price */}
                <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-lg text-gray-900">{formatCurrency(item.price)}</span>
                    {item.originalPrice > item.price && (
                        <span className="text-sm text-gray-500 line-through">{formatCurrency(item.originalPrice)}</span>
                    )}
                </div>

                {/* Status indicators */}
                <div className="flex flex-col gap-1 mb-3 text-xs">
                    <div className="flex items-center text-gray-600">
                        <Award size={14} className="mr-1 text-purple-500" />
                        <span>Đã bán {item.quantitySold || 0}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                        <Truck size={14} className="mr-1 text-green-500" />
                        <span>Miễn phí vận chuyển</span>
                    </div>
                    <div className={`flex items-center ${item.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        <span className={`w-2 h-2 rounded-full mr-1 ${item.stock > 0 ? 'bg-green-600' : 'bg-red-500'}`}></span>
                        <span>Còn hàng</span>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        className="flex-1 text-black py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center text-black rounded-lg border border-gray-300 hover:bg-gray-100"
                        onClick={() => handleAddItem(item, 'cart')}
                    >
                        <ShoppingCart size={16} className="mr-1" />
                        Thêm vào giỏ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCardItem;