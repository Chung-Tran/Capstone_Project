import axiosClient from "../config/axios";

const handleResponse = (response) => {
    if (!response.data.isSuccess) {
        throw new Error({ message: response.data.message, isSuccess: response.data.success });
    }
    return response.data;
};

const handleError = (error) => {
    const { status, data } = error.response;
    const { message, isSuccess } = data;
    return { message, isSuccess, status };
}

const productService = {
    product_create: async (productData) => {
        try {
            const response = await axiosClient.post('/products/', productData);
            return handleResponse(response);
        } catch (error) {
            throw handleError(error);
        }
    },
    getAllProducts: async () => {
        try {
            const response = await axiosClient.get('/products/store');
            return handleResponse(response);
        } catch (error) {
            throw handleError(error);
        }
    },
}

export default productService;