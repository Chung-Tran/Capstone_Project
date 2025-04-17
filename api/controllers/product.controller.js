const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Product = require('../models/product.model');
const Store = require('../models/store.model');
const Category = require('../models/category.model');
const formatResponse = require('../middlewares/responseFormat');

const createProduct = asyncHandler(async (req, res) => {
    const {
        category_id,
        name,
        price,
        description,
        variants,
        original_price,
        tags,
        main_image,
        additional_images,
        status,
        weight,
        dimensions
    } = req.body;

    // Validation
    if (!name || !price) {
        res.status(400);
        throw new Error('Tên sản phẩm và giá bán là bắt buộc');
    }

    const store = await Store.findOne({ owner_id: req.user._id });
    if (!store) {
        res.status(404);
        throw new Error('Không tìm thấy cửa hàng');
    }
    const store_id = store._id;

    // Tạo product_code
    const productCount = await Product.countDocuments();
    const product_code = `PROD-${(productCount + 1).toString().padStart(3, '0')}`;

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

    // Kiểm tra variants
    let total_stock_quantity = 0;
    let validVariants = [];
    if (variants && Array.isArray(variants)) {
        validVariants = variants.map(v => ({
            variants_name: v.variants_name || `SKU-${Math.random().toString(36).substr(2, 9)}`,
            variants_stock_quantity: Number(v.variants_stock_quantity) || 0,
            attributes: v.attributes || {}
        }));
        total_stock_quantity = validVariants.reduce(
            (sum, v) => sum + v.variants_stock_quantity,
            0
        );
    }

    const product = await Product.create({
        product_code,
        store_id,
        category_id: validCategoryIds,
        name,
        price: Number(price),
        description,
        variants: validVariants,
        total_stock_quantity,
        original_price: original_price ? Number(original_price) : undefined,
        tags: tags ? tags : [],
        main_image,
        additional_images: additional_images || [],
        status: status || 'active',
        weight: weight ? Number(weight) : undefined,
        dimensions: dimensions || {}
    });

    if (product) {
        res.status(201).json(formatResponse(true, {
            _id: product._id,
            product_code: product.product_code,
            name: product.name,
            price: product.price,
            store_id: product.store_id,
            category_id: product.category_id,
            variants: product.variants
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
        .populate('store_id');

    if (product) {
        res.json(formatResponse(true, product, 'Product retrieved successfully'));
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

    if (product) {
        product.name = req.body.name || product.name;
        product.price = req.body.price || product.price;
        product.description = req.body.description || product.description;

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

        if (req.body.variants && Array.isArray(req.body.variants)) {
            product.variants = req.body.variants.map(v => ({
                variants_name: v.variants_name || `SKU-${Math.random().toString(36).substr(2, 9)}`,
                variants_stock_quantity: Number(v.variants_stock_quantity) || 0,
                attributes: v.attributes || {}
            }));
            product.total_stock_quantity = product.variants.reduce(
                (sum, v) => sum + v.variants_stock_quantity,
                0
            );
        }

        product.original_price = req.body.original_price ? Number(req.body.original_price) : product.original_price;
        product.tags = req.body.tags ? req.body.tags : product.tags;
        product.main_image = req.body.main_image || product.main_image;
        product.additional_images = req.body.additional_images || product.additional_images;
        product.status = req.body.status || product.status;
        product.weight = req.body.weight ? Number(req.body.weight) : product.weight;
        product.dimensions = req.body.dimensions || product.dimensions;

        const updatedProduct = await product.save();

        res.json(formatResponse(true, {
            _id: updatedProduct._id,
            name: updatedProduct.name,
            price: updatedProduct.price,
            category_id: updatedProduct.category_id,
            variants: updatedProduct.variants,
            total_stock_quantity: updatedProduct.total_stock_quantity,
            status: updatedProduct.status
        }, 'Product updated successfully'));
    } else {
        res.status(404);
        throw new Error('Không tìm thấy sản phẩm');
    }
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

module.exports = {
    ProductController: {
        createProduct,
        getProducts,
        getProductById,
        updateProduct,
        deleteProduct,
        getProductByStoreId
    }
};