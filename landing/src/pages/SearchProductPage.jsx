import React, { useState, useEffect } from 'react';
import {
    Search, SlidersHorizontal, X, ChevronDown, ChevronUp,
    Grid, List, Star, ArrowDownUp, ChevronLeft, ChevronRight
} from 'lucide-react';
import ProductCardItem from '../components/product/ProductCard';
import productService from '../services/product.service';
import { Rating } from 'react-simple-star-rating';
import { formatCurrency } from '../common/methodsCommon';
import { useSearchParams } from 'react-router-dom';
const SearchProductPage = () => {
    const [searchParams] = useSearchParams();
    const keyword = searchParams.get('keyword');
    const [searchQuery, setSearchQuery] = useState(keyword);
    const [viewMode, setViewMode] = useState('grid');
    const [sortOption, setSortOption] = useState('relevance');
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [products, setProducts] = useState([]);

    // Filters state
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedPriceRange, setSelectedPriceRange] = useState([]);
    const [tempSelectedCategories, setTempSelectedCategories] = useState([]);
    const [tempSelectedPriceRange, setTempSelectedPriceRange] = useState([]);
    const [tempSelectedRatings, setTempSelectedRatings] = useState([]);
    const [tempMinPrice, setTempMinPrice] = useState('');
    const [tempMaxPrice, setTempMaxPrice] = useState('');
    const [customPriceRange, setCustomPriceRange] = useState(false);

    const [expandedCategories, setExpandedCategories] = useState({
        ratings: false
    });

    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: 20
    });

    // Filter data
    const filterOptions = {
        categories: [
            { id: 'dien-thoai', name: 'Điện thoại', count: 356 },
            { id: 'phu-kien', name: 'Phụ kiện điện thoại', count: 1245 },
            { id: 'may-tinh-bang', name: 'Máy tính bảng', count: 124 },
            { id: 'dong-ho-thong-minh', name: 'Đồng hồ thông minh', count: 89 },
            { id: 'tai-nghe', name: 'Tai nghe', count: 432 },
        ],
        ratings: [
            { id: '5star', name: '5 sao', count: 156 },
            { id: '4star', name: '4 sao trở lên', count: 302 },
            { id: '3star', name: '3 sao trở lên', count: 356 },
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

    // Count active filters
    const activeFiltersCount = selectedCategories.length + (selectedPriceRange.length > 0 ? 1 : 0);

    // Toggle category expansion
    const toggleCategory = (category) => {
        setExpandedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    // Apply all filters
    const applyAllFilters = () => {
        setSelectedCategories([
            ...tempSelectedCategories.filter(cat => !cat.includes('star')),
            ...tempSelectedRatings
        ]);

        // Handle price range
        if (customPriceRange && tempMinPrice && tempMaxPrice) {
            setSelectedPriceRange([parseFloat(tempMinPrice), parseFloat(tempMaxPrice)]);
        } else if (!customPriceRange && tempSelectedPriceRange.length === 2) {
            setSelectedPriceRange(tempSelectedPriceRange);
        } else {
            setSelectedPriceRange([]);
        }

        fetchProducts(1);
    };

    // Clear all filters
    const clearAllFilters = () => {
        setSelectedCategories([]);
        setSelectedPriceRange([]);
        setTempSelectedCategories([]);
        setTempSelectedPriceRange([]);
        setTempSelectedRatings([]);
        setTempMinPrice('');
        setTempMaxPrice('');
        setCustomPriceRange(false);
        fetchProducts(1);
    };

    // Toggle category selection
    const toggleCategorySelection = (id) => {
        setSelectedCategories(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    // Reset search query
    const resetSearch = () => {
        setSearchQuery('');
    };

    // Fetch products based on filters
    const fetchProducts = async (page = 1) => {
        try {
            const limit = pagination.itemsPerPage;
            const skip = (page - 1) * limit;

            // Build params for API call
            const params = { limit, skip, keyword };

            // Add category filters (excluding star ratings)
            const categoryFilters = selectedCategories.filter(cat => !cat.includes('star'));
            if (categoryFilters.length > 0) {
                params.categories = categoryFilters.join(',');
            }

            // Add price range
            if (selectedPriceRange.length === 2) {
                params.minPrice = selectedPriceRange[0];
                params.maxPrice = selectedPriceRange[1];
            }

            // Add rating filter
            const ratingFilters = selectedCategories.filter(cat => cat.includes('star'));
            if (ratingFilters.length > 0) {
                const highestRating = Math.max(...ratingFilters.map(r => parseInt(r.charAt(0))));
                params.minRating = highestRating;
            }

            // Add sort parameter
            params.sort = sortOption;

            const response = await productService.product_search(params);
            if (response?.data) {
                setProducts(response.data);

                // Update pagination from metadata
                const { page: currentPage, totalPages, total } = response.metadata;
                setPagination({
                    currentPage,
                    totalPages,
                    totalItems: total,
                    itemsPerPage: limit
                });
            } else {
                setProducts([]);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            setProducts([]);
        }
    };

    // Initialize filters and fetch products on mount
    useEffect(() => {
        setTempSelectedCategories(selectedCategories.filter(cat => !cat.includes('star')));
        setTempSelectedPriceRange(selectedPriceRange);
        setTempSelectedRatings(selectedCategories.filter(cat => cat.includes('star')));
        setSearchQuery(keyword);
        fetchProducts();
    }, [keyword]);

    // Re-fetch products when sort option changes
    useEffect(() => {
        fetchProducts(pagination.currentPage);
    }, [sortOption]);
    console.log(keyword)
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
                        {/* Filter header */}
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

                        {/* Categories filter */}
                        <div className="p-4 border-b border-gray-200">
                            <h4 className="font-medium mb-3">Danh mục</h4>
                            <div className="space-y-2">
                                {filterOptions.categories.map(category => (
                                    <div key={category.id} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={`cat-${category.id}`}
                                            checked={tempSelectedCategories.includes(category.id)}
                                            onChange={() => {
                                                setTempSelectedCategories(prev =>
                                                    prev.includes(category.id)
                                                        ? prev.filter(item => item !== category.id)
                                                        : [...prev, category.id]
                                                );
                                            }}
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

                        {/* Price range filter */}
                        <div className="p-4 border-b border-gray-200">
                            <h4 className="font-medium mb-3">Khoảng giá</h4>
                            <div className="space-y-2">
                                {filterOptions.priceRanges.map(range => (
                                    <div key={range.id} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={`price-${range.id}`}
                                            checked={!customPriceRange &&
                                                tempSelectedPriceRange.length === 2 &&
                                                tempSelectedPriceRange[0] === range.min &&
                                                tempSelectedPriceRange[1] === range.max}
                                            onChange={() => {
                                                setCustomPriceRange(false);
                                                setTempSelectedPriceRange(prev =>
                                                    prev.length === 2 &&
                                                        prev[0] === range.min &&
                                                        prev[1] === range.max
                                                        ? []
                                                        : [range.min, range.max]
                                                );
                                            }}
                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <label htmlFor={`price-${range.id}`} className="ml-2 text-sm text-gray-700">
                                            {range.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Ratings filter */}
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
                                                checked={tempSelectedRatings.includes(rating.id)}
                                                onChange={() => {
                                                    setTempSelectedRatings(prev =>
                                                        prev.includes(rating.id)
                                                            ? prev.filter(item => item !== rating.id)
                                                            : [...prev, rating.id]
                                                    );
                                                }}
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

                        {/* Apply filters button */}
                        <div className="p-4">
                            <button
                                onClick={applyAllFilters}
                                className="w-full bg-blue-600 text-white py-2 rounded-md text-sm hover:bg-blue-700"
                            >
                                Áp dụng bộ lọc
                            </button>
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
                                        ...filterOptions.ratings
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

                    {/* Products grid/list view */}
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                            {products.map(product => (
                                <ProductCardItem key={product.id} product={product} />
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
                                                src={product.main_image}
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
                                            <h3 className="text-lg font-medium text-gray-800 mb-2 hover:text-blue-600">
                                                {product.name}
                                            </h3>

                                            <div className="flex items-center gap-4 mb-2">
                                                <div className="flex items-center">
                                                    <div className="flex">
                                                        <Rating
                                                            initialValue={product.average_rating}
                                                            size={20}
                                                            allowFraction
                                                            readonly
                                                            SVGstyle={{ display: 'inline-block' }}
                                                            fillColor="#facc15"
                                                            emptyColor="#e5e7eb"
                                                        />
                                                    </div>
                                                    <span className="ml-1 text-sm text-gray-600">({product.total_reviews})</span>
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
                                                {product.badges?.map((badge, idx) => (
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

                                            <p className="text-sm text-gray-600 mb-3">
                                                {product.stock === 0 ? (
                                                    <span className="text-red-500">Hết hàng</span>
                                                ) : (
                                                    <span>Còn hàng - Giao hàng trong 24h</span>
                                                )}
                                            </p>

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
                    {pagination.totalPages > 0 && (
                        <div className="mt-8 flex justify-center">
                            <div className="flex items-center">
                                <button
                                    className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100"
                                    onClick={() => pagination.currentPage > 1 && fetchProducts(pagination.currentPage - 1)}
                                    disabled={pagination.currentPage === 1}
                                >
                                    <ChevronLeft size={16} />
                                </button>

                                {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                                    let page;
                                    if (pagination.totalPages <= 5) {
                                        // Show all pages if total pages <= 5
                                        page = i + 1;
                                    } else if (pagination.currentPage <= 3) {
                                        // Near start
                                        page = i + 1;
                                    } else if (pagination.currentPage >= pagination.totalPages - 2) {
                                        // Near end
                                        page = pagination.totalPages - 4 + i;
                                    } else {
                                        // Middle - show current page and 2 pages on each side
                                        page = pagination.currentPage - 2 + i;
                                    }

                                    return (
                                        <button
                                            key={page}
                                            className={`w-10 h-10 flex items-center justify-center rounded-full ${pagination.currentPage === page
                                                ? 'bg-blue-600 text-white'
                                                : 'border border-gray-300 text-gray-600 hover:bg-gray-100'
                                                }`}
                                            onClick={() => fetchProducts(page)}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}

                                <button
                                    className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100"
                                    onClick={() => pagination.currentPage < pagination.totalPages && fetchProducts(pagination.currentPage + 1)}
                                    disabled={pagination.currentPage === pagination.totalPages}
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* No products message */}
                    {products.length === 0 && (
                        <div className="py-12 text-center">
                            <h3 className="text-lg font-medium text-gray-800 mb-2">Không tìm thấy sản phẩm nào</h3>
                            <p className="text-gray-600">Vui lòng thử lại với từ khóa khác hoặc thay đổi bộ lọc tìm kiếm</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile filter drawer */}
            {isFilterOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex">
                    <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsFilterOpen(false)}></div>
                    <div className="relative w-80 max-w-full bg-white h-full overflow-auto flex flex-col animate-slide-in-right">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="font-medium">Bộ lọc tìm kiếm</h3>
                            <button onClick={() => setIsFilterOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Mobile filter content - same as desktop sidebar */}
                        <div className="flex-grow overflow-auto">
                            {/* Categories filter */}
                            <div className="p-4 border-b border-gray-200">
                                <h4 className="font-medium mb-3">Danh mục</h4>
                                <div className="space-y-2">
                                    {filterOptions.categories.map(category => (
                                        <div key={category.id} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`mobile-cat-${category.id}`}
                                                checked={tempSelectedCategories.includes(category.id)}
                                                onChange={() => {
                                                    setTempSelectedCategories(prev =>
                                                        prev.includes(category.id)
                                                            ? prev.filter(item => item !== category.id)
                                                            : [...prev, category.id]
                                                    );
                                                }}
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

                            {/* Price range filter */}
                            <div className="p-4 border-b border-gray-200">
                                <h4 className="font-medium mb-3">Khoảng giá</h4>
                                <div className="space-y-2">
                                    {filterOptions.priceRanges.map(range => (
                                        <div key={range.id} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`mobile-price-${range.id}`}
                                                checked={!customPriceRange &&
                                                    tempSelectedPriceRange.length === 2 &&
                                                    tempSelectedPriceRange[0] === range.min &&
                                                    tempSelectedPriceRange[1] === range.max}
                                                onChange={() => {
                                                    setCustomPriceRange(false);
                                                    setTempSelectedPriceRange(prev =>
                                                        prev.length === 2 &&
                                                            prev[0] === range.min &&
                                                            prev[1] === range.max
                                                            ? []
                                                            : [range.min, range.max]
                                                    );
                                                }}
                                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <label htmlFor={`mobile-price-${range.id}`} className="ml-2 text-sm text-gray-700">
                                                {range.name}
                                            </label>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 flex items-center gap-2">
                                    <input
                                        type="text"
                                        placeholder="₫ TỪ"
                                        value={tempMinPrice}
                                        onChange={(e) => {
                                            setTempMinPrice(e.target.value);
                                            setCustomPriceRange(true);
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    />
                                    <span className="text-gray-500">-</span>
                                    <input
                                        type="text"
                                        placeholder="₫ ĐẾN"
                                        value={tempMaxPrice}
                                        onChange={(e) => {
                                            setTempMaxPrice(e.target.value);
                                            setCustomPriceRange(true);
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    />
                                </div>
                            </div>

                            {/* Ratings filter */}
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
                                                    id={`mobile-rating-${rating.id}`}
                                                    checked={tempSelectedRatings.includes(rating.id)}
                                                    onChange={() => {
                                                        setTempSelectedRatings(prev =>
                                                            prev.includes(rating.id)
                                                                ? prev.filter(item => item !== rating.id)
                                                                : [...prev, rating.id]
                                                        );
                                                    }}
                                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <label htmlFor={`mobile-rating-${rating.id}`} className="ml-2 text-sm text-gray-700 flex items-center gap-1 flex-grow">
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
                        </div>

                        {/* Filter action buttons */}
                        <div className="p-4 border-t border-gray-200 flex justify-between">
                            <button
                                onClick={clearAllFilters}
                                className="w-1/2 mr-2 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100"
                            >
                                Xóa tất cả
                            </button>
                            <button
                                onClick={() => {
                                    applyAllFilters();
                                    setIsFilterOpen(false);
                                }}
                                className="w-1/2 ml-2 bg-blue-600 text-white py-2 rounded-md text-sm hover:bg-blue-700"
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