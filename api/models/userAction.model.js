const mongoose = require('mongoose');

const userAction = new mongoose.Schema({
    customer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    action_type: {
        type: String,
    },
    product_id: {
        type: String,
    },
    category: {
        type: String,
    }
}, {
    timestamps: { createdAt: 'created_at' }
});

module.exports = mongoose.model('userAction', userAction); 