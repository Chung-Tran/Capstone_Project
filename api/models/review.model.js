const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    review_type: {
        type: String,
        enum: ['shop_review', 'product_review'],
    },
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    },
    customer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    content: String,
    images: [String],
    verified_purchase: {
        type: Boolean,
        default: false,
    },
    reply: {
        content: String,
        replied_at: Date,
    },
    title: String,
    status: {
        type: String,
        default: 'active',
    },
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});

module.exports = mongoose.model('Review', reviewSchema);