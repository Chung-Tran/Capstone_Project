import axios from 'axios';

const axiosLogger = axios.create({
    baseURL: process.env.REACT_APP_API_LOGGER_URL + "/api",
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json'
    }
});

const create_logger = async (logInfo) => {
    const logRequest = {
        customer_id: logInfo.customer_id || null,
        action_type: logInfo.action_type,
        product_id: logInfo.product_id || null,
        store_id: logInfo.store_id || null,
        category: logInfo.categories?.toString() || "",
        priceRange: logInfo.priceRange || "",
        keyword: logInfo.keyword || "",
        description: logInfo.description || "",
        created_at: new Date().toISOString(),
    };
    try {
        const response = await axiosLogger.post('/log-action', logRequest);
        return response.data;
    } catch (error) {
        console.error('Error creating log:', error);
    }
}
export default create_logger;