import React, { useEffect, useState } from 'react';
import {
    Phone, Laptop, Shirt, Home as HomeIcon, Camera, Watch,
    ChevronRight, Star, Filter, ShoppingBag, ArrowDown, ArrowUp,
    Sparkles, ShoppingCart, Heart, Search, Tag, Clock, TrendingUp
} from 'lucide-react';
import productService from '../services/product.service';
import { showToast } from '../utils/toast';
import { useLoading } from '../utils/useLoading';
import customerItemsService from '../services/customerItems.service';
import { useDispatch } from 'react-redux';
import { incrementCartCount, incrementWishlistCount } from '../store/slices/authSlice';
import { useRequireAuth } from '../hooks/useRequireAuth';
import create_logger from '../config/logger';
import { log_action_type } from '../common/Constant';
import { Rating } from 'react-simple-star-rating';

const ProductCard = ({ product }) => {
    const discount = product.discount || Math.floor(Math.random() * 30);
    const discountedPrice = product.price * (1 - discount / 100);
    const ratings = product.rating || (Math.random() * 2 + 3).toFixed(1);
    const dispatch = useDispatch();

    // Calculate days since launch
    const getDaysSinceLaunch = () => {
        const today = new Date();
        // Assuming product has a created_at field or similar
        const launch = product.created_at ? new Date(product.created_at) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const diffTime = Math.abs(today - launch);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const handleAddItem = async (itemType) => {
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
    };

    return (
        <div className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group-hover:border-green-400">
            <div className="relative overflow-hidden">
                <img
                    src={product.main_image}
                    alt={product.name}
                    className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-500"
                />

                <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    Mới {getDaysSinceLaunch()}d
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

                        <Rating
                            initialValue={product.average_rating}
                            size={20}
                            allowFraction
                            readonly
                            SVGstyle={{ display: "inline-block" }}
                            fillColor="#facc15"
                            emptyColor="#e5e7eb"
                        />
                    </div>
                    <span className="text-xs text-gray-500">{product.quantitySold || 0} đã bán</span>
                </div>

                <a className="font-medium text-gray-800 mb-2 line-clamp-1 group-hover:text-green-600 transition-colors" href={`san-pham/${product._id}`}>{product.name}</a>

                <div className="flex flex-col items-start justify-between mt-auto pt-2 border-t border-gray-100">
                    <div className="flex items-center mb-2 w-full">

                        <span className="text-green-700 font-bold text-lg mr-2">
                            {Math.round(product.price).toLocaleString('vi-VN')}đ
                        </span>

                        <span className="text-gray-400 text-sm line-through">
                            {product.original_price.toLocaleString('vi-VN')}đ
                        </span>
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

// Featured New Product Component
const FeaturedNewProduct = ({ product }) => {
    const dispatch = useDispatch();
    const requireAuth = useRequireAuth()
    const handleAddToCart = async () => {
        requireAuth(async () => {
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
        })
    };

    return (
        <div className="flex flex-col md:flex-row bg-white rounded-xl shadow-md overflow-hidden">
            <div className="w-full md:w-1/2 relative h-64 md:h-auto">
                <img
                    src={product.main_image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">MỚI</div>
            </div>
            <div className="w-full md:w-1/2 p-6 flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded flex items-center">
                            <Sparkles size={12} className="mr-1" />
                            Sản phẩm mới
                        </span>
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded flex items-center">
                            <TrendingUp size={12} className="mr-1" />
                            Xu hướng
                        </span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">{product.name}</h2>
                    <div className="flex items-center mb-2">
                        <div className="flex items-center text-yellow-400 mr-2">
                            <Star size={16} fill="currentColor" />
                            <span className="ml-1 text-sm font-medium text-gray-700">{product.average_rating || (Math.random() * 2 + 3).toFixed(1)}</span>
                        </div>
                        <span className="text-sm text-gray-500">• {product.total_reviews} đánh giá</span>
                    </div>

                    <div dangerouslySetInnerHTML={{ __html: product.description }} ></div>

                    {/* <p className="text-gray-600 mb-4 text-sm">{product.description || 'Sản phẩm mới với thiết kế hiện đại và công nghệ tiên tiến nhất. Đây là lựa chọn tuyệt vời cho người dùng muốn trải nghiệm sản phẩm chất lượng cao.'}</p> */}
                </div>
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        {product.discount ? (
                            <>
                                <span className="text-2xl font-bold text-gray-800">
                                    {Math.round(product.price * (1 - product.discount / 100)).toLocaleString('vi-VN')}đ
                                </span>
                                <span className="text-sm text-gray-500 line-through">
                                    {product.price.toLocaleString('vi-VN')}đ
                                </span>
                                <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
                                    -{product.discount}%
                                </span>
                            </>
                        ) : (
                            <span className="text-2xl font-bold text-gray-800">
                                {product.price.toLocaleString('vi-VN')}đ
                            </span>
                        )}
                    </div>
                    <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center w-full"
                        onClick={handleAddToCart}
                    >
                        <ShoppingBag size={16} className="mr-2" />
                        Thêm vào giỏ hàng
                    </button>
                </div>
            </div>
        </div>
    );
};

// Category Card Component
const CategoryCard = ({ category }) => {
    return (
        <div className={`${category.color} rounded-2xl p-6 text-center cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 border border-transparent hover:border-green-200`}>
            <div className="flex justify-center mb-5 rounded-full p-4 w-20 h-20 mx-auto shadow-sm">
                {category.icon}
            </div>
            <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
            <p className="text-sm text-gray-600">{category.count}</p>
        </div>
    );
};

function NewProductPage() {
    const { setLoading } = useLoading();
    const [newProducts, setNewProducts] = useState([]);
    const [sortOption, setSortOption] = useState('newest');
    const [showSortOptions, setShowSortOptions] = useState(false);

    const categories = [
        { icon: <Phone className="h-10 w-10 text-green-600" />, name: 'Điện thoại', color: 'bg-green-50', count: '2.3k+ sản phẩm', slug: 'dien-thoai' },
        { icon: <Laptop className="h-10 w-10 text-indigo-600" />, name: 'Máy tính', color: 'bg-indigo-50', count: '1.5k+ sản phẩm', slug: 'may-tinh' },
        { icon: <Shirt className="h-10 w-10 text-purple-600" />, name: 'Thời trang', color: 'bg-purple-50', count: '4.2k+ sản phẩm', slug: 'thoi-trang' },
        { icon: <HomeIcon className="h-10 w-10 text-amber-600" />, name: 'Đồ gia dụng', color: 'bg-amber-50', count: '1.8k+ sản phẩm', slug: 'do-gia-dung' },
        { icon: <Camera className="h-10 w-10 text-red-600" />, name: 'Máy ảnh', color: 'bg-red-50', count: '670+ sản phẩm', slug: 'may-anh' },
        { icon: <Watch className="h-10 w-10 text-teal-600" />, name: 'Đồng hồ', color: 'bg-teal-50', count: '950+ sản phẩm', slug: 'dong-ho' },
    ];

    const sortOptions = [
        { value: 'newest', label: 'Mới nhất' },
        { value: 'popular', label: 'Phổ biến nhất' },
        { value: 'priceAsc', label: 'Giá thấp đến cao' },
        { value: 'priceDesc', label: 'Giá cao đến thấp' },
        { value: 'rating', label: 'Đánh giá cao nhất' },
    ];

    const handleSort = (option) => {
        setSortOption(option);
        setShowSortOptions(false);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const resNew = await productService.product_news(12, 0);

                if (!resNew.isSuccess) {
                    showToast.error("Lỗi lấy sản phẩm mới");
                    return;
                }
                setNewProducts(resNew.data);
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
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 mb-8 text-white relative overflow-hidden mx-4 mt-4">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">Sản Phẩm Mới Nhất</h1>
                    <p className="opacity-90 mb-4">Khám phá những sản phẩm mới nhất và xu hướng mới nhất trên thị trường</p>
                    <button className="bg-white text-green-600 px-4 py-2 rounded-lg font-medium text-sm shadow-md flex items-center gap-1">
                        <Sparkles size={16} />
                        Khám phá ngay
                    </button>
                </div>
                <div className="absolute right-6 bottom-0 opacity-20">
                    <Tag size={180} />
                </div>
            </div>

            {/* Featured New Product */}
            {newProducts.length > 0 && (
                <div className="container mx-auto px-4 mb-10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <div className="w-1 h-8 bg-green-600 rounded-full mr-3"></div>
                            <h2 className="text-3xl font-bold text-gray-800">Sản Phẩm Nổi Bật</h2>
                        </div>
                    </div>
                    <FeaturedNewProduct product={newProducts[0]} />
                </div>
            )}

            {/* Categories */}
            <section className="py-8">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center">
                            <div className="w-1 h-8 bg-green-600 rounded-full mr-3"></div>
                            <h2 className="text-3xl font-bold text-gray-800">Danh mục sản phẩm</h2>
                        </div>
                        {/* <button className="text-green-600 hover:text-green-700 font-medium flex items-center group">
                            Xem tất cả
                            <ChevronRight className="h-5 w-5 ml-1 transform group-hover:translate-x-1 transition-transform" />
                        </button> */}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {categories.map((category, index) => (
                            <CategoryCard key={index} category={category} />
                        ))}
                    </div>
                </div>
            </section>

            {/* All New Products */}
            <section className="py-8 bg-white">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                            <div className="w-1 h-8 bg-green-600 rounded-full mr-3"></div>
                            <h2 className="text-3xl font-bold text-gray-800">Tất Cả Sản Phẩm Mới</h2>
                        </div>

                        {/* Sort Options */}
                        <div className="relative">
                            <button
                                className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
                                onClick={() => setShowSortOptions(!showSortOptions)}
                            >
                                <Filter size={16} />
                                <span>{sortOptions.find(opt => opt.value === sortOption).label}</span>
                                {showSortOptions ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                            </button>

                            {showSortOptions && (
                                <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg z-20 w-48">
                                    <ul className="py-2">
                                        {sortOptions.map(option => (
                                            <li
                                                key={option.value}
                                                className={`px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm ${sortOption === option.value ? 'text-green-600 font-medium' : 'text-gray-700'}`}
                                                onClick={() => handleSort(option.value)}
                                            >
                                                {option.label}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Filters
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm sản phẩm mới..."
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-48 sm:w-64"
                            />
                        </div>

                        <button className="border border-gray-300 rounded-lg px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                            <span>Danh mục</span>
                            <ArrowDown size={14} />
                        </button>

                        <button className="border border-gray-300 rounded-lg px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
                            <span>Giá</span>
                            <ArrowDown size={14} />
                        </button>

                        <button className="border border-gray-300 rounded-lg px-3 py-2 text-sm hover:bg-gray-50">
                            Mới nhất
                        </button>

                        <button className="border border-gray-300 rounded-lg px-3 py-2 text-sm hover:bg-gray-50">
                            Có giảm giá
                        </button>
                    </div> */}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {newProducts.map((product, index) => (
                            <ProductCard key={index} product={product} />
                        ))}
                    </div>

                    {/* Load More */}
                    <div className="flex justify-center mt-8">
                        <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg font-medium text-sm shadow flex items-center">
                            Xem thêm sản phẩm mới
                            <ChevronRight className="h-5 w-5 ml-1" />
                        </button>
                    </div>
                </div>
            </section>

            {/* Newsletter Subscription */}
            <section className="py-8">
                <div className="container mx-auto px-4">
                    <div className="bg-gray-100 rounded-xl p-6 text-center">
                        <h2 className="text-xl font-bold text-gray-800 mb-3">Đăng ký nhận thông báo sản phẩm mới</h2>
                        <p className="text-gray-600 mb-4">Hãy là người đầu tiên biết về các sản phẩm mới ra mắt và nhận ưu đãi độc quyền</p>
                        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="Nhập địa chỉ email của bạn"
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent flex-grow"
                            />
                            <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium text-sm">
                                Đăng ký
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default NewProductPage;