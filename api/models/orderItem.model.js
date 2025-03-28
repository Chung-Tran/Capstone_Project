const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    order_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    unit_price: {
        type: Number,
        required: true
    },
    total_price: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'cancelled'],
        default: 'active'
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('OrderItem', orderItemSchema); 