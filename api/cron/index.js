const startCommentSentimentCron = require('./comment-sentiment.cron');
const startEventCategoryCron = require('./event-category.cron');

async function startCronJobs() {
    startCommentSentimentCron();
    startEventCategoryCron();
    console.log('✅ Cron jobs started.');
}

module.exports = startCronJobs;