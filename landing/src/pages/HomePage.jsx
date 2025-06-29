import React, { useEffect, useState } from 'react';
import {
    Phone, Laptop, Shirt, Home as HomeIcon, Camera, Watch,
    ChevronRight, Star, Clock, Heart, ShoppingBag, Award,
    ArrowRight,
    ShoppingCart
} from 'lucide-react';
import productService from '../services/product.service';
import { showToast } from '../utils/toast';
import { useLoading } from '../utils/useLoading';
import HeroSection from '../components/HeroSection';
import customerItemsService from '../services/customerItems.service';
import { useDispatch, useSelector } from 'react-redux';
import { incrementCartCount, incrementWishlistCount } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { homeTypeStyles } from '../common/Constant';

const ProductCard = ({ product, type = "default" }) => {
    const discount = product.discount || Math.floor(Math.random() * 30);
    const dispatch = useDispatch()
    const style = homeTypeStyles[type] || homeTypeStyles.default;
    const requireAuth = useRequireAuth();

    const handleAddItem = async (itemType) => {
        requireAuth(async () => {
            try {
                await customerItemsService.addItem({
                    product_id: product._id,
                    type: itemType,
                    quantity: itemType === 'cart' ? 1 : undefined
                });
                if (itemType == 'cart') {
                    dispatch(incrementCartCount());
                } else {
                    dispatch(incrementWishlistCount(product._id));
                }
                showToast.success(itemType === 'cart' ? 'Đã thêm vào giỏ hàng' : 'Đã thêm vào sản phẩm yêu thích');
            } catch (error) {
                console.log(error)
                showToast.error(error.message || 'Đã xảy ra lỗi');
            }
        })
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
                        <span className="text-sm text-gray-600 ml-1">{product.average_rating} <span className="text-gray-400">({product.total_reviews} đánh giá)</span></span>
                        {/* <span className="text-sm text-gray-600 ml-1">{ratings} <span className="text-gray-400">({Math.floor(Math.random() * 100) + 10})</span></span> */}
                    </div>
                    <span className="text-xs text-gray-500">{product.quantitySold} đã bán</span>
                </div>

                <a className="font-medium text-gray-800 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors" href={`san-pham/${product._id}`}>{product.name}</a>

                <div className="flex flex-col items-start justify-between mt-auto pt-2 border-t border-gray-100">
                    <div className="flex items-center mb-2 w-full">
                        {discount > 0 ? (
                            <>
                                <span className={`${style.priceColor} font-bold text-lg mr-2`}>
                                    {Math.round(product.price).toLocaleString('vi-VN')}đ
                                </span>
                                <span className="text-gray-400 text-sm line-through">
                                    {product.original_price.toLocaleString('vi-VN')}đ
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

function HomePage() {
    const { setLoading } = useLoading();
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [newProducts, setNewProducts] = useState([]);
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const navigate = useNavigate();
    const categories = [
        { icon: <Phone className="h-10 w-10 text-blue-600" />, name: 'Điện thoại', color: 'bg-blue-50', count: '2.3k+ sản phẩm', slug: 'dien-thoai' },
        { icon: <Laptop className="h-10 w-10 text-indigo-600" />, name: 'Máy tính', color: 'bg-indigo-50', count: '1.5k+ sản phẩm', slug: 'may-tinh' },
        { icon: <Shirt className="h-10 w-10 text-purple-600" />, name: 'Thời trang', color: 'bg-purple-50', count: '4.2k+ sản phẩm', slug: 'thoi-trang' },
        { icon: <HomeIcon className="h-10 w-10 text-amber-600" />, name: 'Đồ gia dụng', color: 'bg-amber-50', count: '1.8k+ sản phẩm', slug: 'do-gia-dung' },
        { icon: <Camera className="h-10 w-10 text-red-600" />, name: 'Máy ảnh', color: 'bg-red-50', count: '670+ sản phẩm', slug: 'may-anh' },
        { icon: <Watch className="h-10 w-10 text-teal-600" />, name: 'Đồng hồ', color: 'bg-teal-50', count: '950+ sản phẩm', slug: 'dong-ho' },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [resFeatured, resNew, resForyou] = await Promise.all([
                    productService.product_featured(8, 0),
                    productService.product_news(10, 0),
                    productService.product_for_you(10, 0, localStorage.getItem('customer_id'))

                ]);

                if (!resFeatured.isSuccess || !resNew.isSuccess) {
                    showToast.error("Lỗi lấy sản phẩm nổi bật");
                }
                setFeaturedProducts(resFeatured.data);
                setNewProducts(resNew.data);
                setRecommendedProducts(resForyou.data);

            } catch (err) {
                showToast.error("Đã xảy ra lỗi khi tải sản phẩm");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="min-h-screen flex flex-col ">
            {/* Hero Banner with Carousel */}

            <HeroSection />

            {/* Categories */}
            <section className="py-8 ">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center">
                            <div className="w-1 h-8 bg-blue-600 rounded-full mr-3"></div>
                            <h2 className="text-3xl font-bold text-gray-800">Danh mục nổi bật</h2>
                        </div>
                        <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center group">
                            Xem tất cả
                            <ChevronRight className="h-5 w-5 ml-1 transform group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {categories.map((category, index) => (
                            <div
                                key={index}
                                className={`${category.color} rounded-2xl p-6 text-center cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 border border-transparent hover:border-blue-200`}
                            >
                                <div className="flex justify-center mb-5  rounded-full p-4 w-20 h-20 mx-auto shadow-sm">
                                    {category.icon}
                                </div>
                                <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
                                <p className="text-sm text-gray-600">{category.count}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Gợi ý cho riêng bạn */}
            <section className="py-8 bg-white">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center">
                            <div className="w-1 h-8 bg-purple-600 rounded-full mr-3"></div>
                            <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                                Gợi ý cho riêng bạn
                                <Award className="ml-3 text-purple-600 h-6 w-6" />
                            </h2>
                        </div>
                        <button className="text-purple-600 hover:text-purple-700 font-medium flex items-center group" onClick={() => navigate("/danh-cho-ban")}>
                            Xem tất cả
                            <ChevronRight className="h-5 w-5 ml-1 transform group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {recommendedProducts.map((product, index) => (
                            <ProductCard
                                key={`${index}`}
                                product={product}
                                type="recommended"
                            />
                        ))}
                    </div>
                </div>
            </section>
            {/* Sản phẩm mới */}
            <section className="py-8 ">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center">
                            <div className="w-1 h-8 bg-green-600 rounded-full mr-3"></div>
                            <h2 className="text-3xl font-bold text-gray-800">Sản phẩm mới</h2>
                        </div>
                        <button className="text-green-600 hover:text-green-700 font-medium flex items-center group" onClick={() => navigate("/san-pham-moi")}>
                            Xem tất cả
                            <ChevronRight className="h-5 w-5 ml-1 transform group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    <div className="grid  grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {newProducts.slice(0, 10).map((product, index) => (
                            <ProductCard key={index} product={product} type="new" />
                        ))}
                    </div>
                </div>
            </section>
            {/* <TrustFeatures />    */}

            {/* Sản phẩm nổi bật */}
            <section className="py-8 bg-white">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center">
                            <div className="w-1 h-8 bg-blue-600 rounded-full mr-3"></div>
                            <h2 className="text-3xl font-bold text-gray-800">Sản phẩm nổi bật</h2>
                        </div>
                        <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center group" onClick={() => navigate("/san-pham-moi")}>
                            Xem tất cả
                            <ChevronRight className="h-5 w-5 ml-1 transform group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    <div className="grid  grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {featuredProducts.map((product, index) => (
                            <ProductCard key={index} product={product} type="featured" />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

export default HomePage;