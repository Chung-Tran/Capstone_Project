import { handleError, handleResponse } from '../common/methodsCommon';
import axiosClient from '../config/axios';

const orderService = {
    create_order: async (orderData) => {
        try {
            const response = await axiosClient.post(`/orders`, orderData);
            return handleResponse(response);
        } catch (error) {
            const errorInfo = handleError(error);
            throw new Error(errorInfo.message || 'Không thể lấy dữ liệu đánh giá');
        }
    },
    create_payment_url: async (orderData) => {
        try {
            const response = await axiosClient.post(`/payment/create-payment-url`, orderData);
            return handleResponse(response);
        } catch (error) {
            const errorInfo = handleError(error);
            throw new Error(errorInfo.message || 'Không thể lấy dữ liệu đánh giá');
        }
    },
    check_payment_status: async (transactionId) => {
        try {
            const response = await axiosClient.get(`/payment/check_payment_status/${transactionId}`);
            return handleResponse(response);
        } catch (error) {
            const errorInfo = handleError(error);
            throw new Error(errorInfo.message || 'Không thể lấy dữ liệu đánh giá');
        }
    },
};

export default orderService;