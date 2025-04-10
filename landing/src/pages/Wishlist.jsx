import { useState } from 'react';
import { Heart, ShoppingCart, Trash2, ChevronLeft, Eye, Share2, AlertCircle } from 'lucide-react';

export default function Wishlist() {
    const [wishlistItems, setWishlistItems] = useState([
        {
            id: 1,
            name: "Áo Khoác Bomber Unisex",
            price: 850000,
            originalPrice: 1050000,
            discount: 19,
            image: "/api/placeholder/180/220",
            inStock: true,
            rating: 4.5,
            reviews: 128
        },
        {
            id: 2,
            name: "Túi Xách Tay Nữ Vintage",
            price: 1250000,
            originalPrice: 1250000,
            discount: 0,
            image: "/api/placeholder/180/220",
            inStock: true,
            rating: 4.8,
            reviews: 76
        },
        {
            id: 3,
            name: "Đồng Hồ Thông Minh Series X",
            price: 4990000,
            originalPrice: 5990000,
            discount: 17,
            image: "/api/placeholder/180/220",
            inStock: true,
            rating: 4.7,
            reviews: 243
        },
        {
            id: 4,
            name: "Tai Nghe Bluetooth Không Dây",
            price: 2790000,
            originalPrice: 3590000,
            discount: 22,
            image: "/api/placeholder/180/220",
            inStock: false,
            rating: 4.6,
            reviews: 189
        },
        {
            id: 5,
            name: "Giày Thể Thao Running Pro",
            price: 1890000,
            originalPrice: 2190000,
            discount: 14,
            image: "/api/placeholder/180/220",
            inStock: true,
            rating: 4.3,
            reviews: 95
        }
    ]);

    const removeFromWishlist = (id) => {
        setWishlistItems(wishlistItems.filter(item => item.id !== id));
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const moveAllToCart = () => {
        // Hàm này sẽ chuyển tất cả sản phẩm có sẵn vào giỏ hàng
        alert('Đã thêm tất cả sản phẩm có sẵn vào giỏ hàng');
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex items-center mb-6">
                    <Heart className="text-red-500 mr-2" size={28} />
                    <h1 className="text-3xl font-bold text-gray-800">Danh sách yêu thích</h1>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                            <div className="flex items-center mb-4 sm:mb-0">
                                <button className="flex items-center text-indigo-600 hover:text-indigo-800 transition">
                                    <ChevronLeft size={16} className="mr-1" />
                                    <span>Tiếp tục mua sắm</span>
                                </button>
                            </div>
                            <div className="flex space-x-4">
                                <button
                                    onClick={moveAllToCart}
                                    className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                                >
                                    <ShoppingCart size={16} className="mr-2" />
                                    <span>Thêm tất cả vào giỏ hàng</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {wishlistItems.length === 0 ? (
                        <div className="text-center py-16">
                            <Heart className="mx-auto text-gray-300 mb-4" size={64} />
                            <h3 className="text-xl font-medium text-gray-800 mb-2">Danh sách yêu thích trống</h3>
                            <p className="text-gray-500 mb-6 max-w-md mx-auto">Bạn chưa có sản phẩm nào trong danh sách yêu thích. Hãy thêm các sản phẩm yêu thích vào đây để mua sau.</p>
                            <button className="bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 transition">
                                Khám phá sản phẩm
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Sản phẩm
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Giá
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Trạng thái
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Đánh giá
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Thao tác
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {wishlistItems.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-24 w-20 bg-gray-100 rounded-md overflow-hidden">
                                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900 hover:text-indigo-600 cursor-pointer">{item.name}</div>
                                                        {item.discount > 0 && (
                                                            <div className="flex items-center mt-1">
                                                                <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">
                                                                    -{item.discount}%
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-md font-semibold text-indigo-600">{formatPrice(item.price)}</div>
                                                {item.discount > 0 && (
                                                    <div className="text-sm text-gray-500 line-through">{formatPrice(item.originalPrice)}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {item.inStock ? (
                                                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                        Còn hàng
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                        Hết hàng
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex items-center">
                                                        {[...Array(5)].map((_, i) => (
                                                            <svg key={i} className={`w-4 h-4 ${i < Math.floor(item.rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                            </svg>
                                                        ))}
                                                        <span className="text-xs text-gray-500 ml-1">({item.reviews})</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-3">
                                                    <button
                                                        className={`p-2 rounded-full ${item.inStock ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                                                        disabled={!item.inStock}
                                                        title={item.inStock ? "Thêm vào giỏ hàng" : "Sản phẩm hết hàng"}
                                                    >
                                                        <ShoppingCart size={18} />
                                                    </button>
                                                    <button
                                                        className="p-2 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100"
                                                        title="Xem chi tiết"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button
                                                        className="p-2 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100"
                                                        title="Chia sẻ"
                                                    >
                                                        <Share2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => removeFromWishlist(item.id)}
                                                        className="p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100"
                                                        title="Xóa khỏi danh sách"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center mb-4">
                        <AlertCircle className="text-indigo-600 mr-2" size={20} />
                        <h2 className="text-lg font-semibold text-gray-800">Thông tin về danh sách yêu thích</h2>
                    </div>
                    <div className="text-gray-600 space-y-2">
                        <p>• Sản phẩm trong danh sách yêu thích sẽ được lưu trong 30 ngày.</p>
                        <p>• Giá sản phẩm có thể thay đổi theo thời gian.</p>
                        <p>• Bạn sẽ nhận được thông báo khi sản phẩm giảm giá hoặc có hàng trở lại.</p>
                        <p>• Bạn có thể chia sẻ danh sách yêu thích với bạn bè.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}