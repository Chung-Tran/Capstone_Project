const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
    store_code: {
        type: String,
        required: true,
        unique: true
    },
    owner_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    store_name: {
        type: String,
        required: true
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
    }],
    business_field: Array,
    store_description: String,
    store_logo: String,
    store_banner: String,
    tax_code: String,
    contact_email: String,
    contact_phone: String,
    address: String,
    rating: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Store', storeSchema); 