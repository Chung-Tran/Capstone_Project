import { useEffect, useState } from 'react';
import { Trash2, Plus, Minus, ShoppingBag, ChevronLeft, CreditCard } from 'lucide-react';
import customerItemsService from '../services/customerItems.service';
import orderService from '../services/order.service';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../utils/useLoading';
import { usePaymentPolling } from '../utils/paymentPoling';
import { showToast } from '../utils/toast';
import { set } from 'lodash';
import PaymentResult from '../components/payment/PaymentResult';

// Shop Items Component (optimized)
const ShopItems = ({ shop, shopId, updateQuantity, removeItem, formatPrice, calculateShopSubtotal }) => {
    const shopSubtotal = calculateShopSubtotal(shop.items);

    return (
        <div className="mb-8 border-b pb-4">
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
                                        onClick={() => updateQuantity(shopId, item.product_id._id, item.quantity - 1)}
                                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition"
                                        disabled={item.quantity <= 1}
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <span className="px-4 py-1 text-center w-10">
                                        {item.quantity}
                                    </span>
                                    <button
                                        onClick={() => updateQuantity(shopId, item.product_id._id, item.quantity + 1)}
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

            {/* Tổng giá shop */}
            <div className="mt-4 flex justify-between text-sm">
                <span>Tạm tính:</span>
                <span>{formatPrice(shopSubtotal)}</span>
            </div>
        </div>
    );
};

export default function ShoppingCart() {
    const { setLoading } = useLoading();
    const [cartByShop, setCartByShop] = useState({});
    const [shipping, setShipping] = useState(30000);
    const [receiverName, setReceiverName] = useState("");
    const [receiverPhone, setReceiverPhone] = useState("");
    const [address, setAddress] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("cod");
    const [shippingMethod, setShippingMethod] = useState("standard");
    const navigate = useNavigate();
    const [paymentData, setPaymentData] = useState(null);
    const { handlePayment } = usePaymentPolling(
        (data) => {
            setPaymentData(data);
            setLoading(false);
        }, (error) => {
            setPaymentData(error);
            setLoading(false);
        })
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
            }
        } catch (error) {
            console.error('Lỗi khi lấy giỏ hàng:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (shopId, productId, newQuantity) => {
        if (newQuantity < 1) return;

        setCartByShop(prev => {
            const shopItems = [...prev[shopId].items];
            const itemIndex = shopItems.findIndex(item => item.product_id._id === productId);

            if (itemIndex !== -1) {
                const updatedItem = {
                    ...shopItems[itemIndex],
                    quantity: newQuantity
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

        try {
            // Find the actual cart item ID
            const cartItem = cartByShop[shopId].items.find(item => item.product_id._id === productId);
            if (cartItem) {
                await customerItemsService.updateCartItemQuantity(productId, { quantity: newQuantity });
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật số lượng:', error);
            fetchData();
        }
    };

    const removeItem = async (shopId, itemId) => {
        setCartByShop(prev => {
            const updatedItems = prev[shopId].items.filter(item => item._id !== itemId);

            if (updatedItems.length === 0) {
                const { [shopId]: removedShop, ...rest } = prev;
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

        try {
            await customerItemsService.remove_from_cart(itemId);
        } catch (error) {
            console.error('Lỗi khi xóa sản phẩm:', error);
            fetchData();
        }
    };

    const calculateShopSubtotal = (shopItems) => {
        return shopItems.reduce((total, item) =>
            total + (item.product_id.price * item.quantity), 0);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const calculateOrderTotal = () => {
        let totalBeforeDiscount = 0;

        Object.keys(cartByShop).forEach(shopId => {
            const shopSubtotal = calculateShopSubtotal(cartByShop[shopId].items);
            totalBeforeDiscount += shopSubtotal;
        });

        // const finalTotal = totalBeforeDiscount + shipping;
        const finalTotal = totalBeforeDiscount;

        return {
            subtotal: totalBeforeDiscount,
            shipping: shipping,
            total: finalTotal
        };
    };

    const orderTotal = calculateOrderTotal();

    const getTotalItemCount = () => {
        return Object.values(cartByShop).reduce(
            (count, shop) => count + shop.items.length, 0
        );
    };
    const createOrder = async () => {
        try {
            setLoading(true);
            const orderData = {
                // cartItems: cartByShop, //data da group theo shop
                shipping: shipping,
                total: orderTotal.total,
                items: [],
                receiverName: receiverName,
                receiverPhone: receiverPhone,
                address: address,
                paymentMethod: paymentMethod,
                shippingMethod: shippingMethod,
                note: "",
            };

            Object.keys(cartByShop).forEach(shopId => {
                cartByShop[shopId].items.forEach(item => {
                    orderData.items.push(item);
                });
            });

            const response = await orderService.create_order(orderData);
            if (response.isSuccess) {
                if (paymentMethod === 'online') {
                    const paymentData = {
                        orderId: response.data._id,
                        amount: orderTotal.total,
                    }
                    handlePayment(paymentData);
                } else if (paymentMethod === 'cod') {
                    showToast.success('Đặt hàng thành công. Vui lòng kiểm tra lại thông tin đơn hàng.');
                    setLoading(false);
                    navigate('/');
                } else if (paymentMethod === 'deposit') {
                    //todo: handle deposit payment
                    showToast.success('Chưa hỗ trợ thanh toán đặt cọc.');
                }
            } else {
                alert('Đặt hàng thất bại. Vui lòng thử lại.');
            }
            // navigate('/')
        } catch (error) {
            console.error('Lỗi khi tạo đơn hàng:', error);
            setLoading(false);
        }
    }
    if (paymentData != null) {
        return (
            <div className="bg-gray-50 min-h-screen">
                <div className="w-full mx-auto px-4 py-8">
                    <PaymentResult paymentData={paymentData} />
                </div>
            </div>
        );
    }
    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="w-full mx-auto px-4 py-8">
                <div className="flex items-center mb-8">
                    <ShoppingBag className="text-indigo-600 mr-2" size={28} />
                    <h1 className="text-3xl font-bold text-gray-800">Giỏ hàng của bạn</h1>
                </div>

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
                                    {Object.keys(cartByShop).map(shopId => (
                                        <ShopItems
                                            key={shopId}
                                            shop={cartByShop[shopId]}
                                            shopId={shopId}
                                            updateQuantity={updateQuantity}
                                            removeItem={removeItem}
                                            formatPrice={formatPrice}
                                            calculateShopSubtotal={calculateShopSubtotal}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tổng kết đơn hàng */}
                    <div className="md:w-1/3">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-4 space-y-6">
                            <h2 className="text-xl font-semibold text-gray-800">Thông tin giao hàng</h2>

                            {/* Tên người nhận */}
                            <div>
                                <label className="block text-gray-700 mb-1">Tên người nhận</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none"
                                    value={receiverName}
                                    onChange={(e) => setReceiverName(e.target.value)}
                                />
                            </div>

                            {/* Số điện thoại */}
                            <div>
                                <label className="block text-gray-700 mb-1">Số điện thoại</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none"
                                    value={receiverPhone}
                                    onChange={(e) => setReceiverPhone(e.target.value)}
                                />
                            </div>

                            {/* Địa chỉ giao hàng */}
                            <div>
                                <label className="block text-gray-700 mb-1">Địa chỉ giao hàng</label>
                                <textarea
                                    className="w-full border rounded-lg px-3 py-2 resize-none focus:outline-none"
                                    rows={3}
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                            </div>

                            {/* Phương thức thanh toán */}
                            <div>
                                <label className="block text-gray-700 mb-1">Phương thức thanh toán</label>
                                <select
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none"
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                >
                                    <option value="cod">Thanh toán khi nhận hàng</option>
                                    <option value="online">Thanh toán trực tuyến</option>
                                    <option value="deposit">Thanh toán trước 1 khoản</option>
                                </select>
                            </div>

                            {/* Phương thức vận chuyển */}
                            <div>
                                <label className="block text-gray-700 mb-1">Phương thức vận chuyển</label>
                                <select
                                    className="w-full border rounded-lg px-3 py-2 focus:outline-none"
                                    value={shippingMethod}
                                    onChange={(e) => setShippingMethod(e.target.value)}
                                >
                                    <option value="standard">Giao hàng tiêu chuẩn</option>
                                    <option value="express" disabled>Giao hàng nhanh - express</option>
                                </select>
                            </div>

                            {/* Tổng kết đơn hàng */}
                            <div className="pt-4 border-t">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Thông tin đơn hàng</h2>
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tạm tính</span>
                                        <span className="font-medium">{formatPrice(orderTotal.subtotal)}</span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Phí vận chuyển</span>
                                        <span className="font-medium text-green-600">Miễn phí</span>
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

                                <div className="mt-6">
                                    <button
                                        className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center"
                                        onClick={createOrder}
                                    >
                                        <CreditCard className="mr-2" size={20} />
                                        Thanh toán ngay
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}