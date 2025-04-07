import React, { useState, useEffect } from 'react';
import { Clock, Tag, ChevronRight, Star, Search, Filter, ShoppingBag, ArrowDown, ArrowUp, Sparkles, TrendingUp } from 'lucide-react';
import ProductCardItem from '../components/product/ProductCard';
import { formatCurrency } from '../common/methodsCommon';
// Featured New Product Component
const FeaturedNewProduct = ({ product }) => {

    return (
        <div className="flex flex-col md:flex-row bg-white rounded-xl shadow-md overflow-hidden">
            <div className="w-full md:w-1/2 relative h-64 md:h-auto">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                />
                {product.isHot && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">HOT</div>
                )}
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
                            <span className="ml-1 text-sm font-medium text-gray-700">{product.rating}</span>
                        </div>
                        <span className="text-sm text-gray-500">• {product.reviewCount} đánh giá</span>
                    </div>
                    <p className="text-gray-600 mb-4 text-sm">{product.description}</p>
                </div>
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl font-bold text-gray-800">{formatCurrency(product.price)}</span>
                        {product.discount > 0 && (
                            <>
                                <span className="text-sm text-gray-500 line-through">{formatCurrency(product.originalPrice)}</span>
                                <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">-{product.discount}%</span>
                            </>
                        )}
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center w-full">
                        <ShoppingBag size={16} className="mr-2" />
                        Thêm vào giỏ hàng
                    </button>
                </div>
            </div>
        </div>
    );
};

// New Product Card Component
const NewProductCard = ({ product }) => {

    // Calculate days since launch
    const getDaysSinceLaunch = (launchDate) => {
        const today = new Date();
        const launch = new Date(launchDate);
        const diffTime = Math.abs(today - launch);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-3 relative">
            <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                Mới {getDaysSinceLaunch(product.launchDate)}d
            </div>

            <div className="relative h-40 mb-3">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain"
                />
                {product.discount > 0 && (
                    <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-bl">
                        -{product.discount}%
                    </div>
                )}
            </div>

            <h3 className="text-sm font-medium text-gray-800 mb-1 truncate">{product.name}</h3>

            <div className="flex items-center gap-2 mb-2">
                <span className="font-bold text-gray-800">{formatCurrency(product.price)}</span>
                {product.discount > 0 && (
                    <span className="text-xs text-gray-500 line-through">{formatCurrency(product.originalPrice)}</span>
                )}
            </div>

            <div className="flex items-center mb-2">
                <div className="flex items-center text-yellow-400 mr-2">
                    <Star size={14} fill="currentColor" />
                    <span className="ml-1 text-xs font-medium text-gray-700">{product.rating}</span>
                </div>
                <span className="text-xs text-gray-500">• {product.reviewCount} đánh giá</span>
            </div>

            {product.isHot && (
                <div className="text-xs font-medium text-red-600 flex items-center">
                    <TrendingUp size={12} className="mr-1" />
                    Đang hot
                </div>
            )}
        </div>
    );
};

// Category Card Component
const CategoryCard = ({ category }) => {
    return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
                {category.icon}
            </div>
            <h3 className="font-medium text-gray-800">{category.name}</h3>
            <p className="text-xs text-gray-500 mt-1">{category.productCount} sản phẩm</p>
        </div>
    );
};

// Brand Highlight Component
const BrandHighlight = ({ brand }) => {
    return (
        <div className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow relative group">
            <img
                src={brand.image}
                alt={brand.name}
                className="w-full h-28 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
            <div className="absolute bottom-0 left-0 p-3 text-white z-10">
                <h3 className="font-bold text-lg">{brand.name}</h3>
                <p className="text-xs">{brand.description}</p>
            </div>
            <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-20 transition-opacity"></div>
        </div>
    );
};

// Timer for "Upcoming Products"
const LaunchTimer = ({ launchDate }) => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = new Date(launchDate) - new Date();
            if (difference > 0) {
                return {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                };
            }
            return {
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0
            };
        };

        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [launchDate]);

    return (
        <div className="flex items-center gap-2 text-sm">
            <div className="bg-gray-800 text-white px-2 py-1 rounded-sm">
                {timeLeft.days}d
            </div>
            <div className="bg-gray-800 text-white px-2 py-1 rounded-sm">
                {timeLeft.hours.toString().padStart(2, '0')}h
            </div>
            <div className="bg-gray-800 text-white px-2 py-1 rounded-sm">
                {timeLeft.minutes.toString().padStart(2, '0')}m
            </div>
            <div className="bg-gray-800 text-white px-2 py-1 rounded-sm">
                {timeLeft.seconds.toString().padStart(2, '0')}s
            </div>
        </div>
    );
};

// Main New Products Page Component
const NewProductsPage = () => {
    const [sortOption, setSortOption] = useState('newest');
    const [showSortOptions, setShowSortOptions] = useState(false);

    // Sample data for featured product
    const featuredProduct = {
        id: 'featured-1',
        name: 'iPhone 15 Pro Max - Phiên bản giới hạn',
        description: 'Sản phẩm mới nhất từ Apple với chip A17 Pro, camera chuyên nghiệp 48MP và màn hình Super Retina XDR với ProMotion.',
        price: 35990000,
        originalPrice: 39990000,
        discount: 10,
        rating: 4.9,
        reviewCount: 127,
        image: "/api/placeholder/800/600",
        isHot: true
    };

    // Sample data for new products
    const newProducts = Array(12).fill().map((_, i) => ({
        id: `new-${i + 1}`,
        name: `Sản phẩm mới ${i + 1} - Công nghệ hiện đại`,
        price: 349000 + (i * 500000),
        originalPrice: i % 3 === 0 ? (349000 + (i * 500000)) * 1.2 : undefined,
        discount: i % 3 === 0 ? 20 : 0,
        rating: 4.0 + (Math.random() * 1.0).toFixed(1),
        reviewCount: Math.floor(Math.random() * 100),
        image: "/api/placeholder/400/400",
        launchDate: new Date(Date.now() - (Math.floor(Math.random() * 14) + 1) * 24 * 60 * 60 * 1000).toISOString(), // 1-14 days ago
        isHot: i % 4 === 0
    }));

    // Sample data for upcoming products
    const upcomingProducts = Array(4).fill().map((_, i) => ({
        id: `upcoming-${i + 1}`,
        name: `Sản phẩm sắp ra mắt ${i + 1}`,
        description: `Đây là mô tả sơ lược về sản phẩm sắp ra mắt ${i + 1} với nhiều tính năng thú vị.`,
        image: "/api/placeholder/400/400",
        launchDate: new Date(Date.now() + ((i + 1) * 4 * 24 * 60 * 60 * 1000)).toISOString(), // Launch in the future
        preOrderAvailable: i % 2 === 0
    }));

    // Sample data for categories
    const categories = [
        { id: 1, name: 'Điện thoại', productCount: 45, icon: <Tag size={24} className="text-blue-600" /> },
        { id: 2, name: 'Laptop', productCount: 32, icon: <Tag size={24} className="text-green-600" /> },
        { id: 3, name: 'Thời trang', productCount: 78, icon: <Tag size={24} className="text-purple-600" /> },
        { id: 4, name: 'Đồng hồ', productCount: 29, icon: <Tag size={24} className="text-red-600" /> },
        { id: 5, name: 'Mỹ phẩm', productCount: 63, icon: <Tag size={24} className="text-yellow-600" /> },
        { id: 6, name: 'Đồ gia dụng', productCount: 54, icon: <Tag size={24} className="text-pink-600" /> },
    ];

    // Sample data for brands
    const brands = [
        { id: 1, name: 'Samsung', description: 'Sản phẩm mới 2025', image: "/api/placeholder/400/200" },
        { id: 2, name: 'Apple', description: 'iPhone mới nhất', image: "/api/placeholder/400/200" },
        { id: 3, name: 'Xiaomi', description: 'Công nghệ hiện đại', image: "/api/placeholder/400/200" },
        { id: 4, name: 'LG', description: 'Đồ gia dụng cao cấp', image: "/api/placeholder/400/200" },
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

    return (
        <div className=" mx-auto px-4 py-6">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 mb-8 text-white relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">Sản Phẩm Mới Nhất</h1>
                    <p className="opacity-90 mb-4">Khám phá những sản phẩm mới nhất và xu hướng mới nhất trên thị trường</p>
                    <button className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium text-sm shadow-md flex items-center gap-1">
                        <Sparkles size={16} />
                        Khám phá ngay
                    </button>
                </div>
                <div className="absolute right-6 bottom-0 opacity-20">
                    <Tag size={180} />
                </div>
            </div>

            {/* Featured New Product */}
            <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Sản Phẩm Nổi Bật</h2>
                </div>
                <FeaturedNewProduct product={featuredProduct} />
            </div>

            {/* New Releases Category Tabs */}
            <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Danh Mục Sản Phẩm Mới</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                    {categories.map(category => (
                        <CategoryCard key={category.id} category={category} />
                    ))}
                </div>
            </div>

            {/* Brand New Releases */}
            <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Thương Hiệu Nổi Bật</h2>
                    <a href="/brands" className="text-blue-600 hover:underline flex items-center text-sm font-medium">
                        Xem tất cả <ChevronRight size={16} />
                    </a>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {brands.map(brand => (
                        <BrandHighlight key={brand.id} brand={brand} />
                    ))}
                </div>
            </div>

            {/* Upcoming Products Section */}
            <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Sắp Ra Mắt</h2>
                    <a href="/upcoming" className="text-blue-600 hover:underline flex items-center text-sm font-medium">
                        Xem tất cả <ChevronRight size={16} />
                    </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {upcomingProducts.map(product => (
                        <div key={product.id} className="bg-white rounded-lg shadow-md p-4">
                            <div className="relative h-40 mb-3">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-contain"
                                />
                                <div className="absolute top-0 left-0 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-br">
                                    Sắp ra mắt
                                </div>
                            </div>
                            <h3 className="text-sm font-medium text-gray-800 mb-2">{product.name}</h3>
                            <p className="text-xs text-gray-600 mb-3">{product.description}</p>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-1 text-xs text-gray-700">
                                    <Clock size={14} />
                                    <span>Ra mắt sau:</span>
                                </div>
                                <LaunchTimer launchDate={product.launchDate} />
                            </div>
                            <button className={`w-full py-2 px-4 rounded-lg text-sm font-medium ${product.preOrderAvailable ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-200 text-gray-700'}`}>
                                {product.preOrderAvailable ? 'Đặt trước' : 'Thông báo khi ra mắt'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* All New Products */}
            <div className="mb-10">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Tất Cả Sản Phẩm Mới</h2>

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
                                            className={`px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm ${sortOption === option.value ? 'text-blue-600 font-medium' : 'text-gray-700'}`}
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

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm mới..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-48 sm:w-64"
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
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {newProducts.map(product => (
                        <NewProductCard key={product.id} product={product} />
                    ))}
                </div>

                {/* Load More */}
                <div className="flex justify-center mt-8">
                    <button className="border border-gray-300 rounded-lg px-6 py-3 text-sm font-medium hover:bg-gray-50">
                        Xem thêm sản phẩm mới
                    </button>
                </div>
            </div>

            {/* Newsletter Subscription */}
            <div className="bg-gray-100 rounded-xl p-6 mb-8 text-center">
                <h2 className="text-xl font-bold text-gray-800 mb-3">Đăng ký nhận thông báo sản phẩm mới</h2>
                <p className="text-gray-600 mb-4">Hãy là người đầu tiên biết về các sản phẩm mới ra mắt và nhận ưu đãi độc quyền</p>
                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                    <input
                        type="email"
                        placeholder="Nhập địa chỉ email của bạn"
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-grow"
                    />
                    <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium text-sm">
                        Đăng ký
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewProductsPage;