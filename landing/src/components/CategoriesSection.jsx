import React from 'react';
import { Phone, Laptop, Shirt, Home, Camera, Watch } from 'lucide-react';

const categories = [
    { icon: <Phone className="h-8 w-8" />, name: 'Điện thoại', color: 'bg-blue-100' },
    { icon: <Laptop className="h-8 w-8" />, name: 'Máy tính', color: 'bg-green-100' },
    { icon: <Shirt className="h-8 w-8" />, name: 'Thời trang', color: 'bg-purple-100' },
    { icon: <Home className="h-8 w-8" />, name: 'Đồ gia dụng', color: 'bg-yellow-100' },
    { icon: <Camera className="h-8 w-8" />, name: 'Máy ảnh', color: 'bg-red-100' },
    { icon: <Watch className="h-8 w-8" />, name: 'Đồng hồ', color: 'bg-pink-100' },
];

const CategoriesSection = () => {
    return (
        <section className="py-12 bg-gray-50">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-8">
                    Danh mục sản phẩm
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {categories.map((category, index) => (
                        <div
                            key={index}
                            className={`${category.color} rounded-xl p-6 text-center cursor-pointer hover:shadow-lg transition-shadow`}
                        >
                            <div className="flex justify-center mb-4">
                                {category.icon}
                            </div>
                            <h3 className="font-medium">{category.name}</h3>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CategoriesSection; 