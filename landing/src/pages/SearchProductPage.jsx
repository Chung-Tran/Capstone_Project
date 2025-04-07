import React, { useState, useEffect } from 'react';
import {
    Search,
    SlidersHorizontal,
    X,
    ChevronDown,
    ChevronUp,
    Grid,
    List,
    Star,
    ArrowDownUp,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import ProductCardItem from '../components/product/ProductCard';

const SearchProductPage = () => {
    // Query state
    const [searchQuery, setSearchQuery] = useState('điện thoại samsung');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [sortOption, setSortOption] = useState('relevance');
    const [isSortOpen, setIsSortOpen] = useState(false);

    // Price range
    const [priceRange, setPriceRange] = useState([0, 50000000]);
    const [selectedPriceRange, setSelectedPriceRange] = useState([]);

    // Category filters
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [expandedCategories, setExpandedCategories] = useState({
        brands: false,
        features: false,
        ratings: false,
        shopTypes: false
    });

    // Sample product data
    const products = Array(24).fill().map((_, i) => ({
        id: `search-result-${i + 1}`,
        name: `Samsung Galaxy ${['S23', 'A54', 'Z Fold 5', 'Note 20', 'S22 Ultra'][i % 5]} ${i % 2 === 0 ? '256GB' : '128GB'} ${['Đen', 'Trắng', 'Xanh', 'Tím'][i % 4]}`,
        price: 5000000 + (i * 1000000 % 25000000),
        originalPrice: 6000000 + (i * 1000000 % 25000000),
        discount: 10 + (i % 20),
        rating: 3.5 + (Math.random() * 1.5),
        reviewCount: 20 + Math.floor(Math.random() * 500),
        image: "/api/placeholder/400/400",
        images: ["/api/placeholder/400/400", "/api/placeholder/400/400"],
        isAd: i % 10 === 0,
        badges: i % 5 === 0 ? ['Giảm sốc'] : i % 7 === 0 ? ['Freeship'] : [],
        stockStatus: i % 15 === 0 ? 'Hết hàng' : 'Còn hàng',
        shopType: i % 6 === 0 ? 'shopMall' : 'official',
        soldCount: 50 + Math.floor(Math.random() * 500),
        freeShipping: i % 3 === 0
    }));

    // Filter data
    const filterOptions = {
        categories: [
            { id: 'dien-thoai', name: 'Điện thoại', count: 356 },
            { id: 'phu-kien', name: 'Phụ kiện điện thoại', count: 1245 },
            { id: 'may-tinh-bang', name: 'Máy tính bảng', count: 124 },
            { id: 'dong-ho-thong-minh', name: 'Đồng hồ thông minh', count: 89 },
            { id: 'tai-nghe', name: 'Tai nghe', count: 432 },
        ],
        brands: [
            { id: 'samsung', name: 'Samsung', count: 356 },
            { id: 'apple', name: 'Apple', count: 243 },
            { id: 'xiaomi', name: 'Xiaomi', count: 198 },
            { id: 'oppo', name: 'OPPO', count: 145 },
            { id: 'vivo', name: 'Vivo', count: 98 },
            { id: 'nokia', name: 'Nokia', count: 76 },
            { id: 'realme', name: 'Realme', count: 67 },
        ],
        features: [
            { id: '5g', name: 'Hỗ trợ 5G', count: 242 },
            { id: 'ram-8gb', name: 'RAM 8GB trở lên', count: 189 },
            { id: 'ram-6gb', name: 'RAM 6GB trở lên', count: 298 },
            { id: 'rom-256gb', name: 'Bộ nhớ 256GB trở lên', count: 143 },
            { id: 'camera-48mp', name: 'Camera 48MP trở lên', count: 176 },
        ],
        ratings: [
            { id: '5star', name: '5 sao', count: 156 },
            { id: '4star', name: '4 sao trở lên', count: 302 },
            { id: '3star', name: '3 sao trở lên', count: 356 },
        ],
        shopTypes: [
            { id: 'official', name: 'Shop chính hãng', count: 127 },
            { id: 'shopMall', name: 'Shop Mall', count: 89 },
            { id: 'favorite', name: 'Shop yêu thích', count: 245 },
        ],
        priceRanges: [
            { id: '0-2m', name: 'Dưới 2 triệu', min: 0, max: 2000000 },
            { id: '2m-5m', name: '2 - 5 triệu', min: 2000000, max: 5000000 },
            { id: '5m-10m', name: '5 - 10 triệu', min: 5000000, max: 10000000 },
            { id: '10m-20m', name: '10 - 20 triệu', min: 10000000, max: 20000000 },
            { id: '20m-up', name: 'Trên 20 triệu', min: 20000000, max: 1000000000 },
        ]
    };

    // Sort options
    const sortOptions = [
        { id: 'relevance', name: 'Liên quan' },
        { id: 'newest', name: 'Mới nhất' },
        { id: 'bestSeller', name: 'Bán chạy' },
        { id: 'priceAsc', name: 'Giá tăng dần' },
        { id: 'priceDesc', name: 'Giá giảm dần' },
        { id: 'rating', name: 'Đánh giá cao' },
    ];

    // Toggle category expansion
    const toggleCategory = (category) => {
        setExpandedCategories({
            ...expandedCategories,
            [category]: !expandedCategories[category]
        });
    };

    // Toggle category selection
    const toggleCategorySelection = (id) => {
        if (selectedCategories.includes(id)) {
            setSelectedCategories(selectedCategories.filter(item => item !== id));
        } else {
            setSelectedCategories([...selectedCategories, id]);
        }
    };

    // Handle price range selection
    const handlePriceRangeSelection = (range) => {
        if (selectedPriceRange.length === 2 &&
            selectedPriceRange[0] === range.min &&
            selectedPriceRange[1] === range.max) {
            setSelectedPriceRange([]);
        } else {
            setSelectedPriceRange([range.min, range.max]);
        }
    };

    // Clear all filters
    const clearAllFilters = () => {
        setSelectedCategories([]);
        setSelectedPriceRange([]);
    };

    // Reset search query
    const resetSearch = () => {
        setSearchQuery('');
    };

    // Format currency
    const formatCurrency = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    };

    // Count active filters
    const activeFiltersCount = selectedCategories.length + (selectedPriceRange.length > 0 ? 1 : 0);

    // Render stars for rating
    const renderStars = (rating) => {
        return Array(5).fill().map((_, i) => (
            <Star
                key={i}
                size={14}
                className={i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" :
                    (i < rating ? "fill-yellow-400 text-yellow-400 opacity-50" : "text-gray-300")}
            />
        ));
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            {/* Search header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-12 pl-10 pr-12 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                            placeholder="Tìm kiếm sản phẩm..."
                        />
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        {searchQuery && (
                            <button
                                className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                onClick={resetSearch}
                            >
                                <X size={18} />
                            </button>
                        )}
                        <button
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white rounded w-8 h-8 flex items-center justify-center hover:bg-blue-700"
                        >
                            <Search size={16} />
                        </button>
                    </div>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                    <span>Kết quả tìm kiếm cho </span>
                    <span className="font-medium text-gray-900 mx-1">"{searchQuery}"</span>
                    <span>({products.length} sản phẩm)</span>
                </div>
            </div>

            {/* Filter and content area */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Filter sidebar - Desktop */}
                <div className="hidden lg:block w-64 flex-shrink-0">
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="font-medium">Bộ lọc tìm kiếm</h3>
                            {activeFiltersCount > 0 && (
                                <button
                                    onClick={clearAllFilters}
                                    className="text-sm text-blue-600 hover:text-blue-700"
                                >
                                    Xóa tất cả
                                </button>
                            )}
                        </div>

                        <div className="p-4 border-b border-gray-200">
                            <h4 className="font-medium mb-3">Danh mục</h4>
                            <div className="space-y-2">
                                {filterOptions.categories.map(category => (
                                    <div key={category.id} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={`cat-${category.id}`}
                                            checked={selectedCategories.includes(category.id)}
                                            onChange={() => toggleCategorySelection(category.id)}
                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <label htmlFor={`cat-${category.id}`} className="ml-2 text-sm text-gray-700 flex-grow">
                                            {category.name}
                                        </label>
                                        <span className="text-xs text-gray-500">({category.count})</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-4 border-b border-gray-200">
                            <div
                                className="flex justify-between items-center cursor-pointer"
                                onClick={() => toggleCategory('brands')}
                            >
                                <h4 className="font-medium">Thương hiệu</h4>
                                {expandedCategories.brands ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </div>

                            {expandedCategories.brands && (
                                <div className="mt-3 space-y-2">
                                    {filterOptions.brands.map(brand => (
                                        <div key={brand.id} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`brand-${brand.id}`}
                                                checked={selectedCategories.includes(brand.id)}
                                                onChange={() => toggleCategorySelection(brand.id)}
                                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <label htmlFor={`brand-${brand.id}`} className="ml-2 text-sm text-gray-700 flex-grow">
                                                {brand.name}
                                            </label>
                                            <span className="text-xs text-gray-500">({brand.count})</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-b border-gray-200">
                            <h4 className="font-medium mb-3">Khoảng giá</h4>
                            <div className="space-y-2">
                                {filterOptions.priceRanges.map(range => (
                                    <div key={range.id} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={`price-${range.id}`}
                                            checked={selectedPriceRange.length === 2 && selectedPriceRange[0] === range.min && selectedPriceRange[1] === range.max}
                                            onChange={() => handlePriceRangeSelection(range)}
                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <label htmlFor={`price-${range.id}`} className="ml-2 text-sm text-gray-700">
                                            {range.name}
                                        </label>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 flex items-center gap-2">
                                <input
                                    type="text"
                                    placeholder="₫ TỪ"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                />
                                <span className="text-gray-500">-</span>
                                <input
                                    type="text"
                                    placeholder="₫ ĐẾN"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                />
                            </div>
                            <button className="w-full mt-2 bg-blue-600 text-white py-2 rounded-md text-sm hover:bg-blue-700">
                                Áp dụng
                            </button>
                        </div>

                        <div className="p-4 border-b border-gray-200">
                            <div
                                className="flex justify-between items-center cursor-pointer"
                                onClick={() => toggleCategory('ratings')}
                            >
                                <h4 className="font-medium">Đánh giá</h4>
                                {expandedCategories.ratings ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </div>

                            {expandedCategories.ratings && (
                                <div className="mt-3 space-y-2">
                                    {filterOptions.ratings.map(rating => (
                                        <div key={rating.id} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`rating-${rating.id}`}
                                                checked={selectedCategories.includes(rating.id)}
                                                onChange={() => toggleCategorySelection(rating.id)}
                                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <label htmlFor={`rating-${rating.id}`} className="ml-2 text-sm text-gray-700 flex items-center gap-1 flex-grow">
                                                {rating.name === '5 sao' ? (
                                                    <div className="flex">
                                                        {Array(5).fill().map((_, i) => (
                                                            <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                                                        ))}
                                                    </div>
                                                ) : rating.name === '4 sao trở lên' ? (
                                                    <div className="flex">
                                                        {Array(4).fill().map((_, i) => (
                                                            <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                                                        ))}
                                                        <Star size={14} className="text-gray-300" />
                                                        <span className="ml-1">trở lên</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex">
                                                        {Array(3).fill().map((_, i) => (
                                                            <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                                                        ))}
                                                        {Array(2).fill().map((_, i) => (
                                                            <Star key={i} size={14} className="text-gray-300" />
                                                        ))}
                                                        <span className="ml-1">trở lên</span>
                                                    </div>
                                                )}
                                            </label>
                                            <span className="text-xs text-gray-500">({rating.count})</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-b border-gray-200">
                            <div
                                className="flex justify-between items-center cursor-pointer"
                                onClick={() => toggleCategory('shopTypes')}
                            >
                                <h4 className="font-medium">Loại shop</h4>
                                {expandedCategories.shopTypes ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </div>

                            {expandedCategories.shopTypes && (
                                <div className="mt-3 space-y-2">
                                    {filterOptions.shopTypes.map(shopType => (
                                        <div key={shopType.id} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`shop-${shopType.id}`}
                                                checked={selectedCategories.includes(shopType.id)}
                                                onChange={() => toggleCategorySelection(shopType.id)}
                                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <label htmlFor={`shop-${shopType.id}`} className="ml-2 text-sm text-gray-700 flex-grow">
                                                {shopType.name}
                                            </label>
                                            <span className="text-xs text-gray-500">({shopType.count})</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-b border-gray-200">
                            <div
                                className="flex justify-between items-center cursor-pointer"
                                onClick={() => toggleCategory('features')}
                            >
                                <h4 className="font-medium">Tính năng đặc biệt</h4>
                                {expandedCategories.features ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </div>

                            {expandedCategories.features && (
                                <div className="mt-3 space-y-2">
                                    {filterOptions.features.map(feature => (
                                        <div key={feature.id} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`feature-${feature.id}`}
                                                checked={selectedCategories.includes(feature.id)}
                                                onChange={() => toggleCategorySelection(feature.id)}
                                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <label htmlFor={`feature-${feature.id}`} className="ml-2 text-sm text-gray-700 flex-grow">
                                                {feature.name}
                                            </label>
                                            <span className="text-xs text-gray-500">({feature.count})</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main content area */}
                <div className="flex-grow">
                    {/* Sort and filter controls */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 mb-4">
                        <div className="p-3 flex flex-wrap items-center justify-between gap-3">
                            {/* Mobile filter button */}
                            <button
                                className="lg:hidden flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                            >
                                <SlidersHorizontal size={16} />
                                <span>Lọc</span>
                                {activeFiltersCount > 0 && (
                                    <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                        {activeFiltersCount}
                                    </span>
                                )}
                            </button>

                            {/* Sort dropdown */}
                            <div className="relative">
                                <button
                                    className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                                    onClick={() => setIsSortOpen(!isSortOpen)}
                                >
                                    <ArrowDownUp size={16} />
                                    <span>Sắp xếp theo: </span>
                                    <span className="font-medium">
                                        {sortOptions.find(option => option.id === sortOption)?.name}
                                    </span>
                                    <ChevronDown size={16} className={isSortOpen ? "transform rotate-180" : ""} />
                                </button>

                                {isSortOpen && (
                                    <div className="absolute top-full mt-1 left-0 z-10 bg-white rounded-lg shadow-lg border border-gray-200 w-48 overflow-hidden">
                                        {sortOptions.map(option => (
                                            <button
                                                key={option.id}
                                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${option.id === sortOption ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}`}
                                                onClick={() => {
                                                    setSortOption(option.id);
                                                    setIsSortOpen(false);
                                                }}
                                            >
                                                {option.name}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* View mode toggle */}
                            <div className="flex items-center border rounded-lg overflow-hidden">
                                <button
                                    className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                                    onClick={() => setViewMode('grid')}
                                >
                                    <Grid size={18} />
                                </button>
                                <button
                                    className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                                    onClick={() => setViewMode('list')}
                                >
                                    <List size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Active filters */}
                        {activeFiltersCount > 0 && (
                            <div className="px-4 py-2 border-t border-gray-200 flex flex-wrap gap-2 items-center">
                                <span className="text-sm text-gray-600">Lọc theo:</span>

                                {selectedCategories.map(id => {
                                    const allFilters = [
                                        ...filterOptions.categories,
                                        ...filterOptions.brands,
                                        ...filterOptions.features,
                                        ...filterOptions.ratings,
                                        ...filterOptions.shopTypes
                                    ];
                                    const filter = allFilters.find(f => f.id === id);

                                    if (!filter) return null;

                                    return (
                                        <div
                                            key={id}
                                            className="bg-blue-50 border border-blue-100 rounded-full px-3 py-1 text-xs text-blue-600 flex items-center gap-1"
                                        >
                                            <span>{filter.name}</span>
                                            <button onClick={() => toggleCategorySelection(id)}>
                                                <X size={14} />
                                            </button>
                                        </div>
                                    );
                                })}

                                {selectedPriceRange.length === 2 && (
                                    <div className="bg-blue-50 border border-blue-100 rounded-full px-3 py-1 text-xs text-blue-600 flex items-center gap-1">
                                        <span>{formatCurrency(selectedPriceRange[0])} - {formatCurrency(selectedPriceRange[1])}</span>
                                        <button onClick={() => setSelectedPriceRange([])}>
                                            <X size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Grid view */}
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                            {products.map(product => (
                                <div key={product.id}>
                                    <ProductCardItem product={product} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* List view */
                        <div className="space-y-4">
                            {products.map(product => (
                                <div
                                    key={product.id}
                                    className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex p-4">
                                        <div className="w-40 h-40 overflow-hidden rounded-lg flex-shrink-0 relative">
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                            {product.discount > 0 && (
                                                <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold">
                                                    -{product.discount}%
                                                </div>
                                            )}
                                            {product.isAd && (
                                                <div className="absolute bottom-2 left-2 bg-gray-800 bg-opacity-70 text-white px-2 py-0.5 rounded text-xs">
                                                    Quảng cáo
                                                </div>
                                            )}
                                        </div>

                                        <div className="ml-4 flex-grow">
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-800 mb-2 hover:text-blue-600">
                                                    {product.name}
                                                </h3>

                                                <div className="flex items-center gap-4 mb-2">
                                                    <div className="flex items-center">
                                                        <div className="flex">{renderStars(product.rating)}</div>
                                                        <span className="ml-1 text-sm text-gray-600">({product.reviewCount})</span>
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        <span>Đã bán {product.soldCount}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-baseline gap-2 mb-2">
                                                    <div className="text-xl font-bold text-red-600">
                                                        {formatCurrency(product.price)}
                                                    </div>
                                                    {product.originalPrice > product.price && (
                                                        <div className="text-sm text-gray-500 line-through">
                                                            {formatCurrency(product.originalPrice)}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {product.badges.map((badge, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded"
                                                        >
                                                            {badge}
                                                        </span>
                                                    ))}
                                                    {product.freeShipping && (
                                                        <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded">
                                                            Freeship
                                                        </span>
                                                    )}
                                                    {product.shopType === 'shopMall' && (
                                                        <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded">
                                                            Shop Mall
                                                        </span>
                                                    )}
                                                    {product.shopType === 'official' && (
                                                        <span className="bg-purple-100 text-purple-600 text-xs px-2 py-1rounded">
                                                            Chính hãng
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                                    {product.stockStatus === 'Hết hàng' ? (
                                                        <span className="text-red-500">Hết hàng</span>
                                                    ) : (
                                                        <span>Còn hàng - Giao hàng trong 24h</span>
                                                    )}
                                                </p>
                                            </div>

                                            <div className="mt-auto flex items-center gap-2">
                                                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                                                    Thêm vào giỏ hàng
                                                </button>
                                                <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 text-sm">
                                                    Xem chi tiết
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    <div className="mt-8 flex justify-center">
                        <div className="flex items-center">
                            <button className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100">
                                <ChevronLeft className="transform " size={16} />
                            </button>

                            {[1, 2, 3, 4, 5].map(page => (
                                <button
                                    key={page}
                                    className={`w-10 h-10 flex items-center justify-center rounded-full mx-1 ${page === 1 ? 'bg-blue-600 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-100'}`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100">
                                <ChevronRight className="transform " size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile filter drawer */}
            {isFilterOpen && (
                <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50 flex">
                    <div className="w-80 bg-white h-full ml-auto overflow-auto">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h3 className="font-medium">Bộ lọc tìm kiếm</h3>
                            <button onClick={() => setIsFilterOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-4 border-b border-gray-200">
                            <h4 className="font-medium mb-3">Danh mục</h4>
                            <div className="space-y-2">
                                {filterOptions.categories.map(category => (
                                    <div key={category.id} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={`mobile-cat-${category.id}`}
                                            checked={selectedCategories.includes(category.id)}
                                            onChange={() => toggleCategorySelection(category.id)}
                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <label htmlFor={`mobile-cat-${category.id}`} className="ml-2 text-sm text-gray-700 flex-grow">
                                            {category.name}
                                        </label>
                                        <span className="text-xs text-gray-500">({category.count})</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Repeat other filter sections here, similar to desktop */}
                        {/* Price range, brands, features, etc. */}

                        <div className="p-4 sticky bottom-0 bg-white border-t border-gray-200 flex gap-2">
                            <button
                                className="flex-1 bg-gray-100 py-2 rounded-lg text-gray-700 font-medium"
                                onClick={() => {
                                    clearAllFilters();
                                    setIsFilterOpen(false);
                                }}
                            >
                                Đặt lại
                            </button>
                            <button
                                className="flex-1 bg-blue-600 py-2 rounded-lg text-white font-medium"
                                onClick={() => setIsFilterOpen(false)}
                            >
                                Áp dụng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchProductPage;