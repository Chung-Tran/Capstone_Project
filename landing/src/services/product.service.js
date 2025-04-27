import { handleError, handleResponse } from "../common/methodsCommon";
import axiosClient from "../config/axios";

const productService = {
    product_create: async (productData,) => {
        try {
            const response = await axiosClient.post('/products', productData, {
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
    product_update: async (id, productData) => {
        try {
            const response = await axiosClient.put(`/products/${id}`, productData, {
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
    getAllProducts: async () => {
        try {
            const response = await axiosClient.get('/products/store');
            return handleResponse(response);
        } catch (error) {
            const errorInfo = handleError(error);
            throw new Error(errorInfo.message);
        }
    },
    getProductById: async (id) => {
        try {
            const response = await axiosClient.get(`/products/${id}`);
            return handleResponse(response);
        } catch (error) {
            const errorInfo = handleError(error);
            throw new Error(errorInfo.message);
        }
    },
    product_delete: async (id) => {
        try {
            const response = await axiosClient.delete(`/products/${id}`);
            return handleResponse(response);
        } catch (error) {
            const errorInfo = handleError(error);
            throw new Error(errorInfo.message);
        }
    },
    product_featured: async (limit, skip) => {
        try {
            const response = await axiosClient.get(`/products/featured`, {
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
    product_news: async (limit, skip) => {
        try {
            const response = await axiosClient.get(`/products/new`, {
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
    product_search: async ({ limit, skip, slug, categories, keyword }) => {
        try {
            const rawParams = { limit, skip, slug, categories, keyword };
            const params = Object.fromEntries(
                Object.entries(rawParams).filter(([_, v]) => v !== undefined && v !== null && v !== '')
            );

            const response = await axiosClient.get(`/products/`, { params });
            return handleResponse(response);
        } catch (error) {
            const errorInfo = handleError(error);
            throw new Error(errorInfo.message);
        }
    },
};

export default productService;