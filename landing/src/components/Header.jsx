import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Search, User } from 'lucide-react';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <ShoppingCart className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">ShopMart</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-primary font-medium">
              Trang chủ
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-primary font-medium">
              Sản phẩm
            </Link>
            <Link to="/sale" className="text-gray-700 hover:text-primary font-medium">
              Khuyến mãi
            </Link>
            <Link to="/new" className="text-gray-700 hover:text-primary font-medium">
              Mới về
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="search"
                placeholder="Tìm kiếm..."
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:border-primary"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            <button className="p-2 hover:text-primary">
              <Heart className="h-6 w-6" />
            </button>

            <button className="p-2 hover:text-primary relative">
              <ShoppingCart className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </button>

            <Link to="/login" className="bg-primary text-white px-6 py-2 rounded-full hover:bg-accent transition-colors">
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 