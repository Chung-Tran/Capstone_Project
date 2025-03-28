const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    order_code: {
        type: String,
        required: true,
        unique: true
    },
    customer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    total_amount: {
        type: Number,
        required: true
    },
    subtotal: Number,
    tax_amount: Number,
    shipping_fee: Number,
    discount_amount: Number,
    payment_method: String,
    payment_status: {
        type: String,
        enum: ['pending', 'success', 'failed'],
        default: 'pending'
    },
    shipping_method: {
        type: String,
        enum: ['standard', 'express']
    },
    tracking_number: String,
    carrier: String,
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    shipping_address: {
        street: String,
        city: String,
        state: String,
        postal_code: String,
        country: String
    },
    billing_address: {
        street: String,
        city: String,
        state: String,
        postal_code: String,
        country: String
    },
    notes: String
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Order', orderSchema); 