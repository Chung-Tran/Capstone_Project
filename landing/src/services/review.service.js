import { handleError, handleResponse } from '../common/methodsCommon';
import axiosClient from '../config/axios';

const reviewService = {
    get_product_review: async (id, { limit, skip }) => {
        try {
            console.log(`Calling API: /reviews/product/${id} with params:`, { limit, skip });
            const response = await axiosClient.get(`/reviews/product/${id}`, {
                params: { limit, skip },
            });
            console.log('Raw API response:', response);
            const processedResponse = handleResponse(response);
            console.log('Processed response:', processedResponse);
            return processedResponse;
        } catch (error) {
            console.error('API error:', error);
            const errorInfo = handleError(error);
            console.error('Detailed error:', errorInfo);
            throw new Error(errorInfo.message || 'Không thể lấy dữ liệu đánh giá');
        }
    },
    post_product_review: async (formData) => {
        try {
            const response = await axiosClient.post(`/reviews`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return handleResponse(response);
        } catch (error) {
            const errorInfo = handleError(error);
            throw new Error(errorInfo.message || 'Không thể gửi đánh giá');
        }
    },
    reply_product_review: async (reviewId, content) => {
        try {
            if (!reviewId || !content) {
                throw new Error('reviewId và content không được để trống');
            }
            console.log(`Replying to review ${reviewId} with content:`, content);
            const response = await axiosClient.post(`/reviews/${reviewId}/reply`, { content }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            console.log('Reply response:', response.data);
            const processedResponse = handleResponse(response);
            if (!processedResponse.success) {
                throw new Error(processedResponse.message || 'Phản hồi thất bại');
            }
            return processedResponse;
        } catch (error) {
            console.error('Reply error:', error);
            const errorInfo = handleError(error);
            console.log('Error info:', errorInfo);
            throw Object.assign(new Error(errorInfo.message || 'Không thể gửi phản hồi'), { status: errorInfo.status });
        }
    },
    getProductListAndReviewsByStoreId: async (storeId, { limit, skip }) => {
        try {
            const response = await axiosClient.get(`reviews/store/${storeId}/products`, {
                params: { limit, skip },
            });
            return handleResponse(response);
        } catch (error) {
            const errorInfo = handleError(error);
            throw new Error(errorInfo.message || 'Không thể lấy danh sách sản phẩm và đánh giá');
        }
    },
    getProductListAndReviewsByIds: async (reviewIds) => {
        try {
            const response = await axiosClient.post('/reviews/by-ids', {
                review_ids: reviewIds
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching reviews by IDs:', error);
            throw error;
        }
    },
};

export default reviewService;