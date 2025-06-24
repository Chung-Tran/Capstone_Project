const cron = require('node-cron');
const { AI_Service } = require('../services/AI-Service');
// Cron mỗi tuần 1 lần (chủ nhật lúc 01:00 sáng)
const startCommentSentimentCron = () => {
    cron.schedule('0 1 * * 0', async () => {
        await AI_Service.analyzeWeeklyComments();
        console.log('✅ Đã phân tích bình luận trong tuần.');
    });
};

module.exports = startCommentSentimentCron;
