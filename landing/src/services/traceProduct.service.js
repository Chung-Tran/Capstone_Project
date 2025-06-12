import { handleError, handleResponse } from "../common/methodsCommon";
import axiosClient from "../config/axios";


const traceProductService = {
    addProductTrace: async (productData) => {
        try {
            const response = await axiosClient.post('/traceability/', productData);
            return handleResponse(response);
        } catch (error) {
            throw handleError(error);
        }
    },

    getProductTrace: async (id) => {

        try {
            const response = await axiosClient.get(`/traceability?productId=${id}`);
            const result = handleResponse(response);

            return result;
        } catch (error) {
            throw handleError(error);
        }
    },
};

export default traceProductService;