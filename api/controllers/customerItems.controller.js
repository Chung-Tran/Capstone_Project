const asyncHandler = require('express-async-handler');
const CustomerItems = require('../models/customerItems.model');
const Product = require('../models/product.model');
const formatResponse = require('../middlewares/responseFormat');

// Thêm sản phẩm vào wishlist
const addToWishlist = asyncHandler(async (req, res) => {
    const customer_id = req.user._id;
    const { product_id } = req.body;

    // Kiểm tra sản phẩm tồn tại
    const product = await Product.findById(product_id);
    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    // Thêm vào wishlist
    const wishlistItem = await CustomerItems.findOneAndUpdate(
        {
            customer_id,
            product_id,
            type: 'wishlist'
        },
        {
            customer_id,
            product_id,
            type: 'wishlist'
        },
        {
            upsert: true,
            new: true
        }
    ).populate('product_id');

    res.status(201).json(formatResponse(true, wishlistItem, 'Added to wishlist successfully'));
});

// Xóa sản phẩm khỏi wishlist
const removeFromWishlist = asyncHandler(async (req, res) => {
    const customer_id = req.user._id;
    const { product_id } = req.params;

    const result = await CustomerItems.findOneAndDelete({
        customer_id,
        product_id,
        type: 'wishlist'
    });

    if (!result) {
        res.status(404);
        throw new Error('Item not found in wishlist');
    }

    res.json(formatResponse(true, null, 'Removed from wishlist successfully'));
});

// Lấy danh sách wishlist
const getWishlist = asyncHandler(async (req, res) => {
    const customer_id = req.user._id;

    const wishlist = await CustomerItems.find({
        customer_id,
        type: 'wishlist'
    }).populate('product_id');

    res.json(formatResponse(true, wishlist, 'Wishlist retrieved successfully'));
});

// Thêm vào giỏ hàng
const addToCart = asyncHandler(async (req, res) => {
    const customer_id = req.user._id;
    const { product_id, quantity } = req.body;

    // Kiểm tra sản phẩm tồn tại
    const product = await Product.findById(product_id);
    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    // Kiểm tra số lượng trong kho
    if (product.stock < quantity) {
        res.status(400);
        throw new Error('Not enough stock');
    }

    // Thêm hoặc cập nhật giỏ hàng
    const cartItem = await CustomerItems.findOneAndUpdate(
        {
            customer_id,
            product_id,
            type: 'cart'
        },
        {
            customer_id,
            product_id,
            type: 'cart',
            quantity
        },
        {
            upsert: true,
            new: true
        }
    ).populate('product_id');

    res.status(201).json(formatResponse(true, cartItem, 'Added to cart successfully'));
});

// Cập nhật số lượng trong giỏ hàng
const updateCartQuantity = asyncHandler(async (req, res) => {
    const customer_id = req.user._id;
    const { product_id } = req.params;
    const { quantity } = req.body;

    // Kiểm tra số lượng trong kho
    const product = await Product.findById(product_id);
    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    if (product.stock < quantity) {
        res.status(400);
        throw new Error('Not enough stock');
    }

    const cartItem = await CustomerItems.findOneAndUpdate(
        {
            customer_id,
            product_id,
            type: 'cart'
        },
        { quantity },
        { new: true }
    ).populate('product_id');

    if (!cartItem) {
        res.status(404);
        throw new Error('Item not found in cart');
    }

    res.json(formatResponse(true, cartItem, 'Cart updated successfully'));
});

// Xóa sản phẩm khỏi giỏ hàng
const removeFromCart = asyncHandler(async (req, res) => {
    const customer_id = req.user._id;
    const { product_id } = req.params;

    const result = await CustomerItems.findOneAndDelete({
        customer_id,
        product_id,
        type: 'cart'
    });

    if (!result) {
        res.status(404);
        throw new Error('Item not found in cart');
    }

    res.json(formatResponse(true, null, 'Removed from cart successfully'));
});

// Lấy giỏ hàng
const getCart = asyncHandler(async (req, res) => {
    const customer_id = req.user._id;

    const cart = await CustomerItems.find({
        customer_id,
        type: 'cart'
    }).populate('product_id');

    res.json(formatResponse(true, cart, 'Cart retrieved successfully'));
});

// Xóa toàn bộ giỏ hàng
const clearCart = asyncHandler(async (req, res) => {
    const customer_id = req.user._id;

    await CustomerItems.deleteMany({
        customer_id,
        type: 'cart'
    });

    res.json(formatResponse(true, null, 'Cart cleared successfully'));
});

module.exports = {
    CustomerItemsController: {
        addToWishlist,
        removeFromWishlist,
        getWishlist,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        getCart,
        clearCart
    }
}; 