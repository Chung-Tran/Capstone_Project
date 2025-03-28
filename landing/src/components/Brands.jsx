import React from 'react';

const Brands = () => {
    const brands = [
        { id: 1, name: 'Apple', logo: '/images/apple.png' },
        { id: 2, name: 'Samsung', logo: '/images/samsung.png' },
        { id: 3, name: 'Sony', logo: '/images/sony.png' },
        { id: 4, name: 'LG', logo: '/images/lg.png' },
        { id: 5, name: 'Dell', logo: '/images/dell.png' },
        { id: 6, name: 'Asus', logo: '/images/asus.png' },
    ];

    return (
        <section className="py-12 bg-gray-50">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-8">
                    Thương hiệu nổi bật
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {brands.map(brand => (
                        <div
                            key={brand.id}
                            className="bg-white rounded-xl p-6 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
                        >
                            <img
                                src={brand.logo}
                                alt={brand.name}
                                className="h-12 object-contain grayscale hover:grayscale-0 transition-all"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Brands; 