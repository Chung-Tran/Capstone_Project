const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    customer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    token_type: {
        type: String,
        enum: ['access', 'refresh', 'reset'],
        required: true
    },
    token: {
        type: String,
        required: true
    },
    expires_at: {
        type: Date,
        required: true
    }
}, {
    timestamps: { createdAt: 'created_at' }
});

module.exports = mongoose.model('Token', tokenSchema); 