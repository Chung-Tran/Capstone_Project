import { handleError, handleResponse } from "../common/methodsCommon";
import axiosClient from "../config/axios";

const notificationService = {

    getnotiCreatedByAI: async (id) => {
        try {
            const response = await axiosClient.get(`/notifications/created-by-ai`);
            const result = handleResponse(response);
            return result;
        } catch (error) {
            console.error(`Error fetching store id: ${id}`, error);
            throw handleError(error);
        }
    },
    markNotificationAsRead: async (id) => {
        try {
            const response = await axiosClient.put(`/notifications/${id}/read`);
            const result = handleResponse(response);
            return result;
        } catch (error) {
            console.error(`Error fetching store id: ${id}`, error);
            throw handleError(error);
        }
    },

};

export default notificationService;