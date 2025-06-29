import React, { useState, useEffect, useMemo } from 'react';
import {
    Search, SlidersHorizontal, X, ChevronDown, ChevronUp,
    Grid, List, Star, ArrowDownUp, ChevronLeft, ChevronRight
} from 'lucide-react';
import ProductCardItem from '../components/product/ProductCard';
import productService from '../services/product.service';
import { Rating } from 'react-simple-star-rating';
import { formatCurrency } from '../common/methodsCommon';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLoading } from '../utils/useLoading';
import { log_action_type, price_range_filter, sortOptions } from '../common/Constant';
import { useSelector } from 'react-redux';
import create_logger from '../config/logger';

const ProductItemHorizontal = ({ product }) => {
    return (
        <div
            key={product._id}
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
                    {product.badge && (
                        <div className="absolute bottom-2 left-2 bg-gray-800 bg-opacity-70 text-white px-2 py-0.5 rounded text-xs">
                            {product.badge}
                        </div>
                    )}
                </div>

                <div className="ml-4 flex-grow flex flex-col">
                    <h3 className="text-lg font-medium text-gray-800 mb-2 hover:text-blue-600">
                        {product.name}
                    </h3>

                    <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center">
                            <Rating
                                initialValue={product.average_rating}
                                size={20}
                                allowFraction
                                readonly
                                SVGstyle={{ display: 'inline-block' }}
                                fillColor="#facc15"
                                emptyColor="#e5e7eb"
                            />
                            <span className="ml-1 text-sm text-gray-600">({product.total_reviews || 0})</span>
                        </div>
                        {product.quantitySold > 0 && (
                            <div className="text-sm text-gray-600">
                                Đã bán {product.quantitySold}
                            </div>
                        )}
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
                        {product.badge && (
                            <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded">
                                {product.badge}
                            </span>
                        )}
                        {product.isFreeShipping && (
                            <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded">
                                Freeship
                            </span>
                        )}
                    </div>

                    <p className="text-sm text-gray-600 mb-3">
                        {product.stockStatus === 'Còn hàng' ? (
                            <span className="text-green-500">Còn hàng</span>
                        ) : (
                            <span className="text-red-500">Hết hàng</span>
                        )}
                    </p>

                    <div className="mt-auto flex items-center gap-2">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                            Thêm vào giỏ hàng
                        </button>
                        <a
                            href={`/san-pham/${product._id}`}
                            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 text-sm"
                        >
                            Xem chi tiết
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
};

const SearchProductPage = () => {
    const navigate = useNavigate();
    const { setLoading } = useLoading();
    const [searchParams] = useSearchParams();
    const keyword = searchParams.get('keyword');
    const [searchQuery, setSearchQuery] = useState(keyword);
    const [viewMode, setViewMode] = useState('grid');
    const [sortOptionSelected, setSortOptionSelected] = useState('relevance');
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [products, setProducts] = useState([]);
    let categoriesFromRedux = useSelector((state) => state.common.categories)
    const [categories, setCategories] = useState(categoriesFromRedux);

    // Separated filter states
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedRatings, setSelectedRatings] = useState([]);
    const [selectedPriceRange, setSelectedPriceRange] = useState([]);

    // Temporary states for filter modal
    const [tempSelectedCategories, setTempSelectedCategories] = useState([]);
    const [tempSelectedRatings, setTempSelectedRatings] = useState([]);
    const [tempSelectedPriceRange, setTempSelectedPriceRange] = useState([]);

    const [expandedCategories, setExpandedCategories] = useState(true);

    const handleSearch = () => {
        if (searchQuery?.trim()) {
            navigate(`/tim-kiem?keyword=${encodeURIComponent(searchQuery.trim())}`);
            create_logger({
                customer_id: localStorage.getItem('customer_id'),
                action_type: log_action_type.SEARCH,
                categories: tempSelectedCategories.toString(),
                product_id: null,
                keyword: searchQuery,
            })
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: 20
    });
    // Count active filters
    const activeFiltersCount = selectedCategories.length + selectedRatings.length + (selectedPriceRange.length > 0 ? 1 : 0);

    // Toggle category expansion
    const toggleCategory = (category) => {
        setExpandedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    const applyAllFilters = () => {
        setSelectedCategories(tempSelectedCategories);
        setSelectedRatings(tempSelectedRatings);

        if (tempSelectedPriceRange.length === 2) {
            setSelectedPriceRange(tempSelectedPriceRange);
        } else {
            setSelectedPriceRange([]);
        }
        create_logger({
            customer_id: localStorage.getItem('customer_id'),
            action_type: log_action_type.FILTER,
            keyword: searchQuery,
            categories: tempSelectedCategories,
            ratings: tempSelectedRatings,
            priceRange: tempSelectedPriceRange,
        });
    };

    // Fetch products when filters change
    useEffect(() => {
        fetchProducts(1);
    }, [selectedCategories, selectedRatings, selectedPriceRange, sortOptionSelected]);

    // Clear all filters
    const clearAllFilters = () => {
        setSelectedCategories([]);
        setSelectedRatings([]);
        setSelectedPriceRange([]);
        setTempSelectedCategories([]);
        setTempSelectedRatings([]);
        setTempSelectedPriceRange([]);
        fetchProducts(1);
    };

    // Toggle category selection
    const toggleCategorySelection = (id) => {
        setSelectedCategories(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    // Toggle rating selection
    const toggleRatingSelection = (rating) => {
        setSelectedRatings(prev =>
            prev.includes(rating) ? prev.filter(item => item !== rating) : [...prev, rating]
        );
    };

    // Reset search query
    const resetSearch = () => {
        setSearchQuery('');
    };

    // Fetch products based on filters
    const fetchProducts = async (page = 1) => {
        try {
            setLoading(true);
            const limit = pagination.itemsPerPage;
            const skip = (page - 1) * limit;

            // Build params for API call
            const params = { limit, skip, keyword };

            // Add category filters
            if (selectedCategories.length > 0) {
                params.categories = selectedCategories.join(',');
            }

            // Add price range
            if (selectedPriceRange.length === 2) {
                params.minPrice = selectedPriceRange[0];
                params.maxPrice = selectedPriceRange[1];
            }

            // Add rating filter
            if (selectedRatings.length > 0) {
                const highestRating = Math.max(...selectedRatings);
                params.minRating = highestRating;
            }

            // Add sort parameter
            params.sortOption = sortOptionSelected;

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

                create_logger({
                    customer_id: localStorage.getItem('customer_id'),
                    action_type: 'search',
                    product_id: null,
                    keyword: keyword,
                })
            } else {
                setProducts([]);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await productService.product_get_categories(10, 0);
            if (response?.data) {
                setCategories(response.data);
            } else {
                setCategories([]);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    }

    // Initialize filters and fetch products on mount
    useEffect(() => {
        setTempSelectedCategories(selectedCategories);
        setTempSelectedRatings(selectedRatings);
        setTempSelectedPriceRange(selectedPriceRange);
        setSearchQuery(keyword);
        fetchProducts();
        fetchCategories();
    }, [keyword]);


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
                            onKeyPress={handleKeyPress}
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
                            onClick={handleSearch}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-600 text-white rounded w-8 h-8 flex items-center justify-center hover:bg-blue-700"
                        >
                            <Search size={16} />
                        </button>
                    </div>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                    <span>Kết quả tìm kiếm cho </span>
                    <span className="font-medium text-gray-900 mx-1">"{keyword}"</span>
                    <span>({pagination.totalItems} sản phẩm)</span>
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
                            <div
                                className="flex justify-between items-center cursor-pointer"
                                onClick={() => setExpandedCategories(!expandedCategories)}
                            >
                                <h4 className="font-medium mb-3" onClick={() => setExpandedCategories(!expandedCategories)}>Danh mục</h4>
                                {expandedCategories ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </div>

                            <div className="space-y-2">
                                {expandedCategories && categories?.length > 0 &&
                                    [...categories] // clone mảng để tránh mutate prop gốc
                                        .sort((a, b) => b.productCount - a.productCount)
                                        .slice(0, 20)
                                        .map((category, index) => (
                                            <div key={category._id || index} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id={`cat-${category._id}`}
                                                    checked={tempSelectedCategories.includes(category._id)}
                                                    onChange={() => {
                                                        setTempSelectedCategories(prev =>
                                                            prev.includes(category._id)
                                                                ? prev.filter(item => item !== category._id)
                                                                : [...prev, category._id]
                                                        );
                                                    }}
                                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <label htmlFor={`cat-${category._id}`} className="ml-2 text-sm text-gray-700 flex-grow">
                                                    {category.name}
                                                </label>
                                                <span className="text-xs text-gray-500">({category.productCount})</span>
                                            </div>
                                        ))
                                }
                            </div>
                        </div>

                        {/* Price range filter */}
                        <div className="p-4 border-b border-gray-200">
                            <h4 className="font-medium mb-3">Khoảng giá</h4>
                            <div className="space-y-2">
                                {price_range_filter.map(range => (
                                    <div key={range.id} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id={`price-${range.id}`}
                                            checked={tempSelectedPriceRange.length === 2 &&
                                                tempSelectedPriceRange[0] === range.min &&
                                                tempSelectedPriceRange[1] === range.max}
                                            onChange={() => {
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
                                    {[5, 4, 3, 2, 1].map(starCount => (
                                        <div key={starCount} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`rating-${starCount}`}
                                                checked={tempSelectedRatings.includes(starCount)}
                                                onChange={() => {
                                                    setTempSelectedRatings(prev =>
                                                        prev.includes(starCount)
                                                            ? prev.filter(item => item !== starCount)
                                                            : [...prev, starCount]
                                                    );
                                                }}
                                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <label htmlFor={`rating-${starCount}`} className="ml-2 text-sm text-gray-700 flex items-center gap-1 flex-grow">
                                                <div className="flex items-center">
                                                    <Rating
                                                        initialValue={starCount}
                                                        size={17}
                                                        allowFraction
                                                        readonly
                                                        SVGstyle={{ display: 'inline-block' }}
                                                        fillColor="#facc15"
                                                        emptyColor="#e5e7eb"
                                                    />
                                                    {starCount < 5 && <span className="ml-1">trở lên</span>}
                                                </div>
                                            </label>
                                            <span className="text-xs text-gray-500">(0)</span>
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
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
                        <div className="p-3 flex flex-wrap items-center justify-between gap-3">
                            {/* Sort dropdown */}
                            <div className="relative">
                                <button
                                    className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                                    onClick={() => setIsSortOpen(!isSortOpen)}
                                >
                                    <ArrowDownUp size={16} />
                                    <span>Sắp xếp theo: </span>
                                    <span className="font-medium">
                                        {sortOptions.find(option => option.id === sortOptionSelected)?.name}
                                    </span>
                                    <ChevronDown size={16} className={isSortOpen ? "transform rotate-180" : ""} />
                                </button>

                                {isSortOpen && (
                                    <div className="absolute top-full mt-1 left-0 z-10 bg-white rounded-lg shadow-lg border border-gray-200 w-48 overflow-hidden z-10">
                                        {sortOptions.map(option => (
                                            <button
                                                key={option.id}
                                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${option.id === sortOptionSelected ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}`}
                                                onClick={() => {
                                                    setSortOptionSelected(option.id);
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

                                {/* Category filters */}
                                {selectedCategories.map(id => {
                                    const category = categories.find(c => c._id === id);
                                    if (!category) return null;

                                    return (
                                        <div
                                            key={id}
                                            className="bg-blue-50 border border-blue-100 rounded-full px-3 py-1 text-xs text-blue-600 flex items-center gap-1"
                                        >
                                            <span>{category.name}</span>
                                            <button onClick={() => toggleCategorySelection(id)}>
                                                <X size={14} />
                                            </button>
                                        </div>
                                    );
                                })}

                                {/* Rating filters */}
                                {selectedRatings.map(rating => (
                                    <div
                                        key={`rating-${rating}`}
                                        className="bg-blue-50 border border-blue-100 rounded-full px-3 py-1 text-xs text-blue-600 flex items-center gap-1"
                                    >
                                        <span>{rating} {rating < 5 ? 'sao trở lên' : 'sao'}</span>
                                        <button onClick={() => toggleRatingSelection(rating)}>
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}

                                {/* Price range filter */}
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
                                <ProductItemHorizontal key={product.id} product={product} />
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
        </div>
    );
};

export default SearchProductPage;