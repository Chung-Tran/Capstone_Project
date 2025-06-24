import { handleError, handleResponse } from "../common/methodsCommon";
import axiosClient from "../config/axios";

const messengerService = {
    // Lấy thông tin chat khi khách hàng nhắn tin lần đầu
    getMessengerInfo: async (storeId) => {
        try {
            const response = await axiosClient.get(`/messenger/${storeId}`);
            return handleResponse(response);
        } catch (error) {
            throw handleError(error);
        }
    },

    // Gửi tin nhắn
    sendMessage: async (messageData) => {
        try {
            const response = await axiosClient.post('/messenger/send', messageData);
            return handleResponse(response);
        } catch (error) {
            throw handleError(error);
        }
    },

    // Lấy lịch sử tin nhắn (phân trang)
    getMessageHistory: async (storeId, page = 1, limit = 50) => {
        try {
            const response = await axiosClient.get(`/messenger/${storeId}/history`, {
                params: { page, limit }
            });
            return handleResponse(response);
        } catch (error) {
            throw handleError(error);
        }
    },

    // Đánh dấu tin nhắn đã đọc
    markMessagesAsRead: async (storeId) => {
        try {
            const response = await axiosClient.put(`/messenger/${storeId}/read`);
            return handleResponse(response);
        } catch (error) {
            throw handleError(error);
        }
    },

    // Lấy danh sách cuộc trò chuyện của customer
    getConversationList: async () => {
        try {
            const response = await axiosClient.get('/messenger');
            return handleResponse(response);
        } catch (error) {
            throw handleError(error);
        }
    }
};

export default messengerService;