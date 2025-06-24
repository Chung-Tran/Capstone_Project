import { handleError, handleResponse } from "../common/methodsCommon";
import axiosClient from "../config/axios";

// Cache object để lưu trữ response theo store id
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
        // Kiểm tra cache
        const cacheKey = `store_${id}`;
        if (cache[cacheKey]) {
            console.log(`Returning cached data for store id: ${id}`);
            return cache[cacheKey];
        }

        try {
            console.log(`Fetching store data for id: ${id}`);
            const response = await axiosClient.get(`/products/store/${id}`);
            const result = handleResponse(response);

            // Lưu vào cache nếu request thành công
            if (result.isSuccess) {
                cache[cacheKey] = result;
            }

            return result;
        } catch (error) {
            console.error(`Error fetching store id: ${id}`, error);
            throw handleError(error);
        }
    },

    // Thêm phương thức getShopProducts
    getShopProducts: async (shopId, params = {}) => {
        const cacheKey = `products_${shopId}_${JSON.stringify(params)}`;

        // Kiểm tra cache (tùy chọn - có thể bỏ cache cho products để luôn lấy dữ liệu mới)
        // if (cache[cacheKey]) {
        //     console.log(`Returning cached products for shop id: ${shopId}`);
        //     return cache[cacheKey];
        // }

        try {
            console.log(`Fetching products for shop id: ${shopId}`, params);
            const queryParams = new URLSearchParams();

            // Thêm các tham số tìm kiếm vào URL
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    queryParams.append(key, value);
                }
            });

            const queryString = queryParams.toString();
            const url = `/products?store_id=${shopId}${queryString ? `&${queryString}` : ''}`;

            const response = await axiosClient.get(url);
            const result = handleResponse(response);

            // Lưu vào cache nếu request thành công
            if (result.isSuccess) {
                cache[cacheKey] = result;
            }

            return result;
        } catch (error) {
            console.error(`Error fetching products for shop id: ${shopId}`, error);
            throw handleError(error);
        }
    },

    get_all_categories: async () => {
        try {
            const response = await axiosClient.get(`/categories`);
            const result = handleResponse(response);

            return result;
        } catch (error) {
            console.error(`Error fetching store id:`, error);
            throw handleError(error);
        }
    },
};

export default shopService;