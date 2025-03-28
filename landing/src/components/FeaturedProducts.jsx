import React from 'react';
import { Heart } from 'lucide-react';

const ProductCard = ({ product }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="relative">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                />
                <button className="absolute top-2 right-2 p-2 bg-white rounded-full hover:text-primary">
                    <Heart className="h-5 w-5" />
                </button>
            </div>
            <div className="p-4">
                <h3 className="font-medium mb-2 line-clamp-2">{product.name}</h3>
                <div className="flex justify-between items-center">
                    <div>
                        <span className="text-primary font-bold text-lg">{product.price}</span>
                        {product.originalPrice && (
                            <span className="text-gray-400 line-through text-sm ml-2">
                                {product.originalPrice}
                            </span>
                        )}
                    </div>
                    <button className="bg-primary text-white px-4 py-2 rounded-full text-sm hover:bg-accent">
                        Thêm vào giỏ
                    </button>
                </div>
            </div>
        </div>
    );
};

const FeaturedProducts = () => {
    // Mock data
    const products = [
        {
            id: 1,
            name: "iPhone 15 Pro Max 256GB",
            price: "29.990.000đ",
            originalPrice: "32.990.000đ",
            image: "/images/iphone.jpg"
        },
        // Thêm sản phẩm khác
    ];

    return (
        <section className="py-12">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-8">
                    Sản phẩm nổi bật
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {products.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturedProducts; 