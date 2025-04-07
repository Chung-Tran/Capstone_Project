import { handleError, handleResponse } from "../common/methodsCommon";
import axiosClient from "../config/axios";

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
}

export default shopService;