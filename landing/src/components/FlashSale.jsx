import React from 'react';
import { Timer, ChevronRight } from 'lucide-react';

const FlashSale = () => {
    const flashSaleProducts = [
        {
            id: 1,
            name: "iPhone 15 Pro Max 256GB",
            price: "29.990.000đ",
            originalPrice: "32.990.000đ",
            discount: 30,
            sold: 80,
            image: "/images/iphone.jpg"
        },
        {
            id: 2,
            name: "Samsung Galaxy S24 Ultra",
            price: "28.990.000đ",
            originalPrice: "31.990.000đ",
            discount: 25,
            sold: 65,
            image: "/images/samsung.jpg"
        },
        // Thêm sản phẩm khác
    ];

    return (
        <section className="py-12 bg-red-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <h2 className="text-3xl font-bold text-primary">Flash Sale</h2>
                        <div className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full">
                            <Timer className="h-5 w-5" />
                            <span className="font-medium">05:23:45</span>
                        </div>
                    </div>
                    <button className="flex items-center text-primary hover:text-accent">
                        Xem tất cả
                        <ChevronRight className="h-5 w-5 ml-1" />
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {flashSaleProducts.map(product => (
                        <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="relative">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm">
                                    -{product.discount}%
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-medium mb-2 line-clamp-2">{product.name}</h3>
                                <div className="mb-2">
                                    <span className="text-primary font-bold text-lg">{product.price}</span>
                                    <span className="text-gray-400 line-through text-sm ml-2">
                                        {product.originalPrice}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-primary h-2 rounded-full"
                                        style={{ width: `${product.sold}%` }}
                                    ></div>
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                    Đã bán {product.sold}%
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FlashSale; 