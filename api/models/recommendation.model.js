const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
    customer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
        index: true,
        unique: true
    },
    categories: [String],
    keywords: [String],
    brands: [String],
    price_range: {
        min: Number,
        max: Number,
        avg: Number
    },
    behavior_analysis: {
        most_active_time: String, // ví dụ "18:00"
        preferred_action: String, // ví dụ "add_to_cart"
        engagement_score: Number, // scale từ 0–10
        purchase_intent: String   // "High", "Medium", etc.
    },
    statistics: {
        total_views: Number,
        total_clicks: Number,
        total_cart_adds: Number,
        total_wishlist_adds: Number,
        total_purchases: Number,
        last_activity_date: Date,
        days_active: Number
    },
    analysis_period: {
        from_date: Date,
        to_date: Date,
        days: Number
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Recommendation', recommendationSchema);
