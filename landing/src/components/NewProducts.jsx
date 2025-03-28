import React from 'react';
import { ChevronRight } from 'lucide-react';

const NewProducts = () => {
    const newProducts = [
        {
            id: 1,
            name: "MacBook Pro M3 Max",
            price: "69.990.000đ",
            image: "/images/macbook.jpg"
        },
        {
            id: 2,
            name: "iPad Pro M2 12.9 inch",
            price: "32.990.000đ",
            image: "/images/ipad.jpg"
        },
        // Thêm sản phẩm khác
    ];

    return (
        <section className="py-12">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold">Sản phẩm mới</h2>
                    <button className="flex items-center text-primary hover:text-accent">
                        Xem tất cả
                        <ChevronRight className="h-5 w-5 ml-1" />
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {newProducts.map(product => (
                        <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden group">
                            <div className="relative">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute top-2 left-2 bg-primary text-white px-2 py-1 rounded-full text-sm">
                                    Mới
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-medium mb-2 line-clamp-2">{product.name}</h3>
                                <div className="flex justify-between items-center">
                                    <span className="text-primary font-bold text-lg">{product.price}</span>
                                    <button className="bg-primary text-white px-4 py-2 rounded-full text-sm hover:bg-accent">
                                        Mua ngay
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default NewProducts; 