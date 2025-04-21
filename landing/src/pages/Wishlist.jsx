import { useEffect, useState } from 'react';
import { Heart, ShoppingCart, Trash2, ChevronLeft, Eye, Share2, AlertCircle } from 'lucide-react';
import customerItemsService from '../services/customerItems.service';
import { showToast } from '../utils/toast';
import { useLoading } from '../utils/useLoading';
import { useDispatch } from 'react-redux';
import { decrementCartCount, decrementWishlistCount, incrementCartCount } from '../store/slices/authSlice';

export default function Wishlist() {
    const dispatch = useDispatch();
    const { setLoading } = useLoading()
    const [wishlistItems, setWishlistItems] = useState([]);
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };
    useEffect(() => {
        fetchData()
    }, []);
    const fetchData = async () => {
        try {
            setLoading(true)
            const response = await customerItemsService.get_wishlist_items();
            if (response.isSuccess) {
                setWishlistItems(response.data)
            }

        } catch (error) {

        } finally {
            setLoading(false)
        }

    }
    const removeFromWishlist = async (id) => {
        try {
            await customerItemsService.removeItem(id);
            setWishlistItems(wishlistItems.filter(item => item._id !== id));
            dispatch(decrementWishlistCount())
        } catch (error) {
            showToast.success('Lỗi xóa sản phẩm');
            console.error('Error removing item:', error);
        }
    };
    const moveItemToCart = async (item) => {
        try {
            await customerItemsService.addToCart({
                product_id: item.product_id._id,
                quantity: 1,
                type: 'cart'
            });
            removeFromWishlist(item._id);

            dispatch(incrementCartCount())
            showToast.success('Thêm vào giỏ hàng thành công');

        } catch (error) {
            showToast.error('Lỗi thêm sản phẩm vào giỏ hàng: ', error.message);

            console.error('Error moving item to cart:', error);
        }
    };
    const moveAllToCart = async () => {
        const availableItems = wishlistItems.filter(item => item.product_id.stock > 0);
        try {
            setLoading(true)
            await Promise.all(
                availableItems.map(item =>
                    customerItemsService.addToCart({
                        product_id: item.product_id._id,
                        quantity: 1,
                        type: 'cart'
                    })
                )
            );
            // Cập nhật danh sách wishlist
            setWishlistItems(wishlistItems.filter(item => item.product_id.stock <= 0));
            showToast.success('Thêm sản phẩm vào giỏ hàng thành công');
        } catch (error) {
            showToast.error('Lỗi thêm sản phẩm vào giỏ hàng: ', error.message);
            console.error('Error moving all to cart:', error);
        } finally {
            setLoading(false)
        }
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
                                                        <img src={item.product_id.main_image} alt={item.product_id.name} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900 hover:text-indigo-600 cursor-pointer">{item.product_id.name}</div>
                                                        {item.product_id?.discount > 0 && (
                                                            <div className="flex items-center mt-1">
                                                                <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">
                                                                    -{item.product_id.discount}%
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-md font-semibold text-indigo-600">{formatPrice(item.product_id.price)}</div>
                                                {item.discount > 0 && (
                                                    <div className="text-sm text-gray-500 line-through">{formatPrice(item.product_id.originalPrice)}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {item.product_id.stock > 0 ? (
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
                                                        className={`p-2 rounded-full ${item.product_id.stock > 0 ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                                                        disabled={item.product_id.stock <= 0}
                                                        onClick={() => moveItemToCart(item)}
                                                        title={item.product_id.stock > 0 ? "Thêm vào giỏ hàng" : "Sản phẩm hết hàng"}
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
                                                        onClick={() => removeFromWishlist(item._id)}
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
                    </div>
                </div>
            </div>
        </div>
    );
}