import { handleError, handleResponse } from "../common/methodsCommon";
import axiosClient from "../config/axios";

const cache = {};

const shopService = {
    update_shop_info: async (shopData) => {
        try {
            const response = await axiosClient.put('/customers/shop', shopData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return handleResponse(response);
        } catch (error) {
            throw handleError(error);
        }
    },
    
    getShopById: async (id) => {
        const cacheKey = `store_${id}`;
        if (cache[cacheKey]) {
            console.log(`Returning cached data for store id: ${id}`);
            return cache[cacheKey];
        }

        try {
            console.log(`Fetching store data for id: ${id}`);
            const response = await axiosClient.get(`/products/store/${id}`);
            const result = handleResponse(response);
            
            if (result.isSuccess) {
                cache[cacheKey] = result;
            }
            
            return result;
        } catch (error) {
            console.error(`Error fetching store id: ${id}`, error);
            throw handleError(error);
        }
    },

    getShopProducts: async (shopId, params = {}) => {
        const cacheKey = `products_${shopId}_${JSON.stringify(params)}`;
        
        try {
            console.log(`Fetching products for shop id: ${shopId}`, params);
            const queryParams = new URLSearchParams();
            
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    queryParams.append(key, value);
                }
            });
            
            const queryString = queryParams.toString();
            const url = `/products?store_id=${shopId}${queryString ? `&${queryString}` : ''}`;
            
            const response = await axiosClient.get(url);
            const result = handleResponse(response);
            
            if (result.isSuccess) {
                cache[cacheKey] = result;
            }
            
            return result;
        } catch (error) {
            console.error(`Error fetching products for shop id: ${shopId}`, error);
            throw handleError(error);
        }
    },
    
    followShop: async (storeId) => {
    try {
      const response = await axiosClient.post(`/follow/${storeId}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi theo dõi cửa hàng với ID: ${storeId}`, error);
      return {
        isSuccess: false,
        message: error.response?.data?.message || 'Lỗi khi theo dõi cửa hàng',
        status: error.response?.status,
      };
    }
  },

  unfollowShop: async (storeId) => {
    try {
      const response = await axiosClient.delete(`/follow/${storeId}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi bỏ theo dõi cửa hàng với ID: ${storeId}`, error);
      return {
        isSuccess: false,
        message: error.response?.data?.message || 'Lỗi khi bỏ theo dõi cửa hàng',
        status: error.response?.status,
      };
    }
  },

  checkFollowStatus: async (storeId) => {
    try {
      const response = await axiosClient.get(`/follow/${storeId}/status`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi kiểm tra trạng thái theo dõi cho cửa hàng với ID: ${storeId}`, error);
      return {
        isSuccess: false,
        message: error.response?.data?.message || 'Lỗi khi kiểm tra trạng thái theo dõi',
        status: error.response?.status,
     };
    }
  },
};

export default shopService;