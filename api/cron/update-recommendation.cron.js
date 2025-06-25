const cron = require('node-cron');
const { AI_Service } = require('../services/AI-Service');
const UserAction = require("../models/userAction.model");
const mongoose = require('mongoose'); // nếu cần

const startUpdateRecommendationCron = async () => {
    // chạy cron định kỳ mỗi ngày lúc 2h sáng
    cron.schedule('*/10 * * * *', async () => {
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
        const log = await UserAction.find({ created_at: { $gte: fifteenMinutesAgo } }).lean();

        if (!log || log.length === 0) {
            console.log("Nothing in log, Skip cron");
            return;
        }

        // Sử dụng Set để loại bỏ trùng lặp user_id
        const userIdsSet = new Set(log.map((item) => item.customer_id.toString()));
        const userIds = Array.from(userIdsSet);

        await axios.post(`${LOG_API_URL}/recommendation/batch-analyze`, {
            user_ids: userIds,
        });

        console.log('✅ Cron update dữ liệu hành vi người dùng thành công.');
    });
};

module.exports = startUpdateRecommendationCron;
