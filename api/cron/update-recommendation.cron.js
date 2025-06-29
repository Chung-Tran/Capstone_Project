const cron = require('node-cron');
const UserAction = require("../models/userAction.model");
const axios = require('axios');
const LOG_API_URL = process.env.LOG_API_URL || 'http://160.250.133.57:8080/api';

const startUpdateRecommendationCron = async () => {
    // chạy cron 10p 1 lần
    cron.schedule('*/10 * * * *', async () => {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const log = await UserAction.find({ timestamp: { $gte: fifteenMinutesAgo } }).lean();

    if (!log || log.length === 0) {
        console.log("Nothing in log, Skip cron");
        return;
    }

    // Sử dụng Set để loại bỏ trùng lặp user_id
    const userIdsSet = new Set(log.map((item) => item.customer_id.toString()));
    const userIds = Array.from(userIdsSet);
    if (userIds.length === 0) return;
    await axios.post(`${LOG_API_URL}/recommendation/batch-analyze`, {
        user_ids: userIds,
    });

    console.log('✅ Cron update dữ liệu hành vi người dùng thành công.');
    });
};

module.exports = startUpdateRecommendationCron;
