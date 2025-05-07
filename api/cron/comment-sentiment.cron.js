const Product = require('../models/product.model');
const { AI_Service } = require('../services/AI-Service');
const notificationService = require('../services/notification.service');

async function run(commentActions) {
    try {
        // Group comments theo store_id
        const groupedComments = commentActions.reduce((acc, comment) => {
            if (!acc[comment.store_id]) {
                acc[comment.store_id] = [];
            }
            acc[comment.store_id].push(comment);
            return acc;
        }, {});

        // Xử lý từng store_id
        for (const storeId in groupedComments) {
            const comments = groupedComments[storeId];

            // Tạo payload cho AI service
            const payload = {
                store_id: storeId,
                product_list: comments.map(comment => comment.product_id),
                log_date: comments[0].created_at // Lấy created_at của comment đầu tiên
            };

            // Gửi payload đến AI service để phân tích sentiment
            const sentimentResults = await AI_Service.analyzeComment(payload);

            // // Xử lý từng comment và gửi thông báo
            // for (const comment of comments) {
            //     // Query sản phẩm liên quan đến comment
            //     const product = await Product.getProductByComment(comment);

            //     if (product) {
            //         // Tìm sentiment result tương ứng với product_id
            //         const sentimentResult = sentimentResults.find(
            //             result => result.product_id === comment.product_id
            //         );

            //         // Gửi thông báo đến seller nếu có sentiment
            //         if (sentimentResult && sentimentResult.sentiment) {
            //             await notificationService.notifySeller({
            //                 sellerId: product.sellerId,
            //                 productId: product.id,
            //                 sentiment: sentimentResult.sentiment,
            //                 comment: comment.content
            //             });
            //         }
            //     }
            // }
        }

        console.log('Comment sentiment cron job completed.');
    } catch (error) {
        console.error('Error in comment sentiment cron job:', error);
    }
}

module.exports = { run };