import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    // Mock data
    const featuredProducts = [
        {
            id: 1,
            name: 'Product 1',
            price: 99.99,
            image: 'https://via.placeholder.com/300',
        },
        {
            id: 2,
            name: 'Product 2',
            price: 149.99,
            image: 'https://via.placeholder.com/300',
        },
        {
            id: 3,
            name: 'Product 3',
            price: 199.99,
            image: 'https://via.placeholder.com/300',
        },
    ];

    const categories = [
        {
            id: 1,
            name: 'Electronics',
            image: 'https://via.placeholder.com/200',
        },
        {
            id: 2,
            name: 'Fashion',
            image: 'https://via.placeholder.com/200',
        },
        {
            id: 3,
            name: 'Home & Living',
            image: 'https://via.placeholder.com/200',
        },
    ];

    return (
        <div>
            {/* Hero Section */}
            <section className="bg-gray-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="text-center">
                        <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl">
                            Welcome to E-Commerce
                        </h1>
                        <p className="mt-6 text-xl text-gray-300">
                            Your one-stop shop for all your shopping needs
                        </p>
                        <div className="mt-10">
                            <Link
                                to="/products"
                                className="bg-white text-gray-900 px-8 py-3 rounded-md font-medium hover:bg-gray-100"
                            >
                                Shop Now
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Products</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {featuredProducts.map((product) => (
                            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                                    <p className="mt-2 text-gray-600">${product.price}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="bg-gray-50 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8">Shop by Category</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {categories.map((category) => (
                            <Link
                                key={category.id}
                                to={`/category/${category.id}`}
                                className="group relative overflow-hidden rounded-lg"
                            >
                                <img
                                    src={category.image}
                                    alt={category.name}
                                    className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                                    <h3 className="text-white text-2xl font-bold">{category.name}</h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gray-900 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold mb-4">Want to sell your products?</h2>
                    <p className="text-xl text-gray-300 mb-8">
                        Join our platform and start selling to millions of customers
                    </p>
                    <Link
                        to="/register"
                        className="bg-white text-gray-900 px-8 py-3 rounded-md font-medium hover:bg-gray-100"
                    >
                        Become a Seller
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home; 