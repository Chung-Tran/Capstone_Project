import { handleError, handleResponse } from "../common/methodsCommon";
import axiosClient from "../config/axios";

const reviewService = {
    get_product_review: async (id, { limit, skip }) => {
        try {
            const response = await axiosClient.get(`/reviews/product/${id}`, {
                params: {
                    limit: limit,
                    skip: skip
                }
            });
            return handleResponse(response);
        } catch (error) {
            const errorInfo = handleError(error);
            throw new Error(errorInfo.message);
        }
    },
    post_product_review: async (data) => {
        try {
            const response = await axiosClient.post(`/reviews`, data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return handleResponse(response);
        } catch (error) {
            const errorInfo = handleError(error);
            throw new Error(errorInfo.message);
        }
    },
};

export default reviewService;