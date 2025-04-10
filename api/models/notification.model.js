const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    customer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    type: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: String,
    is_read: {
        type: Boolean,
        default: false
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