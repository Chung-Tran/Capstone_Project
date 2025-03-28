const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    parent_category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    name: {
        type: String,
        required: true
    },
    description: String,
    image: String,
    level: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Category', categorySchema); 