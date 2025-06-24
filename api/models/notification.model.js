const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    customer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
    },
    type: {
        type: String,
    },
    title: {
        type: String,
    },
    content: String,
    is_read: {
        type: Boolean,
        default: false
    },
    is_created_by_ai: {
        type: Boolean,
        default: false
    },
    negative_comment_ids: {
        type: Array,
    },
    data: {
        type: Array,
    },
    order_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }
}, {
    timestamps: { createdAt: 'created_at' }
});

module.exports = mongoose.model('Notification', notificationSchema); 