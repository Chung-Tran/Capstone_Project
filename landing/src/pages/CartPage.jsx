import { useState } from 'react';
import { Trash2, Plus, Minus, ShoppingBag, ChevronLeft, CreditCard } from 'lucide-react';

export default function ShoppingCart() {
    const [cartItems, setCartItems] = useState([
        {
            id: 1,
            name: "Áo Thun Trắng Premium",
            price: 299000,
            image: "/api/placeholder/120/120",
            quantity: 2,
            color: "Trắng",
            size: "L"
        },
        {
            id: 2,
            name: "Quần Jeans Slim Fit",
            price: 699000,
            image: "/api/placeholder/120/120",
            quantity: 1,
            color: "Xanh đậm",
            size: "32"
        },
        {
            id: 3,
            name: "Giày Sneaker Classic",
            price: 1250000,
            image: "/api/placeholder/120/120",
            quantity: 1,
            color: "Đen",
            size: "42"
        }
    ]);

    const updateQuantity = (id, change) => {
        setCartItems(cartItems.map(item => {
            if (item.id === id) {
                const newQuantity = Math.max(1, item.quantity + change);
                return { ...item, quantity: newQuantity };
            }
            return item;
        }));
    };

    const removeItem = (id) => {
        setCartItems(cartItems.filter(item => item.id !== id));
    };

    const calculateSubtotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const subtotal = calculateSubtotal();
    const shipping = 30000;
    const discount = 150000;
    const total = subtotal + shipping - discount;

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="w-full mx-auto px-4 py-8">
                <div className="flex items-center mb-8">
                    <ShoppingBag className="text-indigo-600 mr-2" size={28} />
                    <h1 className="text-3xl font-bold text-gray-800">Giỏ hàng của bạn</h1>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Danh sách sản phẩm */}
                    <div className="md:w-2/3">
                        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
                            <div className="flex justify-between items-center pb-4 border-b">
                                <h2 className="text-xl font-semibold text-gray-800">Sản phẩm ({cartItems.length})</h2>
                                <button className="flex items-center text-indigo-600 hover:text-indigo-800 transition">
                                    <ChevronLeft size={16} className="mr-1" />
                                    <span>Tiếp tục mua sắm</span>
                                </button>
                            </div>

                            {cartItems.length === 0 ? (
                                <div className="text-center py-12">
                                    <ShoppingBag className="mx-auto text-gray-300 mb-4" size={64} />
                                    <p className="text-gray-500 mb-4">Giỏ hàng của bạn đang trống</p>
                                    <button className="bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 transition">
                                        Mua sắm ngay
                                    </button>
                                </div>
                            ) : (
                                <ul className="divide-y divide-gray-200">
                                    {cartItems.map((item) => (
                                        <li key={item.id} className="py-6 flex flex-col sm:flex-row">
                                            <div className="flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden w-24 h-24">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="sm:ml-6 flex-1 flex flex-col sm:flex-row sm:justify-between mt-4 sm:mt-0">
                                                <div>
                                                    <h3 className="text-lg font-medium text-gray-800">{item.name}</h3>
                                                    <p className="mt-1 text-sm text-gray-500">Màu: {item.color}</p>
                                                    <p className="mt-1 text-sm text-gray-500">Kích thước: {item.size}</p>
                                                    <p className="mt-1 text-lg font-semibold text-indigo-600">{formatPrice(item.price)}</p>
                                                </div>
                                                <div className="flex items-center mt-4 sm:mt-0">
                                                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, -1)}
                                                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition"
                                                        >
                                                            <Minus size={16} />
                                                        </button>
                                                        <span className="px-4 py-1 text-center w-10">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, 1)}
                                                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 transition"
                                                        >
                                                            <Plus size={16} />
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        className="ml-4 text-red-500 hover:text-red-700 transition"
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Tổng kết đơn hàng */}
                    <div className="md:w-1/3">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                            <h2 className="text-xl font-semibold text-gray-800 mb-6">Thông tin đơn hàng</h2>

                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tạm tính</span>
                                    <span className="font-medium">{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Phí vận chuyển</span>
                                    <span className="font-medium">{formatPrice(shipping)}</span>
                                </div>
                                <div className="flex justify-between text-indigo-600">
                                    <span>Giảm giá</span>
                                    <span>-{formatPrice(discount)}</span>
                                </div>
                                <div className="border-t pt-4 mt-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-semibold">Tổng cộng</span>
                                        <span className="text-2xl font-bold text-indigo-600">{formatPrice(total)}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">Đã bao gồm VAT</p>
                                </div>
                            </div>

                            <div className="mt-8 space-y-4">
                                <input
                                    type="text"
                                    placeholder="Nhập mã giảm giá"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                                />

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
            </div>
        </div>
    );
}