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

    get_orders: async () => {
        try {
            const response = await axiosClient.get(`/orders`);
            return handleResponse(response);
        } catch (error) {
            const errorInfo = handleError(error);
            throw errorInfo;
        }
    },

    get_customer_orders: async (params = {}) => {
        try {
            const queryParams = new URLSearchParams();
            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);
            if (params.status) queryParams.append('status', params.status);
            
            const url = `/orders/customer${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
            const response = await axiosClient.get(url);
            return handleResponse(response);
        } catch (error) {
            const errorInfo = handleError(error);
            throw errorInfo;
        }
    },

    get_order_by_id: async (orderId) => {
        if (!orderId) {
            throw new Error('Order ID is required');
        }
        try {
            const response = await axiosClient.get(`/orders/${orderId}`);
            return handleResponse(response);
        } catch (error) {
            const errorInfo = handleError(error);
            throw errorInfo;
        }
    },

    cancel_order: async (orderId) => {
        if (!orderId) {
            throw new Error('Order ID is required');
        }
        try {
            const response = await axiosClient.put(`/orders/${orderId}/cancel`);
            return handleResponse(response);
        } catch (error) {
            const errorInfo = handleError(error);
            throw errorInfo;
        }
    },

    get_store: async (storeId) => {
        if (!storeId) {
            throw new Error('Store ID is required');
        }
        try {
            const response = await axiosClient.get(`/stores/${storeId}`);
            return handleResponse(response);
        } catch (error) {
            const errorInfo = handleError(error);
            throw errorInfo;
        }
    },
};

export default orderService;