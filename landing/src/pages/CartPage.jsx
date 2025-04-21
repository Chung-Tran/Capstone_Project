import { useEffect, useState } from 'react';
import { Trash2, Plus, Minus, ShoppingBag, ChevronLeft, CreditCard, Tag } from 'lucide-react';
import customerItemsService from '../services/customerItems.service';

export default function ShoppingCart() {
    // Cấu trúc dữ liệu: nhóm sản phẩm theo shop
    const [cartByShop, setCartByShop] = useState({});
    // Danh sách voucher đã áp dụng (cả shop và sàn)
    const [appliedVouchers, setAppliedVouchers] = useState({
        platform: [], // Voucher của sàn
        shops: {}     // Voucher của từng shop, key là shop_id
    });
    // Voucher đang nhập
    const [voucherCode, setVoucherCode] = useState('');
    // Phí vận chuyển (có thể tính theo shop)
    const [shipping, setShipping] = useState(30000);
    // Loading state
    const [loading, setLoading] = useState(true);

    // Lấy dữ liệu giỏ hàng
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await customerItemsService.get_cart_items();
            if (response.isSuccess) {
                // Nhóm sản phẩm theo shop
                const groupedByShop = {};
                response.data.forEach(item => {
                    const storeId = item.product_id.store_id._id;
                    if (!groupedByShop[storeId]) {
                        groupedByShop[storeId] = {
                            shopInfo: {
                                id: storeId,
                                name: item.product_id.store_id.store_name,
                                logo: item.product_id.store_id.store_logo
                            },
                            items: []
                        };
                    }
                    groupedByShop[storeId].items.push(item);
                });
                setCartByShop(groupedByShop);

                // Khởi tạo đối tượng voucher shop trống
                const shopVouchers = {};
                Object.keys(groupedByShop).forEach(shopId => {
                    shopVouchers[shopId] = [];
                });
                setAppliedVouchers(prev => ({
                    ...prev,
                    shops: shopVouchers
                }));
            }
        } catch (error) {
            console.error('Lỗi khi lấy giỏ hàng:', error);
        } finally {
            setLoading(false);
        }
    };

    // Cập nhật số lượng sản phẩm
    const updateQuantity = async (shopId, itemId, change) => {
        // Cập nhật UI trước
        setCartByShop(prev => {
            const shopItems = [...prev[shopId].items];
            const itemIndex = shopItems.findIndex(item => item._id === itemId);

            if (itemIndex !== -1) {
                const updatedItem = {
                    ...shopItems[itemIndex],
                    quantity: Math.max(1, shopItems[itemIndex].quantity + change)
                };
                shopItems[itemIndex] = updatedItem;
            }

            return {
                ...prev,
                [shopId]: {
                    ...prev[shopId],
                    items: shopItems
                }
            };
        });

        // Gọi API cập nhật số lượng
        try {
            await customerItemsService.update_cart_quantity(itemId, {
                quantity: Math.max(1, getItemQuantity(shopId, itemId) + change)
            });
        } catch (error) {
            console.error('Lỗi khi cập nhật số lượng:', error);
            // Nếu lỗi, fetch lại dữ liệu để đồng bộ
            fetchData();
        }
    };

    // Helper để lấy số lượng hiện tại của item
    const getItemQuantity = (shopId, itemId) => {
        const shop = cartByShop[shopId];
        if (!shop) return 0;

        const item = shop.items.find(item => item._id === itemId);
        return item ? item.quantity : 0;
    };

    // Xóa sản phẩm khỏi giỏ hàng
    const removeItem = async (shopId, itemId) => {
        // Cập nhật UI trước
        setCartByShop(prev => {
            const updatedItems = prev[shopId].items.filter(item => item._id !== itemId);

            // Nếu shop không còn sản phẩm nào, xóa luôn shop
            if (updatedItems.length === 0) {
                const { [shopId]: removedShop, ...rest } = prev;

                // Cập nhật luôn applied vouchers
                const updatedShopVouchers = { ...appliedVouchers.shops };
                delete updatedShopVouchers[shopId];
                setAppliedVouchers(prev => ({
                    ...prev,
                    shops: updatedShopVouchers
                }));

                return rest;
            }

            return {
                ...prev,
                [shopId]: {
                    ...prev[shopId],
                    items: updatedItems
                }
            };
        });

        // Gọi API xóa item
        try {
            await customerItemsService.remove_from_cart(itemId);
        } catch (error) {
            console.error('Lỗi khi xóa sản phẩm:', error);
            // Nếu lỗi, fetch lại dữ liệu để đồng bộ
            fetchData();
        }
    };

    // Áp dụng voucher
    const applyVoucher = async () => {
        if (!voucherCode.trim()) return;

        try {
            // Gọi API kiểm tra voucher
            const response = await customerItemsService.validate_voucher(voucherCode);

            if (response.isSuccess) {
                const voucher = response.data;

                // Xác định loại voucher (sàn hay shop)
                if (voucher.type === 'PLATFORM') {
                    // Voucher của sàn
                    setAppliedVouchers(prev => ({
                        ...prev,
                        platform: [...prev.platform, voucher]
                    }));
                } else if (voucher.type === 'SHOP') {
                    // Voucher của shop
                    const shopId = voucher.shop_id;

                    // Kiểm tra xem shop này có trong giỏ hàng không
                    if (cartByShop[shopId]) {
                        setAppliedVouchers(prev => ({
                            ...prev,
                            shops: {
                                ...prev.shops,
                                [shopId]: [...(prev.shops[shopId] || []), voucher]
                            }
                        }));
                    } else {
                        alert('Voucher này không áp dụng cho các sản phẩm trong giỏ hàng của bạn.');
                    }
                }

                // Xóa mã voucher sau khi áp dụng
                setVoucherCode('');
            } else {
                alert('Mã giảm giá không hợp lệ hoặc đã hết hạn.');
            }
        } catch (error) {
            console.error('Lỗi khi áp dụng voucher:', error);
            alert('Có lỗi xảy ra khi áp dụng mã giảm giá.');
        }
    };

    // Xóa voucher đã áp dụng
    const removeVoucher = (voucherId, shopId = null) => {
        if (shopId) {
            // Xóa voucher của shop
            setAppliedVouchers(prev => ({
                ...prev,
                shops: {
                    ...prev.shops,
                    [shopId]: prev.shops[shopId].filter(v => v.id !== voucherId)
                }
            }));
        } else {
            // Xóa voucher của sàn
            setAppliedVouchers(prev => ({
                ...prev,
                platform: prev.platform.filter(v => v.id !== voucherId)
            }));
        }
    };

    // Tính toán giá theo shop
    const calculateShopSubtotal = (shopItems) => {
        return shopItems.reduce((total, item) =>
            total + (item.product_id.price * item.quantity), 0);
    };

    // Tính giảm giá từ voucher shop
    const calculateShopDiscount = (shopId, subtotal) => {
        const shopVouchers = appliedVouchers.shops[shopId] || [];
        let discount = 0;

        // Tính tổng giảm giá từ các voucher của shop
        shopVouchers.forEach(voucher => {
            if (voucher.discount_type === 'PERCENTAGE') {
                discount += (subtotal * voucher.discount_value / 100);
            } else {
                discount += voucher.discount_value;
            }

            // Giới hạn giảm giá nếu có
            if (voucher.max_discount && discount > voucher.max_discount) {
                discount = voucher.max_discount;
            }
        });

        return discount;
    };

    // Tính giảm giá từ voucher sàn
    const calculatePlatformDiscount = (totalBeforeDiscount) => {
        const platformVouchers = appliedVouchers.platform || [];
        let discount = 0;

        // Tính giảm giá từ voucher sàn
        platformVouchers.forEach(voucher => {
            if (voucher.discount_type === 'PERCENTAGE') {
                discount += (totalBeforeDiscount * voucher.discount_value / 100);
            } else {
                discount += voucher.discount_value;
            }

            // Giới hạn giảm giá nếu có
            if (voucher.max_discount && discount > voucher.max_discount) {
                discount = voucher.max_discount;
            }
        });

        return discount;
    };

    // Định dạng giá tiền
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    // Tính tổng giá trị đơn hàng
    const calculateOrderTotal = () => {
        let totalBeforeDiscount = 0;
        let totalShopDiscount = 0;

        // Tính tổng giá trị và giảm giá theo từng shop
        Object.keys(cartByShop).forEach(shopId => {
            const shopSubtotal = calculateShopSubtotal(cartByShop[shopId].items);
            totalBeforeDiscount += shopSubtotal;
            totalShopDiscount += calculateShopDiscount(shopId, shopSubtotal);
        });

        // Tính giảm giá từ voucher sàn
        const platformDiscount = calculatePlatformDiscount(totalBeforeDiscount - totalShopDiscount);

        // Tổng tiền cuối cùng
        const finalTotal = totalBeforeDiscount - totalShopDiscount - platformDiscount + shipping;

        return {
            subtotal: totalBeforeDiscount,
            shopDiscount: totalShopDiscount,
            platformDiscount: platformDiscount,
            shipping: shipping,
            total: finalTotal
        };
    };

    const orderTotal = calculateOrderTotal();

    // Tính tổng số lượng sản phẩm
    const getTotalItemCount = () => {
        return Object.values(cartByShop).reduce(
            (count, shop) => count + shop.items.length, 0
        );
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="w-full mx-auto px-4 py-8">
                <div className="flex items-center mb-8">
                    <ShoppingBag className="text-indigo-600 mr-2" size={28} />
                    <h1 className="text-3xl font-bold text-gray-800">Giỏ hàng của bạn</h1>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Danh sách sản phẩm theo shop */}
                        <div className="md:w-2/3">
                            <div className="bg-white rounded-lg shadow-md p-6 mb-4">
                                <div className="flex justify-between items-center pb-4 border-b">
                                    <h2 className="text-xl font-semibold text-gray-800">
                                        Sản phẩm ({getTotalItemCount()})
                                    </h2>
                                    <button className="flex items-center text-indigo-600 hover:text-indigo-800 transition">
                                        <ChevronLeft size={16} className="mr-1" />
                                        <span>Tiếp tục mua sắm</span>
                                    </button>
                                </div>

                                {Object.keys(cartByShop).length === 0 ? (
                                    <div className="text-center py-12">
                                        <ShoppingBag className="mx-auto text-gray-300 mb-4" size={64} />
                                        <p className="text-gray-500 mb-4">Giỏ hàng của bạn đang trống</p>
                                        <button className="bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 transition">
                                            Mua sắm ngay
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        {Object.keys(cartByShop).map(shopId => {
                                            const shop = cartByShop[shopId];
                                            const shopSubtotal = calculateShopSubtotal(shop.items);
                                            const shopDiscount = calculateShopDiscount(shopId, shopSubtotal);

                                            return (
                                                <div key={shopId} className="mb-8 border-b pb-4">
                                                    <div className="flex items-center py-3">
                                                        {shop.shopInfo.logo && (
                                                            <img
                                                                src={shop.shopInfo.logo}
                                                                alt={shop.shopInfo.name}
                                                                className="w-8 h-8 rounded-full mr-2 object-cover"
                                                            />
                                                        )}
                                                        <h3 className="text-lg font-semibold flex-1">
                                                            {shop.shopInfo.name}
                                                        </h3>
                                                        <div className="text-gray-500 text-sm">
                                                            {shop.items.length} sản phẩm
                                                        </div>
                                                    </div>

                                                    {/* Danh sách sản phẩm của shop */}
                                                    <ul className="divide-y divide-gray-200">
                                                        {shop.items.map((item) => (
                                                            <li key={item._id} className="py-6 flex flex-col sm:flex-row">
                                                                <div className="flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden w-24 h-24">
                                                                    <img
                                                                        src={item.product_id.main_image}
                                                                        alt={item.product_id.name}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                </div>
                                                                <div className="sm:ml-6 flex-1 flex flex-col sm:flex-row sm:justify-between mt-4 sm:mt-0">
                                                                    <div>
                                                                        <h3 className="text-lg font-medium text-gray-800">
                                                                            {item.product_id.name}
                                                                        </h3>
                                                                        {item.product_id?.colors && (
                                                                            <p className="mt-1 text-sm text-gray-500">
                                                                                Màu: {item.product_id.colors[0]?.split(',')[0]}
                                                                            </p>
                                                                        )}
                                                                        {item.product_id?.dimensions && (
                                                                            <p className="mt-1 text-sm text-gray-500">
                                                                                Kích thước: {item.product_id.dimensions.length}
                                                                                {item.product_id.dimensions.width &&
                                                                                    ` x ${item.product_id.dimensions.width}`}
                                                                                {item.product_id.dimensions.height &&
                                                                                    ` x ${item.product_id.dimensions.height}`}
                                                                            </p>
                                                                        )}
                                                                        <p className="mt-1 text-lg font-semibold text-indigo-600">
                                                                            {formatPrice(item.product_id.price)}
                                                                        </p>
                                                                        {item.product_id.original_price > item.product_id.price && (
                                                                            <p className="text-sm text-gray-500 line-through">
                                                                                {formatPrice(item.product_id.original_price)}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center mt-4 sm:mt-0">
                                                                        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                                                            <button
                                                                                onClick={() => updateQuantity(shopId, item._id, -1)}
                                                                                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition"
                                                                            >
                                                                                <Minus size={16} />
                                                                            </button>
                                                                            <span className="px-4 py-1 text-center w-10">
                                                                                {item.quantity}
                                                                            </span>
                                                                            <button
                                                                                onClick={() => updateQuantity(shopId, item._id, 1)}
                                                                                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition"
                                                                            >
                                                                                <Plus size={16} />
                                                                            </button>
                                                                        </div>
                                                                        <button
                                                                            onClick={() => removeItem(shopId, item._id)}
                                                                            className="ml-4 text-red-500 hover:text-red-700 transition"
                                                                        >
                                                                            <Trash2 size={20} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>

                                                    {/* Các voucher của shop */}
                                                    <div className="bg-gray-50 p-4 rounded-lg mt-4">
                                                        <h4 className="font-medium text-gray-700 mb-2">
                                                            Voucher của shop
                                                        </h4>

                                                        {appliedVouchers.shops[shopId] &&
                                                            appliedVouchers.shops[shopId].length > 0 ? (
                                                            <div className="space-y-2">
                                                                {appliedVouchers.shops[shopId].map(voucher => (
                                                                    <div key={voucher.id} className="flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded-md p-2">
                                                                        <div className="flex items-center">
                                                                            <Tag size={16} className="text-indigo-600 mr-2" />
                                                                            <span className="text-sm">
                                                                                {voucher.discount_type === 'PERCENTAGE'
                                                                                    ? `Giảm ${voucher.discount_value}%`
                                                                                    : `Giảm ${formatPrice(voucher.discount_value)}`}
                                                                                {voucher.max_discount &&
                                                                                    ` (tối đa ${formatPrice(voucher.max_discount)})`}
                                                                            </span>
                                                                        </div>
                                                                        <button
                                                                            onClick={() => removeVoucher(voucher.id, shopId)}
                                                                            className="text-red-500 hover:text-red-700"
                                                                        >
                                                                            <Trash2 size={16} />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm text-gray-500">
                                                                Chưa có voucher nào được áp dụng cho shop này
                                                            </p>
                                                        )}

                                                        {/* Tổng giá shop */}
                                                        <div className="mt-4 flex justify-between text-sm">
                                                            <span>Tạm tính:</span>
                                                            <span>{formatPrice(shopSubtotal)}</span>
                                                        </div>
                                                        {shopDiscount > 0 && (
                                                            <div className="flex justify-between text-sm text-indigo-600">
                                                                <span>Giảm giá:</span>
                                                                <span>-{formatPrice(shopDiscount)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tổng kết đơn hàng */}
                        <div className="md:w-1/3">
                            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                                <h2 className="text-xl font-semibold text-gray-800 mb-6">Thông tin đơn hàng</h2>

                                {/* Form voucher */}
                                <div className="mb-6">
                                    <h3 className="font-medium text-gray-700 mb-2">Mã giảm giá</h3>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={voucherCode}
                                            onChange={(e) => setVoucherCode(e.target.value)}
                                            placeholder="Nhập mã giảm giá"
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                                        />
                                        <button
                                            onClick={applyVoucher}
                                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                                        >
                                            Áp dụng
                                        </button>
                                    </div>
                                </div>

                                {/* Voucher sàn đã áp dụng */}
                                {appliedVouchers.platform.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="font-medium text-gray-700 mb-2">Voucher sàn đã áp dụng</h3>
                                        <div className="space-y-2">
                                            {appliedVouchers.platform.map(voucher => (
                                                <div key={voucher.id} className="flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded-md p-2">
                                                    <div className="flex items-center">
                                                        <Tag size={16} className="text-indigo-600 mr-2" />
                                                        <span className="text-sm">
                                                            {voucher.discount_type === 'PERCENTAGE'
                                                                ? `Giảm ${voucher.discount_value}% toàn đơn`
                                                                : `Giảm ${formatPrice(voucher.discount_value)} toàn đơn`}
                                                            {voucher.max_discount &&
                                                                ` (tối đa ${formatPrice(voucher.max_discount)})`}
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => removeVoucher(voucher.id)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tạm tính</span>
                                        <span className="font-medium">{formatPrice(orderTotal.subtotal)}</span>
                                    </div>

                                    {orderTotal.shopDiscount > 0 && (
                                        <div className="flex justify-between text-indigo-600">
                                            <span>Giảm giá từ shop</span>
                                            <span>-{formatPrice(orderTotal.shopDiscount)}</span>
                                        </div>
                                    )}

                                    {orderTotal.platformDiscount > 0 && (
                                        <div className="flex justify-between text-indigo-600">
                                            <span>Giảm giá từ sàn</span>
                                            <span>-{formatPrice(orderTotal.platformDiscount)}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Phí vận chuyển</span>
                                        <span className="font-medium">{formatPrice(orderTotal.shipping)}</span>
                                    </div>

                                    <div className="border-t pt-4 mt-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-semibold">Tổng cộng</span>
                                            <span className="text-2xl font-bold text-indigo-600">
                                                {formatPrice(orderTotal.total)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-1">Đã bao gồm VAT</p>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <button className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center">
                                        <CreditCard className="mr-2" size={20} />
                                        <span className="font-medium">Thanh toán ngay</span>
                                    </button>

                                    <div className="text-center text-sm text-gray-500 mt-4">
                                        <p>Chúng tôi chấp nhận thanh toán qua</p>
                                        <div className="flex justify-center space-x-2 mt-2">
                                            <div className="w-10 h-6 bg-blue-600 rounded"></div>
                                            <div className="w-10 h-6 bg-red-500 rounded"></div>
                                            <div className="w-10 h-6 bg-yellow-400 rounded"></div>
                                            <div className="w-10 h-6 bg-green-500 rounded"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}