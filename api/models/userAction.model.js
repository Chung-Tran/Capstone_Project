const mongoose = require('mongoose');

const userActionSchema = new mongoose.Schema({
    customer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
        index: true
    },
    store_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
    },
    action_type: {
        type: String,
        enum: [
            'view_product',
            'search',
            'click_product',
            'view_shop',
            'add_to_cart',
            'purchase',
            'add_to_wishlist',
            'filter',
            'comment',
        ],
        required: true,
        index: true
    },
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
        index: true
    },
    category: {
        type: String,
        default: null
    },
    priceRange: {
        type: String,
        default: null
    },
    keyword: String,
    description: String,
}, {
    timestamps: { createdAt: 'created_at', updatedAt: false }
});

module.exports = mongoose.model('UserAction', userActionSchema);
