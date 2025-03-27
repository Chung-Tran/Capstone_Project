const asyncHandler = require('express-async-handler');
const User = require('../models/user.model');
const Product = require('../models/product.model');

const createProduct = asyncHandler(async (req, res) => {
    const { productName } = req.body;
    const productExists = await Product.findOne({ productName });
    if (productExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const product = await Product.create(
        {
            productname: productName
        }
    );

    if (product) {
        res.status(201).json({
            _id: product._id,
            productName: product.productName,
            message: 'Product created successfully',
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

module.exports = {
    createProduct,

};