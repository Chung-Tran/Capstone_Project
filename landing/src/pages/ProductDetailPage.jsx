import React, { useState } from 'react';
import {
    Star,
    ShoppingCart,
    Heart,
    Share2,
    Truck,
    Shield,
    RotateCcw,
    MessageCircle,
    Store,
    MapPin,
    Phone,
    ThumbsUp,
    ChevronRight,
    ChevronLeft
} from 'lucide-react';
import CarouselList from '../components/CarouselList';
import ProductCardItem from '../components/product/ProductCard';
import { formatCurrency } from '../common/methodsCommon';

const ProductDetailPage = () => {
    // State cho hình ảnh hiện tại
    const [currentImage, setCurrentImage] = useState(0);
    // State cho số lượng
    const [quantity, setQuantity] = useState(1);
    // State cho tab mô tả sản phẩm
    const [activeTab, setActiveTab] = useState('description');
    // State cho các hình ảnh đánh giá được mở rộng
    const [expandedReviewImage, setExpandedReviewImage] = useState(null);

    // Dữ liệu mẫu
    const product = {
        id: 'product-1',
        name: 'Điện thoại Samsung Galaxy S23 Ultra 256GB',
        price: 24990000,
        originalPrice: 31990000,
        discount: 22,
        rating: 4.8,
        reviewCount: 254,
        soldCount: 1243,
        stockStatus: 'Còn hàng',
        images: [
            "/api/placeholder/800/800",
            "/api/placeholder/800/800",
            "/api/placeholder/800/800",
            "/api/placeholder/800/800",
            "/api/placeholder/800/800"
        ],
        colors: ['Đen', 'Trắng', 'Xanh', 'Tím'],
        variants: [
            { name: '128GB', price: 21990000 },
            { name: '256GB', price: 24990000 },
            { name: '512GB', price: 28990000 }
        ],
        description: `
      <p><strong>Samsung Galaxy S23 Ultra</strong> mẫu điện thoại cao cấp nhất của dòng S23 series, sở hữu camera độ phân giải 200MP ấn tượng, chip Snapdragon 8 Gen 2 mạnh mẽ, bộ nhớ RAM 8GB, bộ nhớ trong 256GB cùng với khung viền kim loại bền bỉ, màn hình 6.8 inch sắc nét.</p>
      <br/>
      <p><strong>Thông số kỹ thuật:</strong></p>
      <ul>
        <li>Màn hình: Dynamic AMOLED 2X, 6.8 inch, Quad HD+ (3088 x 1440), 120Hz</li>
        <li>Camera sau: 200MP + 12MP + 10MP + 10MP</li>
        <li>Camera trước: 12MP</li>
        <li>Chip: Snapdragon 8 Gen 2</li>
        <li>RAM: 8GB</li>
        <li>Bộ nhớ trong: 256GB</li>
        <li>Pin: 5000mAh, Sạc nhanh 45W</li>
        <li>Hệ điều hành: Android 13, One UI 5.1</li>
      </ul>
    `,
        specifications: [
            { name: 'Màn hình', value: 'Dynamic AMOLED 2X, 6.8 inch, Quad HD+ (3088 x 1440), 120Hz' },
            { name: 'Camera sau', value: 'Camera chính: 200MP, f/1.7\nCamera góc siêu rộng: 12MP, f/2.2\nCamera tele 1: 10MP, f/2.4, zoom quang 3x\nCamera tele 2: 10MP, f/4.9, zoom quang 10x' },
            { name: 'Camera trước', value: '12MP, f/2.2' },
            { name: 'Chip', value: 'Snapdragon 8 Gen 2 for Galaxy' },
            { name: 'RAM', value: '8GB' },
            { name: 'Bộ nhớ trong', value: '256GB' },
            { name: 'Pin', value: '5000mAh, Sạc nhanh 45W, sạc không dây 15W' },
            { name: 'Hệ điều hành', value: 'Android 13, One UI 5.1' },
            { name: 'Kích thước', value: '163.4 x 78.1 x 8.9 mm' },
            { name: 'Trọng lượng', value: '233g' },
            { name: 'Chống nước', value: 'IP68' },
        ]
    };

    const coupons = [
        { code: 'GIAMSOC500K', discount: '500.000đ', minOrder: '20.000.000đ', validUntil: '30/04/2025' },
        { code: 'MOIHANG10', discount: '10%', minOrder: '5.000.000đ', validUntil: '15/05/2025', maxDiscount: '800.000đ' },
        { code: 'FREESHIP0D', discount: 'Freeship', minOrder: '500.000đ', validUntil: '30/04/2025' }
    ];

    const shop = {
        name: 'Samsung Official Store',
        avatar: '/api/placeholder/100/100',
        rating: 4.9,
        followers: 856200,
        responseRate: 98,
        responseTime: 'trong 5 phút',
        address: 'Quận 7, TP. Hồ Chí Minh',
        joinDate: '15/01/2018',
        productCount: 342
    };

    const reviews = [
        {
            id: 1,
            user: { name: 'Nguyễn Văn A', avatar: '/api/placeholder/40/40' },
            rating: 5,
            date: '05/04/2025',
            content: 'Sản phẩm rất tốt, đúng như mô tả. Camera chụp đẹp, pin trâu. Đặc biệt S Pen rất tiện lợi cho công việc của mình. Shop giao hàng nhanh và đóng gói cẩn thận.',
            images: ['/api/placeholder/200/200', '/api/placeholder/200/200'],
            helpful: 45,
            variant: '256GB - Đen'
        },
        {
            id: 2,
            user: { name: 'Trần Thị B', avatar: '/api/placeholder/40/40' },
            rating: 4,
            date: '02/04/2025',
            content: 'Điện thoại đẹp, chụp hình sắc nét. Chỉ tiếc là pin không được trâu như quảng cáo. Mong shop tư vấn thêm cách tối ưu pin.',
            images: ['/api/placeholder/200/200'],
            helpful: 23,
            variant: '512GB - Xanh'
        },
        {
            id: 3,
            user: { name: 'Lê Văn C', avatar: '/api/placeholder/40/40' },
            rating: 5,
            date: '28/03/2025',
            content: 'Mua làm quà tặng sinh nhật vợ, vợ rất thích. Màn hình đẹp, camera chụp đêm tốt. Đóng gói cẩn thận, có quà tặng kèm là ốp lưng rất xinh.',
            helpful: 19,
            variant: '256GB - Tím'
        }
    ];

    const relatedProducts = Array(8).fill().map((_, i) => ({
        id: `related-${i + 1}`,
        name: `Samsung Galaxy A${54 + i}`,
        price: 5990000 + (i * 1000000),
        originalPrice: 6990000 + (i * 1000000),
        discount: 15,
        rating: 4.2 + (Math.random() * 0.7),
        reviewCount: 50 + Math.floor(Math.random() * 100),
        image: "/api/placeholder/400/400",
        images: ["/api/placeholder/400/400", "/api/placeholder/400/400"],
        soldCount: 100 + Math.floor(Math.random() * 900)
    }));

    // Giảm số lượng
    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    // Tăng số lượng
    const increaseQuantity = () => {
        setQuantity(quantity + 1);
    };

    // Xử lý copy mã giảm giá
    const copyCoupon = (code) => {
        navigator.clipboard.writeText(code)
            .then(() => {
                alert(`Đã sao chép mã: ${code}`);
            })
            .catch(err => {
                console.error('Lỗi khi sao chép:', err);
            });
    };

    // Hiển thị đánh giá sao
    const renderStars = (rating) => {
        return Array(5).fill().map((_, i) => (
            <Star
                key={i}
                size={16}
                className={i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" :
                    (i < rating ? "fill-yellow-400 text-yellow-400 opacity-50" : "text-gray-300")}
            />
        ));
    };

    return (
        <div className=" mx-auto px-4 py-6">
            {/* Breadcrumbs */}
            <div className="flex items-center text-sm text-gray-500 mb-6">
                <a href="/" className="hover:text-blue-600">Trang chủ</a>
                <ChevronRight size={16} className="mx-2" />
                <a href="/dien-thoai" className="hover:text-blue-600">Điện thoại</a>
                <ChevronRight size={16} className="mx-2" />
                <a href="/dien-thoai/samsung" className="hover:text-blue-600">Samsung</a>
                <ChevronRight size={16} className="mx-2" />
                <span className="text-gray-700 font-medium truncate">{product.name}</span>
            </div>

            {/* Product info section */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
                    {/* Product images */}
                    <div>
                        <div className="relative mb-4 rounded-lg overflow-hidden bg-gray-100 aspect-square">
                            <img
                                src={product.images[currentImage]}
                                alt={product.name}
                                className="w-full h-full object-contain"
                            />
                            {product.discount > 0 && (
                                <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded-md text-sm font-bold">
                                    -{product.discount}%
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {product.images.map((img, index) => (
                                <div
                                    key={index}
                                    className={`w-16 h-16 rounded-md overflow-hidden cursor-pointer border-2 ${currentImage === index ? 'border-blue-600' : 'border-transparent'
                                        }`}
                                    onClick={() => setCurrentImage(index)}
                                >
                                    <img
                                        src={img}
                                        alt={`Product view ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-center gap-4 mt-4">
                            <button className="flex items-center gap-1 text-sm text-gray-700 hover:text-blue-600">
                                <Share2 size={18} />
                                <span>Chia sẻ</span>
                            </button>
                            <button className="flex items-center gap-1 text-sm text-gray-700 hover:text-red-600">
                                <Heart size={18} />
                                <span>Yêu thích</span>
                            </button>
                            <button className="flex items-center gap-1 text-sm text-gray-700 hover:text-blue-600">
                                <MessageCircle size={18} />
                                <span>Hỏi đáp</span>
                            </button>
                        </div>
                    </div>

                    {/* Product details */}
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-bold text-gray-800 mb-3">{product.name}</h1>

                        <div className="flex items-center gap-4 mb-3">
                            <div className="flex items-center">
                                <span className="font-bold text-lg text-red-600 mr-2">{product.rating}</span>
                                <div className="flex">{renderStars(product.rating)}</div>
                            </div>
                            <div className="text-sm text-gray-600 border-l border-gray-300 pl-4">
                                <span>{product.reviewCount} đánh giá</span>
                            </div>
                            <div className="text-sm text-gray-600 border-l border-gray-300 pl-4">
                                <span>{product.soldCount} đã bán</span>
                            </div>
                        </div>

                        <div className="flex items-baseline gap-3 mb-6">
                            <div className="text-3xl font-bold text-red-600">
                                {formatCurrency(product.price)}
                            </div>
                            {product.originalPrice > product.price && (
                                <div className="text-base text-gray-500 line-through">
                                    {formatCurrency(product.originalPrice)}
                                </div>
                            )}
                        </div>

                        {/* Variants */}
                        <div className="mb-6">
                            <div className="text-sm font-medium text-gray-700 mb-2">Phiên bản:</div>
                            <div className="flex flex-wrap gap-2">
                                {product.variants.map((variant, index) => (
                                    <div
                                        key={index}
                                        className={`px-4 py-2 border rounded-lg cursor-pointer text-sm ${variant.price === product.price
                                            ? 'border-blue-600 bg-blue-50 text-blue-600'
                                            : 'border-gray-300 hover:border-blue-300'
                                            }`}
                                    >
                                        <div className="font-medium">{variant.name}</div>
                                        <div className="text-xs mt-1">{formatCurrency(variant.price)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Colors */}
                        <div className="mb-6">
                            <div className="text-sm font-medium text-gray-700 mb-2">Màu sắc:</div>
                            <div className="flex flex-wrap gap-2">
                                {product.colors.map((color, index) => (
                                    <div
                                        key={index}
                                        className={`px-4 py-2 border rounded-lg cursor-pointer text-sm ${index === 0
                                            ? 'border-blue-600 bg-blue-50 text-blue-600'
                                            : 'border-gray-300 hover:border-blue-300'
                                            }`}
                                    >
                                        {color}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quantity */}
                        <div className="mb-6">
                            <div className="text-sm font-medium text-gray-700 mb-2">Số lượng:</div>
                            <div className="flex items-center">
                                <button
                                    className="w-10 h-10 rounded-l-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                                    onClick={decreaseQuantity}
                                >
                                    -
                                </button>
                                <input
                                    type="number"
                                    min="1"
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                    className="w-16 h-10 border-t border-b border-gray-300 text-center"
                                />
                                <button
                                    className="w-10 h-10 rounded-r-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                                    onClick={increaseQuantity}
                                >
                                    +
                                </button>
                                <span className="ml-3 text-sm text-gray-600">
                                    {product.stockStatus}
                                </span>
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex gap-4 mt-2">
                            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-colors">
                                <ShoppingCart size={20} />
                                <span>Thêm vào giỏ</span>
                            </button>
                            <button className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg shadow-sm transition-colors">
                                Mua ngay
                            </button>
                        </div>

                        {/* Trust badges */}
                        <div className="grid grid-cols-3 gap-4 mt-6 border-t border-gray-200 pt-6">
                            <div className="flex flex-col items-center text-center">
                                <Truck size={22} className="text-blue-600 mb-2" />
                                <span className="text-xs text-gray-600">Giao hàng miễn phí</span>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <Shield size={22} className="text-blue-600 mb-2" />
                                <span className="text-xs text-gray-600">Bảo hành 24 tháng</span>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <RotateCcw size={22} className="text-blue-600 mb-2" />
                                <span className="text-xs text-gray-600">30 ngày đổi trả</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Coupon section */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-800">Mã giảm giá</h2>
                </div>
                <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {coupons.map((coupon, index) => (
                            <div
                                key={index}
                                className="border border-dashed border-orange-400 bg-orange-50 rounded-lg p-3 relative overflow-hidden"
                            >
                                <div className="absolute -left-5 top-0 bottom-0 flex items-center">
                                    <div className="w-10 h-10 bg-white rounded-full"></div>
                                </div>
                                <div className="absolute -right-5 top-0 bottom-0 flex items-center">
                                    <div className="w-10 h-10 bg-white rounded-full"></div>
                                </div>
                                <div className="ml-2">
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="text-lg font-bold text-orange-600">
                                            {coupon.discount}
                                        </div>
                                        <button
                                            onClick={() => copyCoupon(coupon.code)}
                                            className="text-xs bg-orange-600 text-white px-2 py-1 rounded"
                                        >
                                            Sao chép
                                        </button>
                                    </div>
                                    <div className="text-xs text-gray-600 mb-1">
                                        Đơn tối thiểu {coupon.minOrder}
                                    </div>
                                    {coupon.maxDiscount && (
                                        <div className="text-xs text-gray-600 mb-1">
                                            Giảm tối đa {coupon.maxDiscount}
                                        </div>
                                    )}
                                    <div className="text-xs text-gray-500">
                                        HSD: {coupon.validUntil}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Shop info */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-800">Thông tin shop</h2>
                </div>
                <div className="p-4">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-full overflow-hidden">
                            <img
                                src={shop.avatar}
                                alt={shop.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-grow">
                            <h3 className="text-xl font-bold text-gray-800 mb-1">{shop.name}</h3>
                            <div className="flex items-center gap-6 mb-2">
                                <div className="flex items-center">
                                    <div className="flex mr-1">{renderStars(shop.rating)}</div>
                                    <span className="text-sm text-gray-600">{shop.rating}</span>
                                </div>
                                <div className="text-sm text-gray-600">
                                    <span className="font-medium">{shop.followers.toLocaleString()}</span> người theo dõi
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                    <Store size={16} className="text-gray-500" />
                                    <span>{shop.productCount} sản phẩm</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <MapPin size={16} className="text-gray-500" />
                                    <span>{shop.address}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <MessageCircle size={16} className="text-gray-500" />
                                    <span>Phản hồi {shop.responseRate}% trong {shop.responseTime}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-colors">
                                Xem shop
                            </button>
                            <button className="border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-2 px-4 rounded-lg transition-colors">
                                Theo dõi
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product description & specifications */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
                <div className="border-b border-gray-200">
                    <div className="flex">
                        <button
                            className={`px-6 py-3 text-sm font-medium ${activeTab === 'description'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-600 hover:text-gray-800'
                                }`}
                            onClick={() => setActiveTab('description')}
                        >
                            Mô tả sản phẩm
                        </button>
                        <button
                            className={`px-6 py-3 text-sm font-medium ${activeTab === 'specifications'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-600 hover:text-gray-800'
                                }`}
                            onClick={() => setActiveTab('specifications')}
                        >
                            Thông số kỹ thuật
                        </button>
                    </div>
                </div>
                <div className="p-6">
                    {activeTab === 'description' ? (
                        <div
                            className="prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: product.description }}
                        />
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {product.specifications.map((spec, index) => (
                                <div key={index} className="py-3 grid grid-cols-3">
                                    <div className="text-sm text-gray-600">{spec.name}</div>
                                    <div className="col-span-2 text-sm whitespace-pre-line">{spec.value}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-medium text-gray-800">Đánh giá từ khách hàng</h2>
                    <button className="text-sm text-blue-600 hover:underline">
                        Xem tất cả ({product.reviewCount})
                    </button>
                </div>

                <div className="p-6">
                    {/* Summary */}
                    <div className="flex bg-blue-50 rounded-lg p-4 mb-6">
                        <div className="flex-1 flex flex-col items-center justify-center border-r border-blue-100">
                            <div className="text-3xl font-bold text-blue-600 mb-1">{product.rating}/5</div>
                            <div className="flex mb-1">{renderStars(product.rating)}</div>
                            <div className="text-sm text-gray-600">{product.reviewCount} đánh giá</div>
                        </div>
                        <div className="flex-1 pl-6">
                            <div className="space-y-2">
                                {[5, 4, 3, 2, 1].map(star => {
                                    const percentage = star === 5 ? 75 : star === 4 ? 20 : star === 3 ? 4 : star === 2 ? 1 : 0;
                                    return (
                                        <div key={star} className="flex items-center text-sm">
                                            <div className="flex items-center w-16">
                                                <span>{star}</span>
                                                <Star size={12} className="ml-1 fill-yellow-400 text-yellow-400" />
                                            </div>
                                            <div className="w-48 h-2 bg-gray-200 rounded-full mx-2">
                                                <div
                                                    className="h-2 bg-yellow-400 rounded-full"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            <span className="text-gray-600">{percentage}%</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Review filter */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        <button className="px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded-full">
                            Tất cả
                        </button>
                        <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full">
                            5 Sao (190)
                        </button>
                        <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full">
                            4 Sao (50)
                        </button>
                        <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full">
                            3 Sao (10)
                        </button>
                        <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full">
                            Có hình ảnh (87)
                        </button>
                    </div>

                    {/* Review list */}
                    <div className="space-y-6">
                        {reviews.map(review => (
                            <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full overflow-hidden">
                                        <img
                                            src={review.user.avatar}
                                            alt={review.user.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-800">{review.user.name}</div>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <div className="flex">{renderStars(review.rating)}</div>
                                            <span>|</span>
                                            <span>{review.date}</span>
                                            <span>|</span>
                                            <span>{review.variant}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-gray-800 mb-3">{review.content}</div>

                                {review.images && review.images.length > 0 && (
                                    <div className="flex gap-2 mb-3">
                                        {review.images.map((img, idx) => (
                                            <div
                                                key={idx}
                                                className="w-16 h-16 rounded-md overflow-hidden cursor-pointer"
                                                onClick={() => setExpandedReviewImage(img)}
                                            >
                                                <img src={img} alt={`Review image ${idx + 1}`} className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600">
                                    <ThumbsUp size={14} />
                                    <span>Hữu ích ({review.helpful})</span>
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Load more button */}
                    <div className="mt-6 text-center">
                        <button className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                            Xem thêm đánh giá
                        </button>
                    </div>

                    {/* Review image modal */}
                    {expandedReviewImage && (
                        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                            <div className="max-w-3xl max-h-full relative">
                                <button
                                    className="absolute -top-10 right-0 text-white"
                                    onClick={() => setExpandedReviewImage(null)}
                                >
                                    Đóng
                                </button>
                                <img
                                    src={expandedReviewImage}
                                    alt="Review detail"
                                    className="max-w-full max-h-[80vh] object-contain"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Related products */}
            <CarouselList
                title="Sản phẩm tương tự"
                icon={<ThumbsUp size={18} />}
                viewAll="/related-products"
            >
                {relatedProducts.map(product => (
                    <div key={product.id} className="flex-shrink-0 w-64">
                        <ProductCardItem product={product} />
                    </div>
                ))}
            </CarouselList>

            {/* Back to top button */}
            <button
                className="fixed bottom-6 right-6 bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-700 transition-colors"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
                <ChevronLeft size={24} className="rotate-90" />
            </button>
        </div>
    );
};

export default ProductDetailPage;