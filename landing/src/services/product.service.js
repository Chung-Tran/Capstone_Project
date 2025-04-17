import axiosClient from "../config/axios";

const handleResponse = (response) => {
    if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Yêu cầu không thành công');
    }
    return response.data;
};

const handleError = (error) => {
    if (error.response) {
        const { status, data } = error.response;
        const message = data?.message || `Lỗi server: ${status}`;
        const isSuccess = data?.isSuccess ?? false;
        return { message, isSuccess, status };
    } else if (error.request) {
        return { message: 'Không nhận được phản hồi từ server', isSuccess: false, status: null };
    } else {
        return { message: error.message || 'Lỗi không xác định', isSuccess: false, status: null };
    }
};

const productService = {
    product_create: async (productData) => {
        try {
            const response = await axiosClient.post('/products', productData);
            return handleResponse(response);
        } catch (error) {
            const errorInfo = handleError(error);
            throw new Error(errorInfo.message);
        }
    },
    product_update: async (id, productData) => {
        try {
            const response = await axiosClient.put(`/products/${id}`, productData);
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
};

export default productService;