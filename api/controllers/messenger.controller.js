const asyncHandler = require('express-async-handler');
const Messenger = require('../models/messenger.model');
const Store = require('../models/store.model');
const Customer = require('../models/customer.model');
const formatResponse = require('../middlewares/responseFormat');

// Lấy thông tin chat khi khách hàng nhắn tin lần đầu
const getMessengerInfo = asyncHandler(async (req, res) => {
    const { id: storeId } = req.params; // Store ID từ URL
    const customerId = req.user._id; // Customer ID từ token

    try {
        // Lấy thông tin store
        const storeInfo = await Store.findById(storeId)
            .populate('owner_id', 'fullName avatar username')
            .select('store_name store_logo store_description contact_phone contact_email rating status')
            .lean();

        if (!storeInfo) {
            return res.status(404).json(
                formatResponse(false, {}, 'Store không tồn tại')
            );
        }

        if (storeInfo.status !== 'active') {
            return res.status(403).json(
                formatResponse(false, {}, 'Store hiện không hoạt động')
            );
        }

        // Lấy thông tin customer
        const senderInfo = await Customer.findById(customerId)
            .select('fullName avatar username')
            .lean();

        // Lấy lịch sử chat (nếu có)
        const chatHistory = await Messenger.getConversationMessages(customerId, storeId);

        // Đánh dấu tin nhắn đã đọc
        const conversationId = Messenger.generateConversationId(customerId, storeId);
        await Messenger.markAsRead(conversationId, customerId);

        res.json(formatResponse(true, {
            storeInfo: {
                _id: storeInfo._id,
                store_name: storeInfo.store_name,
                store_logo: storeInfo.store_logo,
                store_description: storeInfo.store_description,
                contact_phone: storeInfo.contact_phone,
                contact_email: storeInfo.contact_email,
                rating: storeInfo.rating,
                owner: storeInfo.owner_id
            },
            chatHistory: chatHistory.reverse(), // Reverse để hiển thị tin nhắn cũ nhất trước
            senderInfo,
            conversationId
        }, 'Lấy thông tin chat thành công'));

    } catch (error) {
        console.error('Error in getMessengerInfo:', error);
        res.status(500).json(
            formatResponse(false, {}, 'Lỗi server khi lấy thông tin chat')
        );
    }
});

// Gửi tin nhắn
const sendMessage = asyncHandler(async (req, res) => {
    const { storeId, content, messageType = 'text', image } = req.body;
    const customerId = req.user._id;

    try {
        // Validate input
        if (!content && !image) {
            return res.status(400).json(
                formatResponse(false, {}, 'Nội dung tin nhắn không được để trống')
            );
        }

        // Kiểm tra store tồn tại
        const store = await Store.findById(storeId);
        if (!store) {
            return res.status(404).json(
                formatResponse(false, {}, 'Store không tồn tại')
            );
        }

        // Tạo tin nhắn mới
        const conversationId = Messenger.generateConversationId(customerId, storeId);

        const newMessage = new Messenger({
            conversation_id: conversationId,
            customer_id: customerId,
            store_id: storeId,
            sender_id: customerId,
            sender_type: 'customer',
            message_type: messageType,
            content: content || '',
            image: image || null,
            status: 'sent'
        });

        await newMessage.save();

        // Populate thông tin sender
        await newMessage.populate('sender_id', 'fullName avatar username');

        res.json(formatResponse(true, {
            message: newMessage
        }, 'Gửi tin nhắn thành công'));

    } catch (error) {
        console.error('Error in sendMessage:', error);
        res.status(500).json(
            formatResponse(false, {}, 'Lỗi server khi gửi tin nhắn')
        );
    }
});

// Lấy lịch sử tin nhắn (phân trang)
const getMessageHistory = asyncHandler(async (req, res) => {
    const { storeId } = req.params;
    const customerId = req.user._id;
    const { page = 1, limit = 50 } = req.query;

    try {
        const messages = await Messenger.getConversationMessages(
            customerId,
            storeId,
            parseInt(page),
            parseInt(limit)
        );

        // Đếm tổng số tin nhắn
        const conversationId = Messenger.generateConversationId(customerId, storeId);
        const totalMessages = await Messenger.countDocuments({ conversation_id: conversationId });

        res.json(formatResponse(true, {
            messages: messages.reverse(),
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalMessages / parseInt(limit)),
                totalMessages,
                hasNextPage: parseInt(page) * parseInt(limit) < totalMessages
            }
        }, 'Lấy lịch sử tin nhắn thành công'));

    } catch (error) {
        console.error('Error in getMessageHistory:', error);
        res.status(500).json(
            formatResponse(false, {}, 'Lỗi server khi lấy lịch sử tin nhắn')
        );
    }
});

// Đánh dấu tin nhắn đã đọc
const markMessagesAsRead = asyncHandler(async (req, res) => {
    const { storeId } = req.params;
    const customerId = req.user._id;

    try {
        const conversationId = Messenger.generateConversationId(customerId, storeId);
        const result = await Messenger.markAsRead(conversationId, customerId);

        res.json(formatResponse(true, {
            modifiedCount: result.modifiedCount
        }, 'Đánh dấu tin nhắn đã đọc thành công'));

    } catch (error) {
        console.error('Error in markMessagesAsRead:', error);
        res.status(500).json(
            formatResponse(false, {}, 'Lỗi server khi đánh dấu tin nhắn đã đọc')
        );
    }
});

// Lấy danh sách cuộc trò chuyện của customer
const getConversationList = asyncHandler(async (req, res) => {
    const customerId = req.user._id;

    try {
        // Aggregate để lấy tin nhắn cuối cùng của mỗi cuộc trò chuyện
        const conversations = await Messenger.aggregate([
            { $match: { customer_id: customerId } },
            { $sort: { created_at: -1 } },
            {
                $group: {
                    _id: '$store_id',
                    lastMessage: { $first: '$$ROOT' },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ['$is_read', false] },
                                        { $ne: ['$sender_id', customerId] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            { $sort: { 'lastMessage.created_at': -1 } }
        ]);

        // Populate thông tin store
        const conversationList = await Promise.all(
            conversations.map(async (conv) => {
                const store = await Store.findById(conv._id)
                    .select('store_name store_logo rating')
                    .lean();

                return {
                    store,
                    lastMessage: conv.lastMessage,
                    unreadCount: conv.unreadCount
                };
            })
        );

        res.json(formatResponse(true, {
            conversations: conversationList
        }, 'Lấy danh sách cuộc trò chuyện thành công'));

    } catch (error) {
        console.error('Error in getConversationList:', error);
        res.status(500).json(
            formatResponse(false, {}, 'Lỗi server khi lấy danh sách cuộc trò chuyện')
        );
    }
});

module.exports = {
    getMessengerInfo,
    sendMessage,
    getMessageHistory,
    markMessagesAsRead,
    getConversationList
};