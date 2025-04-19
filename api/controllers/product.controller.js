const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Product = require('../models/product.model');
const Store = require('../models/store.model');
const Category = require('../models/category.model');
const Review = require('../models/review.model');
const formatResponse = require('../middlewares/responseFormat');
const { uploadImage } = require('../services/uploadService');

const createProduct = asyncHandler(async (req, res) => {
    const {
        category_id,
        product_code,
        name,
        price,
        description,
        original_price,
        tags,
        status,
        weight,
        dimensions,
        stock,
        is_featured
    } = req.body;

    // Validation
    if (!name || !price) {
        res.status(400);
        throw new Error('Tên sản phẩm và giá bán là bắt buộc');
    }
    console.log("process.env.CLOUDINARY_API_KEY", process.env.CLOUDINARY_API_KEY)
    const store = await Store.findOne({ owner_id: req.user._id });
    if (!store) {
        res.status(404);
        throw new Error('Không tìm thấy cửa hàng');
    }
    const store_id = store._id;
    const productCodeInvalid = await Product.findOne({ product_code: product_code, store_id: store_id })
    if (productCodeInvalid) {
        res.status(400).json(formatResponse(false, null, 'Mã sản phẩm đã tồn tại'));
    }

    // Kiểm tra category_id
    let validCategoryIds = [];
    if (category_id && Array.isArray(category_id)) {
        validCategoryIds = category_id.filter(id => mongoose.isValidObjectId(id));
        if (validCategoryIds.length !== category_id.length) {
            res.status(400);
            throw new Error('Một số ID danh mục không hợp lệ');
        }
        const existingCategories = await Category.find({
            _id: { $in: validCategoryIds },
            status: 'active'
        });
        if (existingCategories.length !== validCategoryIds.length) {
            res.status(400);
            throw new Error('Một số danh mục không tồn tại hoặc không hoạt động');
        }
    }
    let main_image = null;
    let additional_images = null;
    if (req.files && req.files.main_image && req.files.main_image?.length > 0) {
        main_image = await uploadImage(req.files.main_image[0]);
    }
    if (req.files && req.files.additional_images && req.files.additional_images?.length > 0) {
        additional_images = await uploadImage(req.files.additional_images);
    }

    const product = await Product.create({
        product_code,
        store_id,
        category_id: validCategoryIds,
        name,
        price: Number(price),
        description,
        original_price: original_price ? Number(original_price) : undefined,
        tags: tags ? tags : [],
        main_image,
        additional_images: additional_images || [],
        status: status || 'active',
        weight: weight ? Number(weight) : undefined,
        dimensions: dimensions || {},
        stock,
        is_featured: is_featured
    });

    if (product) {
        res.status(201).json(formatResponse(true, {
            _id: product._id,
            product_code: product.product_code,
            name: product.name,
            price: product.price,
            store_id: product.store_id,
            category_id: product.category_id,
        }, 'Product created successfully'));
    } else {
        res.status(400);
        throw new Error('Không thể tạo sản phẩm');
    }
});

const getProducts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, category, search } = req.query;
    const query = {};

    if (category && mongoose.isValidObjectId(category)) {
        query.category_id = { $in: [category] };
    }
    if (search) {
        query.name = { $regex: search, $options: 'i' };
    }

    const products = await Product.find(query)
        .populate('category_id')
        .limit(limit * 1)
        .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    if (products) {
        res.json(formatResponse(true, products, 'Products retrieved successfully', {
            page: parseInt(page),
            total,
            totalPages: Math.ceil(total / limit)
        }));
    } else {
        res.status(404);
        throw new Error('Không tìm thấy sản phẩm');
    }
});

const getProductById = asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(400);
        throw new Error('ID sản phẩm không hợp lệ');
    }

    const product = await Product.findById(req.params.id)
        .populate('category_id')

    if (product) {
        const reviews = await Review.find({ product_id: req.params.id, review_type: 'product_review' });
        const shopReviews = await Review.find({ product_id: req.params.id, review_type: 'shop_review' });

        const totalReviews = reviews.length;
        const totalShopReviews = shopReviews.length;
        const shop = await Store.findOne({ _id: product.store_id }).lean();
        shop.totalProduct = await Product.countDocuments({ status: 'active', store_id: product.store_id });

        let averageRating = 0;
        if (totalReviews > 0) {
            const sumRatings = reviews.reduce((sum, review) => sum + review.rating, 0);
            averageRating = parseFloat((sumRatings / totalReviews).toFixed(1));
        }
        if (totalShopReviews > 0) {
            const sumRatings = shopReviews.reduce((sum, review) => sum + review.rating, 0);
            averageRating = parseFloat((sumRatings / totalShopReviews).toFixed(1));
            shop.total_reviews = totalShopReviews;
            shop.average_rating = averageRating;

        }


        const response = {
            ...product._doc,
            average_rating: averageRating,
            total_reviews: totalReviews,
            store_info: shop,
        };

        res.json(formatResponse(true, response, 'Product retrieved successfully'));
    } else {
        res.status(404);
        throw new Error('Không tìm thấy sản phẩm');
    }
});

const updateProduct = asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(400);
        throw new Error('ID sản phẩm không hợp lệ');
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
        res.status(404);
        throw new Error('Không tìm thấy sản phẩm');
    }

    // === Update basic fields ===
    product.name = req.body.name || product.name;
    product.price = req.body.price || product.price;
    product.description = req.body.description || product.description;
    product.original_price = req.body.original_price ? Number(req.body.original_price) : product.original_price;
    product.tags = req.body.tags ? (
        typeof req.body.tags === 'string' ? req.body.tags.split(',').map(t => t.trim()) : req.body.tags
    ) : product.tags;
    product.status = req.body.status || product.status;
    product.weight = req.body.weight ? Number(req.body.weight) : product.weight;
    product.dimensions = req.body.dimensions || product.dimensions;
    product.stock = req.body.stock || product.stock;
    product.is_featured = req.body.is_featured === 'true' ? true : req.body.is_featured === 'false' ? false : product.is_featured;

    // === Update category ===
    if (req.body.category_id && Array.isArray(req.body.category_id)) {
        const validCategoryIds = req.body.category_id.filter(id => mongoose.isValidObjectId(id));
        const existingCategories = await Category.find({
            _id: { $in: validCategoryIds },
            status: 'active'
        });
        if (existingCategories.length !== validCategoryIds.length) {
            res.status(400);
            throw new Error('Một số danh mục không tồn tại hoặc không hoạt động');
        }
        product.category_id = validCategoryIds;
    }

    // === Handle main image ===
    if (req.files?.main_image) {
        const uploaded = await uploadImage(req.files.main_image[0]);
        product.main_image = uploaded;
    } else if (req.body.main_image_url) {
        product.main_image = req.body.main_image_url;
    } else if (req.body.main_image_removed === 'true') {
        product.main_image = null;
    }

    // === Handle additional images ===
    const keptUrls = req.body.kept_additional_image_urls || [];
    const keptArray = Array.isArray(keptUrls) ? keptUrls : [keptUrls];

    const newImageFiles = req.files?.new_additional_images || [];
    const newImages = newImageFiles.length > 0 ? await uploadImage(newImageFiles) : [];

    product.additional_images = [...keptArray, ...newImages];

    const updatedProduct = await product.save();

    res.json(formatResponse(true, {
        _id: updatedProduct._id,
        name: updatedProduct.name,
        price: updatedProduct.price,
        category_id: updatedProduct.category_id,
        total_stock_quantity: updatedProduct.total_stock_quantity,
        status: updatedProduct.status
    }, 'Product updated successfully'));
});


const deleteProduct = asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(400);
        throw new Error('ID sản phẩm không hợp lệ');
    }

    const product = await Product.findById(req.params.id);

    if (product) {
        await product.deleteOne();
        res.json(formatResponse(true, null, 'Product deleted successfully'));
    } else {
        res.status(404);
        throw new Error('Không tìm thấy sản phẩm');
    }
});

const getProductByStoreId = asyncHandler(async (req, res) => {
    const store = await Store.findOne({ owner_id: req.user._id });
    if (!store) {
        res.status(404);
        throw new Error('Không tìm thấy cửa hàng');
    }
    const store_id = store._id;

    const products = await Product.find({ store_id })
        .populate('category_id');

    res.status(200).json(formatResponse(true, products, "Lấy sản phẩm thành công"));
});
const getProductFeatured = asyncHandler(async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const skip = parseInt(req.query.skip) || 0;
        const products = await Product.find({
            is_featured: true,
            status: "active"
        }).sort({ quantitySold: -1, averageRating: -1 }) // sắp xếp sản phẩm nổi bật theo giá SL bán và đánh giá giảm dần
            .skip(skip)
            .limit(limit);

        res.status(200).json(formatResponse(true, products, "Lấy sản phẩm nổi bật thành công"));
    } catch (err) {
        res.status(500).json(formatResponse(false, null, "Lỗi server"));
    }
});
const getProductNew = asyncHandler(async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const skip = parseInt(req.query.skip) || 0;
        const products = await Product.find({
            status: "active"
        }).sort({ createdAt: -1 }) // sắp xếp sản phẩm mới tạo
            .skip(skip)
            .limit(limit);

        res.status(200).json(formatResponse(true, products, "Lấy sản phẩm nổi bật thành công"));
    } catch (err) {
        res.status(500).json(formatResponse(false, null, "Lỗi server"));
    }
});

module.exports = {
    ProductController: {
        createProduct,
        getProducts,
        getProductById,
        updateProduct,
        deleteProduct,
        getProductByStoreId,
        getProductFeatured,
        getProductNew,
    }
};