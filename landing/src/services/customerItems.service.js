import { handleError, handleResponse } from "../common/methodsCommon";
import axiosClient from "../config/axios";

const customerItemsService = {
    addItem: async (itemInfo) => {
        try {
            const response = await axiosClient.post('/customer-items', itemInfo);
            return handleResponse(response);
        } catch (error) {
            throw handleError(error);
        }
    },
    get_wishlist_items: async () => {
        try {
            const response = await axiosClient.get('/customer-items/wishlist');
            return handleResponse(response);
        } catch (error) {
            throw handleError(error);
        }
    },
    get_cart_items: async () => {
        try {
            const response = await axiosClient.get('/customer-items/cart');
            return handleResponse(response);
        } catch (error) {
            throw handleError(error);
        }
    },
    addToCart: async (itemInfo) => {
        try {
            const response = await axiosClient.post('/customer-items', itemInfo);
            return handleResponse(response);
        } catch (error) {
            throw handleError(error);
        }
    },
    removeItem: async (itemId) => {
        try {
            const response = await axiosClient.delete(`/customer-items/wishlist/${itemId}`);
            return handleResponse(response);
        } catch (error) {
            throw handleError(error);
        }
    },

}

export default customerItemsService;