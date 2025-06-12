const mongoose = require('mongoose');

const userActionSchema = new mongoose.Schema({
    customer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
        index: true
    },
    action_type: {
        type: String,
        enum: ['view', 'click', 'cart', 'purchase', 'like', 'wishlist', 'search'],
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
    keyword: string,
    meta: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
        // ví dụ: { source: 'home', device: 'mobile', duration: 4.2 }
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: false }
});

module.exports = mongoose.model('UserAction', userActionSchema);
