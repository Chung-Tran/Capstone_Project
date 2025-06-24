const mongoose = require('mongoose');

const messengerSchema = new mongoose.Schema({
    conversation_id: {
        type: String,
        required: true,
        unique: true
    },
    customer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true
    },
    store_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true
    },
    sender_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    sender_type: {
        type: String,
        enum: ['customer', 'store'],
        required: true
    },
    message_type: {
        type: String,
        enum: ['text', 'image', 'file'],
        default: 'text'
    },
    content: {
        type: String,
        required: true
    },
    image: {
        type: String, // Base64 encoded image
        default: null
    },
    is_read: {
        type: Boolean,
        default: false
    },
    read_at: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read'],
        default: 'sent'
    }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Index để tối ưu query
messengerSchema.index({ conversation_id: 1, created_at: -1 });
messengerSchema.index({ customer_id: 1, store_id: 1 });
messengerSchema.index({ sender_id: 1, sender_type: 1 });

// Method để tạo conversation_id duy nhất
messengerSchema.statics.generateConversationId = function (customerId, storeId) {
    return `${customerId}_${storeId}`;
};

// Method để lấy tin nhắn theo conversation
messengerSchema.statics.getConversationMessages = async function (customerId, storeId, page = 1, limit = 50) {
    const conversationId = this.generateConversationId(customerId, storeId);

    return await this.find({ conversation_id: conversationId })
        .sort({ created_at: -1 })
        .limit(limit)
        .skip((page - 1) * limit)
        .populate('sender_id', 'fullName avatar username')
        .lean();
};

// Method để đánh dấu tin nhắn đã đọc
messengerSchema.statics.markAsRead = async function (conversationId, userId) {
    return await this.updateMany(
        {
            conversation_id: conversationId,
            sender_id: { $ne: userId },
            is_read: false
        },
        {
            is_read: true,
            read_at: new Date(),
            status: 'read'
        }
    );
};

module.exports = mongoose.model('Messenger', messengerSchema);