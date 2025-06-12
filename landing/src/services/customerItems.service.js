import { handleError, handleResponse } from "../common/methodsCommon";
import axiosClient from "../config/axios";
import create_logger from "../config/logger";

const customerItemsService = {
    addItem: async (itemInfo) => {
        try {
            const response = await axiosClient.post('/customer-items', itemInfo);
            create_logger({
                customer_id: localStorage.getItem('customer_id'),
                action_type: itemInfo?.type == 'cart' ? 'cart' : 'wishlist',
                product_id: itemInfo.product_id,
            })
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
            create_logger({
                customer_id: localStorage.getItem('customer_id'),
                action_type: itemInfo?.type == 'cart' ? 'cart' : 'wishlist',
                product_id: itemInfo.product_id,
                // keywords: product?.keywords,
            })
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
    removeCartItem: async (itemId) => {
        try {
            const response = await axiosClient.delete(`/customer-items/cart/${itemId}`);
            return handleResponse(response);
        } catch (error) {
            throw handleError(error);
        }
    },
    updateCartItemQuantity: async (itemId, quantity) => {
        try {
            const response = await axiosClient.put(`/customer-items/cart/${itemId}`, quantity);
            return handleResponse(response);
        } catch (error) {
            throw handleError(error);
        }
    },

}

export default customerItemsService;