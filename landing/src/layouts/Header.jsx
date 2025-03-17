// src/components/Header/Header.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Search, User, Menu, X } from 'lucide-react';

const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);

    // Handle scroll event to change header styling
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Toggle mobile menu
    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // Toggle search panel
    const toggleSearch = () => {
        setIsSearchOpen(!isSearchOpen);
    };

    const categories = [
        { name: 'New Arrivals', path: '/new-arrivals' },
        { name: 'Women', path: '/women' },
        { name: 'Men', path: '/men' },
        { name: 'Accessories', path: '/accessories' },
        { name: 'Sale', path: '/sale' },
    ];

    return (
        <header className={`sticky top-0 w-full z-50 bg-white transition-all duration-300 ${isScrolled ? 'shadow-md' : 'shadow-sm'}`}>
            {/* Top announcement bar */}
            <div className="bg-gray-900 text-white py-2">
                <div className="container mx-auto px-4 text-center text-sm">
                    Free shipping on orders over $50 | Express delivery available
                </div>
            </div>

            {/* Main header */}
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Mobile menu toggle */}
                    <button
                        className="lg:hidden flex items-center"
                        onClick={toggleMenu}
                        aria-label="Toggle menu"
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center">
                            <img src="/logo.svg" alt="Store Logo" className="h-10 w-auto mr-2" />
                            <span className="text-xl font-bold">ELEGANCE</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className={`hidden lg:block`}>
                        <ul className="flex space-x-8">
                            {categories.map((category, index) => (
                                <li key={index}>
                                    <Link
                                        to={category.path}
                                        className="text-gray-800 font-medium uppercase text-sm tracking-wider hover:text-amber-600 relative group"
                                    >
                                        {category.name}
                                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-600 transition-all duration-300 group-hover:w-full"></span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Action icons */}
                    <div className="flex items-center space-x-6">
                        <button
                            className="text-gray-700 hover:text-amber-600 transition-colors"
                            onClick={toggleSearch}
                            aria-label="Search"
                        >
                            <Search size={22} />
                        </button>

                        <Link to="/account" className="text-gray-700 hover:text-amber-600 transition-colors" aria-label="My Account">
                            <User size={22} />
                        </Link>

                        <Link to="/cart" className="text-gray-700 hover:text-amber-600 transition-colors relative" aria-label="Shopping Cart">
                            <ShoppingCart size={22} />
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-amber-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            <div className={`lg:hidden fixed inset-0 bg-white z-50 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
                <div className="flex justify-end p-4">
                    <button onClick={toggleMenu} className="text-gray-800" aria-label="Close menu">
                        <X size={24} />
                    </button>
                </div>
                <nav className="px-6 py-4">
                    <ul className="space-y-6">
                        {categories.map((category, index) => (
                            <li key={index}>
                                <Link
                                    to={category.path}
                                    className="text-gray-800 font-medium text-lg block py-2 border-b border-gray-200"
                                    onClick={toggleMenu}
                                >
                                    {category.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>

            {/* Search Panel */}
            <div className={`absolute inset-x-0 top-full bg-gray-100 px-4 py-4 shadow-md transition-all duration-300 ${isSearchOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                <div className="container mx-auto">
                    <form className="flex w-full">
                        <input
                            type="text"
                            placeholder="What are you looking for?"
                            className="flex-1 px-4 py-3 border-0 focus:ring-2 focus:ring-amber-600 outline-none"
                        />
                        <button
                            type="submit"
                            className="bg-amber-600 text-white px-6 flex items-center justify-center hover:bg-amber-700 transition-colors"
                            aria-label="Search"
                        >
                            <Search size={20} />
                        </button>
                    </form>
                </div>
            </div>
        </header>
    );
};

export default Header;