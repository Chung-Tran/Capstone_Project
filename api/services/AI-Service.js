const axios = require('axios');
const mongoose = require('mongoose');
const UserAction = require('../models/userAction.model');
const Notification = require('../models/notification.model');
const { log_action_type } = require('../common/Constant');

const LOG_API_URL = 'http://localhost:8080/api'; // Cấu hình host Python

const analyzeWeeklyComments = async () => {
    try {

        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // 1. Lấy các store_id có action_type là 'comment' trong 7 ngày qua
        const commentActions = await UserAction.find({
            action_type: log_action_type.COMMENT,
            // created_at: { $gte: sevenDaysAgo },
            store_id: { $exists: true }
        }).distinct('store_id'); // chỉ lấy danh sách store_id duy nhất

        if (commentActions.length === 0) {
            console.log('Không có store nào có bình luận trong tuần qua.');
            return;
        }

        // 2. Gửi danh sách store_id sang Python
        const response = await axios.post(`${LOG_API_URL}/reviews/analyze`, {
            store_ids: commentActions
        });

        // 3. Xử lý kết quả trả về: [{ store_id, negative_comments: [ { content, sentiment, ... } ] }]
        if (response.status === 200 && Array.isArray(response.data)) {
            const analyzedResults = response.data;

            for (const storeData of analyzedResults) {
                const { store_id, negative_comments } = storeData;
                const negative_comment_ids = negative_comments?.map(item => item._id)
                if (negative_comments?.length > 0) {
                    await Notification.create({
                        store_id: new mongoose.Types.ObjectId(store_id),
                        customer_id: new mongoose.Types.ObjectId(negative_comments.customer_id),
                        product_id: new mongoose.Types.ObjectId(negative_comments.product_id),
                        type: 'negative_comments',
                        title: 'Bình luận tiêu cực trong tuần qua',
                        content: `Bạn có ${negative_comments.length} bình luận tiêu cực.`,
                        data: negative_comments, // nếu cần chi tiết từng comment
                        is_created_by_ai: true,
                        negative_comment_ids: negative_comment_ids,
                        created_at: new Date()
                    });

                    console.log(`→ Thông báo đã gửi cho store ${store_id}: ${negative_comments.length} comment tiêu cực.`);
                }
            }
        } else {
            console.error('❌ Python service trả về không hợp lệ:', response.data);
        }
    } catch (error) {
        console.error('❌ Lỗi khi xử lý bình luận tiêu cực:', error.message);
    }
};
const predictCategories = async (req, res) => {
    try {
        const response = await axios.post(`${LOG_API_URL}/predict/event_categories`, {
            period: 100,
            top_n: 20,
        });

        if (response.status === 200 && Array.isArray(response.data)) {
            const analyzedResults = response.data;
            // Gộp các categories theo event
            const groupedData = analyzedResults.map(item => {
                return {
                    event: `${item.event}`,
                    categories: item.categories,
                    frequency: item.frequency,
                };
            });

            const data = await Notification.create({
                type: 'upcoming_events',
                title: 'Sản phẩm dự đoán sẽ nổi bật trong thời gian tới',
                content: 'Các danh mục sản phẩm dự đoán sẽ nổi bật theo sự kiện trong thời gian tới.',
                data: groupedData, // Danh sách event -> categories
                is_created_by_ai: true,
                created_at: new Date()
            });
            return res.status(200).json(data);
        } else {
            console.error('❌ Python service trả về không hợp lệ:', response.data);
            res.status(500).json({ message: 'Invalid response from prediction service' });
        }
    } catch (error) {
        console.error('❌ Lỗi khi gọi predict event_categories:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    AI_Service: {
        analyzeWeeklyComments,
        predictCategories,
    }
};
