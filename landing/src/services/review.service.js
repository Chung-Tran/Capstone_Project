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
      console.log(`Replying to review ${reviewId} with content:`, content);
      const response = await axiosClient.post(`/reviews/${reviewId}/reply`, { content }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Reply response:', response);
      return handleResponse(response);
    } catch (error) {
      console.error('Reply error:', error);
      const errorInfo = handleError(error);
      throw new Error(errorInfo.message || 'Không thể gửi phản hồi');
    }
  },
};

export default reviewService;