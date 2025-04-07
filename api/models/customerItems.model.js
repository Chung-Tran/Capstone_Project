const mongoose = require('mongoose');

const customerItemsSchema = new mongoose.Schema({
    customer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    type: {
        type: String,
        enum: ['wishlist', 'cart'],
        required: true
    },
    quantity: {
        type: Number,
        default: 1,
        min: 1
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Compound index để đảm bảo không trùng lặp sản phẩm trong wishlist/cart của cùng một khách hàng
customerItemsSchema.index({ customer_id: 1, product_id: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('CustomerItems', customerItemsSchema);
