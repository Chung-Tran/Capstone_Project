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
        customer_id: logInfo.customer_id,
        action_type: logInfo.action_type,
        product_id: logInfo.product_id,
        category: logInfo?.category || "",
        keyword: logInfo?.keyword || "",
    };
    try {
        const response = await axiosLogger.post('/log-action', logRequest);
        return response.data;
    } catch (error) {
        console.error('Error creating log:', error);
    }
}
export default create_logger;