const cron = require('node-cron');
const { AI_Service } = require('../services/AI-Service');

// Cron mỗi tháng 1 lần (ngày 1 lúc 02:00 sáng)
const startEventCategoryCron = () => {
    cron.schedule('0 2 1 * *', async () => {
        await AI_Service.predictCategories();
        console.log('✅ Đã dự đoán các danh mục sản phẩm nổi bật theo sự kiện trong tháng.');
    });
};

module.exports = startEventCategoryCron;
