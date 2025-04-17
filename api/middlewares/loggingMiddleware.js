const axios = require('axios');
const asyncHandler = require('express-async-handler');
/**
 * Middleware ghi log hành vi người dùng
 * @param {string} action_type - ví dụ: 'Search', 'Click', 'View'
 */
const logUserAction = asyncHandler(async (req, res, next) => {
    try {
        const { loggingPayload } = req.body
        const data = {
            customer_id: req.user?._id || '', // fallback
            action_type: loggingPayload?.action_type || 'Search',
            product_id: loggingPayload?.product_id || '',
            category: loggingPayload?.category || null,
            timestamp: Math.floor(Date.now() / 1000)
        };

        await axios.post(`${process.env.LOG_API_URL}/api/log-action`, data);
    } catch (error) {
        console.error('Error logging user action:', error.message);
    }

    next();
});

module.exports = logUserAction;
