const cron = require('node-cron');
const UserAction = require('./models/userAction.model');
const commentSentimentCron = require('./cron/comment-sentiment.cron');

// Khởi chạy tất cả các cron job
async function startCronJobs() {
    // Chạy cron job mỗi ngày lúc 00:00
    cron.schedule('0 0 * * *', async () => {
        try {
            console.log('Running cron jobs...');

            // Query tất cả log của ngày hôm qua và group theo action_type
            const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const startOfDay = new Date(yesterday.setHours(0, 0, 0, 0));
            const endOfDay = new Date(yesterday.setHours(23, 59, 59, 999));

            const groupedActions = await UserAction.getGroupedUserActions(startOfDay, endOfDay);

            // Truyền dữ liệu comment vào comment-sentiment cron
            const commentActions = groupedActions.find(group => group.action_type === 'comment')?.data || [];
            if (commentActions.length > 0) {
                await commentSentimentCron.run(commentActions);
            }

            console.log('All cron jobs completed.');
        } catch (error) {
            console.error('Error in cron jobs:', error);
        }
    });
}

startCronJobs();