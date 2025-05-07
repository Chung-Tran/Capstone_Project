import React, { useState, useEffect } from 'react';
import {
    Grid, List, ArrowDownUp, ChevronDown, ChevronLeft, ChevronRight
} from 'lucide-react';
import ProductCardItem from '../components/product/ProductCard';
import ProductItemHorizontal from './SearchProductPage';
import productService from '../services/product.service';
import { useParams, useNavigate } from 'react-router-dom';
import { useLoading } from '../utils/useLoading';
import { sortOptions } from '../common/Constant';
import { useSelector } from 'react-redux';

const CategoryPage = () => {
    const { cat_id } = useParams(); // Get category ID from URL
    const navigate = useNavigate();
    const { setLoading } = useLoading();
    const categoriesFromRedux = useSelector((state) => state.common.categories);
    const [category, setCategory] = useState(null);
    const [products, setProducts] = useState([]);
    const [viewMode, setViewMode] = useState('grid');
    const [sortOptionSelected, setSortOptionSelected] = useState('relevance');
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [relatedCategories, setRelatedCategories] = useState([]);
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [recentlyViewed, setRecentlyViewed] = useState([]);

    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: 24
    });

    // Fetch category details
    const fetchCategory = async () => {
        try {
            const response = await productService.get_category_by_id(cat_id);
            if (response?.data) {
                setCategory(response.data);
                // Find parent category to get related categories
                if (response.data.parentId) {
                    fetchRelatedCategories(response.data.parentId);
                } else {
                    // If this is a main category, find its subcategories
                    fetchSubcategories(response.data.id);
                }
            }
        } catch (error) {
            console.error('Error fetching category:', error);
        }
    };

    // Fetch subcategories
    const fetchSubcategories = async (parentId) => {
        try {
            const subcategories = categoriesFromRedux.filter(cat => cat.parentId === parentId);
            setRelatedCategories(subcategories);
        } catch (error) {
            console.error('Error fetching subcategories:', error);
        }
    };

    // Fetch related categories (siblings)
    const fetchRelatedCategories = async (parentId) => {
        try {
            const siblings = categoriesFromRedux.filter(cat => cat.parentId === parentId);
            setRelatedCategories(siblings);
        } catch (error) {
            console.error('Error fetching related categories:', error);
        }
    };

    // Fetch products
    const fetchProducts = async (page = 1) => {
        try {
            setLoading(true);
            const limit = pagination.itemsPerPage;
            const skip = (page - 1) * limit;

            const params = { limit, skip, cat_id, sortOption: sortOptionSelected };

            const response = await productService.product_search(params);
            if (response?.data) {
                setProducts(response.data);
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
        } finally {
            setLoading(false);
        }
    };

    // Fetch featured products for this category
    const fetchFeaturedProducts = async () => {
        try {
            const response = await productService.product_search({
                cat_id,
                limit: 4,
                sortOption: 'bestselling'
            });
            if (response?.data) {
                setFeaturedProducts(response.data);
            }
        } catch (error) {
            console.error('Error fetching featured products:', error);
        }
    };

    // Get recently viewed products from localStorage
    const getRecentlyViewed = () => {
        try {
            const viewed = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
            setRecentlyViewed(viewed.slice(0, 4)); // Get only the first 4
        } catch (error) {
            console.error('Error fetching recently viewed products:', error);
        }
    };

    // Navigate to a category
    const goToCategory = (id) => {
        navigate(`/danh-muc/${id}`);
    };

    // Initialize
    useEffect(() => {
        if (!category) {
            const categorySelect = categoriesFromRedux.find(cat => cat._id === cat_id);
            if (categorySelect) {
                setCategory(categorySelect);
            } else {
                navigate('/'); // Redirect to home if category not found
            }
        }

        fetchCategory();
        fetchProducts();
        fetchFeaturedProducts();
        getRecentlyViewed();
    }, [cat_id]);

    useEffect(() => {
        fetchProducts();
    }, [sortOptionSelected]);
    console.log(category, 'category');
    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            {/* Category header with breadcrumbs */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    {category ? category.name : 'Danh mục sản phẩm'}
                </h1>
                <div className="text-gray-600">
                    <span>{pagination.totalItems} sản phẩm</span>
                </div>
                {category?.description && (
                    <div className="mt-3 text-gray-600 max-w-3xl">
                        {category.description}
                    </div>
                )}
            </div>

            {/* Content area with sidebar */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left sidebar with related categories */}
                <div className="w-64 flex-shrink-0">
                    {/* Related Categories */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 mb-6">
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="font-semibold text-gray-800">Danh mục liên quan</h3>
                        </div>
                        <div className="p-2">
                            <ul className="divide-y divide-gray-100">
                                {categoriesFromRedux.map((cat) => {
                                    const isActive = cat._id === cat_id;

                                    return (
                                        <li key={cat._id}>
                                            <button
                                                onClick={() => goToCategory(cat._id)}
                                                className={`w-full text-left px-3 py-2.5 text-sm rounded transition-colors
                        ${isActive ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-blue-50'}`}
                                            >
                                                {cat.name}
                                                {cat.productCount > 0 && (
                                                    <span className="ml-1 text-xs text-gray-500">({cat.productCount})</span>
                                                )}
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>

                    {/* Featured Products */}
                    {featuredProducts.length > 0 && (
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 mb-6">
                            <div className="p-4 border-b border-gray-200 bg-gray-50">
                                <h3 className="font-semibold text-gray-800">Sản phẩm nổi bật</h3>
                            </div>
                            <div className="p-3">
                                {featuredProducts.map(product => (
                                    <div
                                        key={product.id}
                                        className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0 cursor-pointer"
                                        onClick={() => navigate(`/product/${product.id}`)}
                                    >
                                        <div className="w-14 h-14 flex-shrink-0">
                                            <img
                                                src={product.main_image}
                                                alt={product.name}
                                                className="w-full h-full object-cover rounded"
                                            />
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <h4 className="text-sm font-medium text-gray-800 truncate">{product.name}</h4>
                                            <div className="text-blue-600 font-medium text-sm mt-1">
                                                {new Intl.NumberFormat('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND'
                                                }).format(product.price)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recently Viewed */}
                    {recentlyViewed.length > 0 && (
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                            <div className="p-4 border-b border-gray-200 bg-gray-50">
                                <h3 className="font-semibold text-gray-800">Đã xem gần đây</h3>
                            </div>
                            <div className="p-3">
                                {recentlyViewed.map(product => (
                                    <div
                                        key={product.id}
                                        className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0 cursor-pointer"
                                        onClick={() => navigate(`/product/${product.id}`)}
                                    >
                                        <div className="w-14 h-14 flex-shrink-0">
                                            <img
                                                src={product.main_image}
                                                alt={product.name}
                                                className="w-full h-full object-cover rounded"
                                            />
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <h4 className="text-sm font-medium text-gray-800 truncate">{product.name}</h4>
                                            <div className="text-blue-600 font-medium text-sm mt-1">
                                                {new Intl.NumberFormat('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND'
                                                }).format(product.price)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Main content area */}
                <div className="flex-grow">
                    {/* Sort and view controls */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
                        <div className="p-3 flex items-center justify-between">
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
                                    <div className="absolute top-full mt-1 left-0 z-10 bg-white rounded-lg shadow-lg border border-gray-200 w-48 overflow-hidden">
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
                            <div className="flex items-center border rounded-lg overflow-hidden">
                                <button
                                    className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                                    onClick={() => setViewMode('grid')}
                                >
                                    <Grid size={18} />
                                </button>

                            </div>
                        </div>
                    </div>

                    {/* Products grid/list view */}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {products.map(product => (
                            <ProductCardItem key={product.id} product={product} />
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 0 && (
                        <div className="mt-8 flex justify-center">
                            <div className="flex items-center gap-2">
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
                                        page = i + 1;
                                    } else if (pagination.currentPage <= 3) {
                                        page = i + 1;
                                    } else if (pagination.currentPage >= pagination.totalPages - 2) {
                                        page = pagination.totalPages - 4 + i;
                                    } else {
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
                            <p className="text-gray-600">Không có sản phẩm trong danh mục này</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoryPage;