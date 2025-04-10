import { useState } from 'react';
import { Search, ShoppingCart, Heart, Menu, X, ChevronRight, Tag, Star, StarHalf, Clock, Percent } from 'lucide-react';

export default function StorePage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState('all');

    const categories = [
        { id: 'all', name: 'Tất cả sản phẩm' },
        { id: 'electronics', name: 'Điện tử' },
        { id: 'fashion', name: 'Thời trang' },
        { id: 'home', name: 'Đồ gia dụng' },
        { id: 'beauty', name: 'Làm đẹp' },
    ];

    const products = [
        {
            id: 1,
            name: 'Áo thun unisex',
            price: 190000,
            discountPrice: 159000,
            category: 'fashion',
            rating: 4.5,
            image: '/api/placeholder/300/300',
            reviews: 128,
        },
        {
            id: 2,
            name: 'Tai nghe không dây',
            price: 690000,
            discountPrice: 549000,
            category: 'electronics',
            rating: 4.8,
            image: '/api/placeholder/300/300',
            reviews: 256,
        },
        {
            id: 3,
            name: 'Nồi chiên không dầu',
            price: 1290000,
            discountPrice: 990000,
            category: 'home',
            rating: 4.7,
            image: '/api/placeholder/300/300',
            reviews: 89,
        },
        {
            id: 4,
            name: 'Kem dưỡng da',
            price: 450000,
            discountPrice: 379000,
            category: 'beauty',
            rating: 4.6,
            image: '/api/placeholder/300/300',
            reviews: 75,
        },
        {
            id: 5,
            name: 'Quần jeans nam',
            price: 390000,
            discountPrice: 290000,
            category: 'fashion',
            rating: 4.3,
            image: '/api/placeholder/300/300',
            reviews: 64,
        },
        {
            id: 6,
            name: 'Máy lọc không khí',
            price: 2590000,
            discountPrice: 1990000,
            category: 'home',
            rating: 4.9,
            image: '/api/placeholder/300/300',
            reviews: 42,
        },
        {
            id: 7,
            name: 'Mặt nạ dưỡng ẩm',
            price: 35000,
            discountPrice: 25000,
            category: 'beauty',
            rating: 4.2,
            image: '/api/placeholder/300/300',
            reviews: 129,
        },
        {
            id: 8,
            name: 'Điện thoại thông minh',
            price: 7990000,
            discountPrice: 6990000,
            category: 'electronics',
            rating: 4.7,
            image: '/api/placeholder/300/300',
            reviews: 312,
        },
    ];

    const vouchers = [
        {
            id: 1,
            code: 'WELCOME20',
            discount: '20%',
            minSpend: 200000,
            expiry: '30/04/2025',
        },
        {
            id: 2,
            code: 'FREESHIP',
            discount: 'Miễn phí vận chuyển',
            minSpend: 500000,
            expiry: '15/05/2025',
        },
        {
            id: 3,
            code: 'FLASH50K',
            discount: '50.000đ',
            minSpend: 300000,
            expiry: '20/04/2025',
        },
    ];

    const shopInfo = {
        name: 'TechStyle Shop',
        logo: '/api/placeholder/80/80',
        banner: '/api/placeholder/1200/300',
        established: '2018',
        rating: 4.8,
        followers: 15400,
        description: 'TechStyle Shop - Nơi công nghệ gặp phong cách. Chúng tôi cung cấp các sản phẩm chất lượng cao với giá cả hợp lý. Cam kết hàng chính hãng và dịch vụ khách hàng tận tâm.',
        location: 'Quận 1, Thành phố Hồ Chí Minh',
        operatingHours: '8:00 - 21:00 (Thứ 2 - Chủ nhật)',
    };

    const filteredProducts = activeCategory === 'all'
        ? products
        : products.filter(product => product.category === activeCategory);


    const handleCategoryClick = (categoryId) => {
        setActiveCategory(categoryId);
        if (isMenuOpen) {
            setIsMenuOpen(false);
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

    function formatPrice(price) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            maximumFractionDigits: 0
        }).format(price);
    }

    const calculateDiscount = (original, discounted) => {
        return Math.round(((original - discounted) / original) * 100);
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="relative rounded-xl overflow-hidden mb-8">
                <img src={shopInfo.banner} alt="Shop Banner" className="w-full h-64 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6">
                    <div className="flex items-center mb-2">
                        <img src={shopInfo.logo} alt="Shop Logo" className="h-16 w-16 rounded-full border-4 border-white" />
                        <div className="ml-4">
                            <h2 className="text-2xl font-bold text-white">{shopInfo.name}</h2>
                            <div className="flex items-center mt-1">
                                <div className="flex">
                                    {renderRatingStars(shopInfo.rating)}
                                </div>
                                <span className="ml-2 text-white">{shopInfo.rating} ({shopInfo.followers.toLocaleString()} người theo dõi)</span>
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
                            <p className="text-gray-700">{shopInfo.description}</p>
                            <div className="flex items-start">
                                <div className="text-gray-500 mr-2 mt-1">📍</div>
                                <p className="text-gray-700">{shopInfo.location}</p>
                            </div>
                            <div className="flex items-start">
                                <div className="text-gray-500 mr-2 mt-1">🕒</div>
                                <p className="text-gray-700">{shopInfo.operatingHours}</p>
                            </div>
                            <div className="flex items-start">
                                <div className="text-gray-500 mr-2 mt-1">📅</div>
                                <p className="text-gray-700">Hoạt động từ năm {shopInfo.established}</p>
                            </div>
                        </div>
                        <div className="mt-6">
                            <button className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition">
                                Theo dõi Shop
                            </button>
                        </div>
                    </div>

                    {/* Vouchers Card */}
                    <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Mã giảm giá</h3>
                            <Tag size={20} className="text-orange-500" />
                        </div>
                        <div className="space-y-4">
                            {vouchers.map(voucher => (
                                <div key={voucher.id} className="border border-dashed border-orange-300 rounded-lg p-3 bg-orange-50">
                                    <div className="flex justify-between mb-2">
                                        <span className="font-bold text-orange-600">{voucher.discount}</span>
                                        <div className="flex items-center text-xs text-gray-500">
                                            <Clock size={14} className="mr-1" />
                                            <span>HSD: {voucher.expiry}</span>
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-600">Đơn tối thiểu {formatPrice(voucher.minSpend)}</div>
                                    <div className="mt-2 flex justify-between items-center">
                                        <code className="bg-white px-2 py-1 rounded border border-orange-200 text-orange-700 text-sm font-bold">
                                            {voucher.code}
                                        </code>
                                        <button className="text-blue-600 text-sm font-medium">Lưu</button>
                                    </div>
                                </div>
                            ))}
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
                        {filteredProducts.map(product => (
                            <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition">
                                <div className="relative">
                                    <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
                                    <div className="absolute top-2 right-2">
                                        <button className="h-8 w-8 flex items-center justify-center bg-white rounded-full shadow">
                                            <Heart size={16} className="text-gray-400 hover:text-red-500" />
                                        </button>
                                    </div>
                                    {product.price > product.discountPrice && (
                                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                            -{calculateDiscount(product.price, product.discountPrice)}%
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="font-medium text-gray-800 mb-1 line-clamp-2 h-12">{product.name}</h3>
                                    <div className="mb-2">
                                        <span className="font-bold text-lg text-red-600">{formatPrice(product.discountPrice)}</span>
                                        {product.price > product.discountPrice && (
                                            <span className="text-sm text-gray-500 line-through ml-2">{formatPrice(product.price)}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="flex">
                                                {renderRatingStars(product.rating)}
                                            </div>
                                            <span className="ml-1 text-xs text-gray-500">({product.reviews})</span>
                                        </div>
                                        <button className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700">
                                            + Giỏ hàng
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Load More Button */}
                    <div className="mt-8 flex justify-center">
                        <button className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium">
                            Xem thêm sản phẩm
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}