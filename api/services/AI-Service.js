const axios = require('axios');

async function analyzeComment(commentContent) {
    try {
        // Gửi request đến service Python để phân tích sentiment
        const response = await axios.post(`${LOG_API_URL}/reviews/analyze`, {
            "store_id": "1",
            "product_list": [
                "6802036eb679ab59636c5e05"
            ],
            "log_date": "2025-04-18T18:26:47.358+00:00"
        });
        if (response.status == 200) {
            return response.data;
        }
        return null;
    } catch (error) {
        console.error('Error call api sentences analyze:', error);
        return null;
    }
}

module.exports = {
    AI_Service: {
        analyzeComment
    }
};
