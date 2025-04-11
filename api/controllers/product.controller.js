const asyncHandler = require('express-async-handler');
const Product = require('../models/product.model');
const Store = require('../models/store.model');
const formatResponse = require('../middlewares/responseFormat');

const createProduct = asyncHandler(async (req, res) => {
    const { name, price, description, category_id } = req.body;
    const store = await Store.findOne({ owner_id: req.user._id });
    const store_id = store._id;
    console.log(store)
    const productCount = await Product.countDocuments();
    const product_code = `PROD-${(productCount + 1).toString().padStart(3, '0')}`;

    const product = await Product.create({
        product_code,
        store_id,
        name,
        price,
        description,
        category_id
    });

    if (product) {
        res.status(201).json(formatResponse(true, {
            _id: product._id,
            product_code: product.product_code,
            name: product.name,
            price: product.price,
            store_id: product.store_id,
            category_id: product.category_id
        }, 'Product created successfully'));
    } else {
        res.status(400);
        throw new Error('Invalid product data');
    }
});

const getProducts = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, category, search } = req.query;
    const query = {};

    if (category) query.category_id = category;
    if (search) query.name = { $regex: search, $options: 'i' };

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
        throw new Error('No products found');
    }
});

const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)
        .populate('category_id')
        .populate('store_id');

    if (product) {
        res.json(formatResponse(true, product, 'Product retrieved successfully'));
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

const updateProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        product.name = req.body.name || product.name;
        product.price = req.body.price || product.price;
        product.description = req.body.description || product.description;
        product.category_id = req.body.category_id || product.category_id;
        product.stock_quantity = req.body.stock_quantity || product.stock_quantity;
        product.status = req.body.status || product.status;

        const updatedProduct = await product.save();

        res.json(formatResponse(true, {
            _id: updatedProduct._id,
            name: updatedProduct.name,
            price: updatedProduct.price,
            category_id: updatedProduct.category_id,
            stock_quantity: updatedProduct.stock_quantity,
            status: updatedProduct.status
        }, 'Product updated successfully'));
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        await product.remove();
        res.json(formatResponse(true, null, 'Product deleted successfully'));
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});
const getProductByStoreId = asyncHandler(async (req, res) => {
    const store = await Store.findOne({ owner_id: req.user._id });
    const store_id = store._id;

    const products = await Product.find({ store_id: store_id });

    res.status(200).json(formatResponse(true, products, "Lấy sản phẩm thành công"))
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