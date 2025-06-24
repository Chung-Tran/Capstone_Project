import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, ShoppingCart, Heart, Menu, X, ChevronRight, Tag, Star, StarHalf, Clock, Percent } from 'lucide-react';
import shopService from '../services/shop.service';
import { useLoading } from '../utils/useLoading';
import { showToast } from '../utils/toast';
import { formatCurrency } from '../common/methodsCommon';
import customerItemsService from '../services/customerItems.service';
import { useDispatch } from 'react-redux';
import { incrementCartCount } from '../store/slices/authSlice';
import create_logger from '../config/logger';
import { log_action_type } from '../common/Constant';

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
    const dispatch = useDispatch()
    const navigate = useNavigate()
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
                create_logger({
                    customer_id: localStorage.getItem('customer_id'),
                    action_type: log_action_type.VIEW_SHOP,
                    store_id: shopId
                })
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

    const handleAddToCart = async (product) => {
        try {
            await customerItemsService.addItem({
                product_id: product._id,
                type: 'cart',
                quantity: 1
            });
            dispatch(incrementCartCount());
            showToast.success('Đã thêm vào giỏ hàng');
        } catch (error) {
            console.log(error);
            showToast.error(error.message || 'Đã xảy ra lỗi');
        }
    };
    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="relative rounded-xl overflow-hidden mb-8">
                <img
                    src={shopInfo.store_banner || '/api/placeholder/1200/300'}
                    alt="Shop Banner"
                    className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6">
                    <div className="flex items-center mb-2">
                        <img
                            src={shopInfo.store_logo || '/api/placeholder/80/80'}
                            alt="Shop Logo"
                            className="h-16 w-16 rounded-full border-4 border-white"
                        />
                        <div className="ml-4">
                            <h2 className="text-2xl font-bold text-white">{shopInfo.store_name}</h2>
                            <div className="flex items-center mt-1">
                                <div className="flex">
                                    {renderRatingStars(shopInfo.average_rating || 0)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Shop Info and Categories */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {/* Shop Info Card */}
                <div className="md:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h3 className="text-lg font-semibold mb-4">Thông tin cửa hàng</h3>
                        <div className="space-y-4">
                            <p className="text-gray-700">{shopInfo.store_description || 'Chưa có mô tả'}</p>
                            <div className="flex items-start">
                                <div className="text-gray-500 mr-2 mt-1">📍</div>
                                <p className="text-gray-700">{shopInfo.address || 'Không có địa chỉ'}</p>
                            </div>
                            <div className="flex items-start">
                                <div className="text-gray-500 mr-2 mt-1">🕒</div>
                                <p className="text-gray-700">{shopInfo.operating_hours || '8:00 - 21:00 (Thứ 2 - Chủ nhật)'}</p>
                            </div>
                            <div className="flex items-start">
                                <div className="text-gray-500 mr-2 mt-1">📅</div>
                                <p className="text-gray-700">Hoạt động từ năm {new Date(shopInfo.created_at).getFullYear()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products Section */}
                <div className="md:col-span-3">
                    {/* Categories Nav */}
                    <div className="bg-white rounded-xl shadow-sm p-4 mb-6 overflow-x-auto">
                        <div className="flex space-x-4 min-w-max">
                            {categories.map(category => (
                                <button
                                    key={category.id}
                                    onClick={() => handleCategoryClick(category.id)}
                                    className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${activeCategory === category.id
                                        ? 'bg-blue-100 text-blue-600 font-medium'
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
                                <div key={product._id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition">
                                    <div className="relative cursor-pointer" onClick={() => navigate(`/san-pham/${product._id}`)}>
                                        <img
                                            src={product.main_image || '/api/placeholder/300/300'}
                                            alt={product.name}
                                            className="w-full h-48 object-cover"
                                        />
                                        <div className="absolute top-2 right-2">
                                            <button className="h-8 w-8 flex items-center justify-center bg-white rounded-full shadow">
                                                <Heart size={16} className="text-gray-400 hover:text-red-500" />
                                            </button>
                                        </div>
                                        {product.original_price && product.price < product.original_price && (
                                            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                                -{calculateDiscount(product.original_price, product.price)}%
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-medium text-gray-800 mb-1 line-clamp-2 h-12 cursor-pointer" onClick={() => navigate(`/san-pham/${product._id}`)}>{product.name}</h3>
                                        <div className="mb-2">
                                            <span className="font-bold text-lg text-red-600">{formatCurrency(product.price)}</span>
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
                                            <button
                                                className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700"
                                                onClick={() => handleAddToCart(product)}

                                            >
                                                + Giỏ hàng
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-3 py-12 text-center text-gray-500">
                                Không có sản phẩm nào trong danh mục này
                            </div>
                        )}
                    </div>

                    {/* Load More Button */}
                    {products && products.length > 9 && (
                        <div className="mt-8 flex justify-center">
                            <button className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium">
                                Xem thêm sản phẩm
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}