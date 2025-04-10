const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    product_code: {
        type: String,
        required: true,
        unique: true
    },
    store_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true
    },
    category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    name: {
        type: String,
        required: true
    },
    description: String,
    price: {
        type: Number,
        required: true
    },
    original_price: Number,
    discount_percentage: Number,
    stock_quantity: {
        type: Number,
        default: 0
    },
    weight: Number,
    dimensions: {
        length: Number,
        width: Number,
        height: Number
    },
    tags: [String],
    main_image: String,
    additional_images: [String],
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    is_featured: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Product', productSchema); 