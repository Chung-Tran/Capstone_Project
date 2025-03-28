const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
    promotion_code: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    description: String,
    discount_type: {
        type: String,
        enum: ['percentage', 'fixed'],
        required: true
    },
    discount_value: {
        type: Number,
        required: true
    },
    start_date: Date,
    end_date: Date,
    minimum_purchase_amount: Number,
    maximum_discount: Number,
    usage_limit: Number,
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Promotion', promotionSchema); 