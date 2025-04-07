import React, { useState, useEffect } from 'react';
import { Calendar, Tag, ChevronRight, Clock, Percent, Gift, Search, Filter, ShoppingBag, ArrowDown, ArrowUp } from 'lucide-react';
import ProductCardItem from '../components/product/ProductCard';
import { formatCurrency } from '../common/methodsCommon';
// Promotion Banner Component
const PromotionBanner = ({ promotion }) => {
    return (
        <div className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow relative">
            <img
                src={promotion.image}
                alt={promotion.title}
                className="w-full h-36 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-60"></div>
            <div className="absolute bottom-0 left-0 p-4 text-white">
                <h3 className="font-bold text-lg mb-1">{promotion.title}</h3>
                <div className="flex items-center text-sm">
                    <Clock size={14} className="mr-1" />
                    <span>{promotion.duration}</span>
                </div>
            </div>
            {promotion.isNew && (
                <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">MỚI</div>
            )}
        </div>
    );
};

// Promotion Card for Flash Sale
const FlashSaleCard = ({ product }) => {


    // Calculate percentage sold
    const percentageSold = (product.soldCount / product.stock) * 100;

    return (
        <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-3">
            <div className="relative h-40 mb-3">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain"
                />
                <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-bl">
                    -{product.discount}%
                </div>
            </div>
            <h3 className="text-sm font-medium text-gray-800 mb-1 truncate">{product.name}</h3>
            <div className="flex items-center gap-2 mb-2">
                <span className="font-bold text-red-600">{formatCurrency(product.price)}</span>
                <span className="text-xs text-gray-500 line-through">{formatCurrency(product.originalPrice)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                    className="bg-red-500 h-2 rounded-full"
                    style={{ width: `${percentageSold}%` }}
                ></div>
            </div>
            <div className="text-xs text-red-600 font-medium">
                {product.soldCount}/{product.stock} đã bán
            </div>
        </div>
    );
};

// Voucher Card Component
const VoucherCard = ({ voucher }) => {
    return (
        <div className="flex h-28 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
            {/* Left side - colorful part */}
            <div
                className="w-4 relative"
                style={{ background: voucher.color }}
            >
                <div className="absolute -right-2 top-3 w-4 h-4 rounded-full bg-gray-100"></div>
                <div className="absolute -right-2 bottom-3 w-4 h-4 rounded-full bg-gray-100"></div>
            </div>

            {/* Middle - content part */}
            <div className="flex-grow p-4 bg-white border-r border-dashed border-gray-200 flex flex-col justify-between">
                <div className="flex items-center gap-2">
                    <div
                        className="p-2 rounded-full"
                        style={{ background: `${voucher.color}20` }}
                    >
                        {voucher.type === 'percent' ? (
                            <Percent size={16} style={{ color: voucher.color }} />
                        ) : (
                            <Gift size={16} style={{ color: voucher.color }} />
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold">{voucher.title}</h3>
                        <p className="text-xs text-gray-500">{voucher.code}</p>
                    </div>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                    <Clock size={12} className="mr-1" />
                    <span>HSD: {voucher.expiry}</span>
                </div>
            </div>

            {/* Right side - action part */}
            <div className="w-20 bg-white flex items-center justify-center">
                <button
                    className="py-1 px-3 text-xs font-medium rounded-full"
                    style={{
                        color: voucher.color,
                        border: `1px solid ${voucher.color}`,
                    }}
                >
                    Lưu
                </button>
            </div>
        </div>
    );
};

// Timer Component for Flash Sale
const FlashSaleTimer = () => {
    const [time, setTime] = useState({
        hours: 3,
        minutes: 45,
        seconds: 22
    });

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(prevTime => {
                let { hours, minutes, seconds } = prevTime;

                seconds--;
                if (seconds < 0) {
                    seconds = 59;
                    minutes--;

                    if (minutes < 0) {
                        minutes = 59;
                        hours--;

                        if (hours < 0) {
                            // Reset to some new time when it reaches 0
                            return { hours: 23, minutes: 59, seconds: 59 };
                        }
                    }
                }

                return { hours, minutes, seconds };
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center gap-1">
            <div className="bg-gray-800 text-white px-2 py-1 rounded-sm text-sm font-bold">
                {time.hours.toString().padStart(2, '0')}
            </div>
            <span className="text-gray-800 font-bold">:</span>
            <div className="bg-gray-800 text-white px-2 py-1 rounded-sm text-sm font-bold">
                {time.minutes.toString().padStart(2, '0')}
            </div>
            <span className="text-gray-800 font-bold">:</span>
            <div className="bg-gray-800 text-white px-2 py-1 rounded-sm text-sm font-bold">
                {time.seconds.toString().padStart(2, '0')}
            </div>
        </div>
    );
};

// Main Promotions Page Component
const PromotionsPage = () => {
    const [sortOption, setSortOption] = useState('popular');
    const [showSortOptions, setShowSortOptions] = useState(false);

    // Sample data for promotions
    const flashSaleProducts = Array(10).fill().map((_, i) => ({
        id: `flash-${i + 1}`,
        name: `Sản phẩm Flash Sale ${i + 1}`,
        price: Math.round((299000 + (i * 30000)) * 0.6), // Sale price
        originalPrice: 299000 + (i * 30000),
        discount: 40,
        image: "/api/placeholder/400/400",
        soldCount: 50 + Math.floor(Math.random() * 30),
        stock: 100,
        rating: 4.7
    }));

    const promotionBanners = [
        {
            id: 1,
            title: "Siêu Sale Ngày Phụ Nữ Việt Nam",
            duration: "Còn 3 ngày",
            image: "/api/placeholder/800/300",
            isNew: true
        },
        {
            id: 2,
            title: "Mua 1 Tặng 1 - Mỹ Phẩm Cao Cấp",
            duration: "20/10 - 25/10",
            image: "/api/placeholder/800/300",
            isNew: false
        },
        {
            id: 3,
            title: "Freeship Extra - Đơn từ 0Đ",
            duration: "Đến hết tháng",
            image: "/api/placeholder/800/300",
            isNew: false
        },
    ];

    const vouchers = [
        {
            id: 1,
            title: "Giảm 10% tối đa 50K",
            code: "SALE10",
            expiry: "15/11/2025",
            type: "percent",
            color: "#FF5722"
        },
        {
            id: 2,
            title: "Freeship Extra 20K",
            code: "SHIP20K",
            expiry: "31/10/2025",
            type: "gift",
            color: "#4CAF50"
        },
        {
            id: 3,
            title: "Giảm 100K cho đơn 500K+",
            code: "MEGA100",
            expiry: "20/12/2025",
            type: "percent",
            color: "#2196F3"
        },
        {
            id: 4,
            title: "Hoàn 15% xu",
            code: "CASHBACK15",
            expiry: "10/01/2026",
            type: "percent",
            color: "#9C27B0"
        },
    ];

    const dealProducts = Array(12).fill().map((_, i) => ({
        id: `deal-${i + 1}`,
        name: `Sản phẩm khuyến mãi ${i + 1} - Hàng chất lượng cao`,
        price: Math.round((199000 + (i * 40000)) * (100 - (15 + (i % 3) * 5)) / 100),
        originalPrice: 199000 + (i * 40000),
        discount: 15 + (i % 3) * 5,
        rating: 4.2 + (Math.random() * 0.7),
        image: "/api/placeholder/400/400",
        images: ["/api/placeholder/400/400", "/api/placeholder/400/400"],
        badge: i % 5 === 0 ? "Deal Sốc" : null,
        isNew: i % 7 === 0,
        soldCount: 120 + Math.floor(Math.random() * 500)
    }));

    const sortOptions = [
        { value: 'popular', label: 'Phổ biến' },
        { value: 'newest', label: 'Mới nhất' },
        { value: 'priceAsc', label: 'Giá thấp đến cao' },
        { value: 'priceDesc', label: 'Giá cao đến thấp' },
        { value: 'discount', label: 'Giảm giá nhiều' },
    ];

    const handleSort = (option) => {
        setSortOption(option);
        setShowSortOptions(false);
    };

    return (
        <div className=" mx-auto px-4 py-6">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-xl p-6 mb-8 text-white relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">Khuyến Mãi Tháng 10</h1>
                    <p className="opacity-90 mb-4">Săn sale khủng - Giảm giá sốc - Mã giảm giá độc quyền</p>
                    <button className="bg-white text-red-600 px-4 py-2 rounded-lg font-medium text-sm shadow-md flex items-center gap-1">
                        <ShoppingBag size={16} />
                        Khám phá ngay
                    </button>
                </div>
                <div className="absolute right-6 bottom-0 opacity-20">
                    <Tag size={180} />
                </div>
            </div>

            {/* Flash Sale Section */}
            <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-red-600">FLASH SALE</h2>
                        <FlashSaleTimer />
                    </div>
                    <a href="/flash-sale" className="text-red-600 hover:underline flex items-center text-sm font-medium">
                        Xem tất cả <ChevronRight size={16} />
                    </a>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {flashSaleProducts.slice(0, 5).map(product => (
                        <FlashSaleCard key={product.id} product={product} />
                    ))}
                </div>
            </div>

            {/* Promotion Banners */}
            <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Chương Trình Khuyến Mãi</h2>
                    <a href="/all-promotions" className="text-blue-600 hover:underline flex items-center text-sm font-medium">
                        Xem tất cả <ChevronRight size={16} />
                    </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {promotionBanners.map(promotion => (
                        <PromotionBanner key={promotion.id} promotion={promotion} />
                    ))}
                </div>
            </div>

            {/* Vouchers & Coupons */}
            <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Mã Giảm Giá Cho Bạn</h2>
                    <a href="/vouchers" className="text-blue-600 hover:underline flex items-center text-sm font-medium">
                        Xem thêm <ChevronRight size={16} />
                    </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {vouchers.map(voucher => (
                        <VoucherCard key={voucher.id} voucher={voucher} />
                    ))}
                </div>
            </div>

            {/* Deal Products */}
            <div className="mb-10">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Sản Phẩm Khuyến Mãi</h2>

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
                            placeholder="Tìm kiếm sản phẩm..."
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
                        Giảm giá
                    </button>

                    <button className="border border-gray-300 rounded-lg px-3 py-2 text-sm hover:bg-gray-50">
                        Miễn phí vận chuyển
                    </button>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {dealProducts.map(product => (
                        <ProductCardItem key={product.id} product={product} />
                    ))}
                </div>

                {/* Load More */}
                <div className="flex justify-center mt-8">
                    <button className="border border-gray-300 rounded-lg px-6 py-3 text-sm font-medium hover:bg-gray-50">
                        Xem thêm sản phẩm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PromotionsPage;