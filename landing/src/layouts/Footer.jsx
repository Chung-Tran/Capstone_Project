// src/components/Footer/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-gray-300">
            {/* Footer Top */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                    {/* Brand Column */}
                    <div className="lg:col-span-2">
                        <div className="mb-6">
                            <Link to="/" className="flex items-center">
                                <img src="/logo.svg" alt="Store Logo" className="h-8 w-auto mr-2 brightness-0 invert" />
                                <span className="text-xl font-bold text-white">ELEGANCE</span>
                            </Link>
                        </div>
                        <p className="text-gray-400 mb-6">
                            Discover the latest trends in fashion with our curated collection of
                            high-quality apparel and accessories. Your style journey begins here.
                        </p>
                        <div className="flex space-x-4">
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-amber-600 transition-colors" aria-label="Facebook">
                                <Facebook size={18} />
                            </a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-amber-600 transition-colors" aria-label="Instagram">
                                <Instagram size={18} />
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-amber-600 transition-colors" aria-label="Twitter">
                                <Twitter size={18} />
                            </a>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-amber-600 transition-colors" aria-label="LinkedIn">
                                <Linkedin size={18} />
                            </a>
                        </div>
                    </div>

                    {/* Shop Links */}
                    <div>
                        <h4 className="text-white text-lg font-medium mb-4 relative pb-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-10 after:bg-amber-600">Shop</h4>
                        <ul className="space-y-3">
                            <li><Link to="/new-arrivals" className="hover:text-amber-500 hover:translate-x-1 inline-block transition-all">New Arrivals</Link></li>
                            <li><Link to="/women" className="hover:text-amber-500 hover:translate-x-1 inline-block transition-all">Women</Link></li>
                            <li><Link to="/men" className="hover:text-amber-500 hover:translate-x-1 inline-block transition-all">Men</Link></li>
                            <li><Link to="/accessories" className="hover:text-amber-500 hover:translate-x-1 inline-block transition-all">Accessories</Link></li>
                            <li><Link to="/sale" className="hover:text-amber-500 hover:translate-x-1 inline-block transition-all">Sale</Link></li>
                        </ul>
                    </div>

                    {/* Help Links */}
                    <div>
                        <h4 className="text-white text-lg font-medium mb-4 relative pb-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-10 after:bg-amber-600">Help</h4>
                        <ul className="space-y-3">
                            <li><Link to="/customer-service" className="hover:text-amber-500 hover:translate-x-1 inline-block transition-all">Customer Service</Link></li>
                            <li><Link to="/track-order" className="hover:text-amber-500 hover:translate-x-1 inline-block transition-all">Track Your Order</Link></li>
                            <li><Link to="/shipping" className="hover:text-amber-500 hover:translate-x-1 inline-block transition-all">Shipping & Delivery</Link></li>
                            <li><Link to="/returns" className="hover:text-amber-500 hover:translate-x-1 inline-block transition-all">Returns & Exchanges</Link></li>
                            <li><Link to="/faq" className="hover:text-amber-500 hover:translate-x-1 inline-block transition-all">FAQ</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter Column */}
                    <div className="lg:col-span-1">
                        <h4 className="text-white text-lg font-medium mb-4 relative pb-2 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-0.5 after:w-10 after:bg-amber-600">Stay Updated</h4>
                        <p className="text-gray-400 mb-4">Subscribe to our newsletter to receive updates and exclusive offers.</p>
                        <form className="mb-6">
                            <div className="flex">
                                <input
                                    type="email"
                                    placeholder="Your email address"
                                    className="bg-gray-800 text-white px-4 py-2 w-full focus:outline-none focus:ring-1 focus:ring-amber-600"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="bg-amber-600 text-white px-4 py-2 font-medium hover:bg-amber-700 transition-colors"
                                >
                                    Subscribe
                                </button>
                            </div>
                        </form>
                        <div>
                            <p className="text-gray-400 mb-2">We accept:</p>
                            <div className="flex space-x-4">
                                <div className="w-10 h-6 bg-gray-800 rounded flex items-center justify-center text-white text-xs">VISA</div>
                                <div className="w-10 h-6 bg-gray-800 rounded flex items-center justify-center text-white text-xs">MC</div>
                                <div className="w-10 h-6 bg-gray-800 rounded flex items-center justify-center text-white text-xs">AMEX</div>
                                <div className="w-10 h-6 bg-gray-800 rounded flex items-center justify-center text-white text-xs">PYPL</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Bottom */}
            <div className="bg-gray-950 py-6">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row md:justify-between items-center">
                        <div className="mb-4 md:mb-0">
                            <p className="text-gray-500 text-sm">
                                &copy; {currentYear} ELEGANCE. All rights reserved.
                            </p>
                        </div>
                        <div className="flex space-x-6">
                            <Link to="/privacy-policy" className="text-gray-500 text-sm hover:text-amber-500 transition-colors">Privacy Policy</Link>
                            <Link to="/terms" className="text-gray-500 text-sm hover:text-amber-500 transition-colors">Terms of Service</Link>
                            <Link to="/accessibility" className="text-gray-500 text-sm hover:text-amber-500 transition-colors">Accessibility</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;