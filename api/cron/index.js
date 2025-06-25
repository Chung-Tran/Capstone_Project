const startCommentSentimentCron = require('./comment-sentiment.cron');
const startEventCategoryCron = require('./event-category.cron');
const startUpdateRecommendationCron = require('./update-recommendation.cron');

async function startCronJobs() {
    startCommentSentimentCron();
    startEventCategoryCron();
    startUpdateRecommendationCron();
    console.log('✅ Cron jobs started.');
}

module.exports = startCronJobs;