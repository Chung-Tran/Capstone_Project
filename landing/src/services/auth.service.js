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

const authService = {
    customer_login: async (customerData) => {
        try {
            const response = await axiosClient.post('/customers/login', customerData);
            return handleResponse(response);
        } catch (error) {
            throw handleError(error);
        }
    },
    customer_register: async (customerData) => {
        try {
            const response = await axiosClient.post('/customers/register', customerData);
            return handleResponse(response);
        } catch (error) {
            throw handleError(error);
        }
    },
    seller_register: async (sellerData) => {
        try {
            const response = await axiosClient.post('/customers/register', sellerData);
            return handleResponse(response);
        } catch (error) {
            throw handleError(error);
        }
    },
    customer_register_sent_otp: async (email) => {
        try {
            const response = await axiosClient.post('/customers/register-send-otp', { email });
            return handleResponse(response);
        } catch (error) {
            throw handleError(error);
        }
    },
    verify_otp: async (email, otp) => {
        try {
            const response = await axiosClient.post('/customers/verify-otp', { email, otp });
            return handleResponse(response);
        } catch (error) {
            throw handleError(error);
        }
    },
    get_shop_info: async () => {
        try {
            const response = await axiosClient.get('/customers/shop-info');
            return handleResponse(response);
        } catch (error) {
            throw handleError(error);
        }
    },
    get_account_info: async () => {
        try {
            const response = await axiosClient.get('/customers/account-info');
            return handleResponse(response);
        } catch (error) {
            throw handleError(error);
        }
    },
    update_customer_info: async (_id, customerInfo) => {
        try {
            const response = await axiosClient.put(`/customers/${_id}`, customerInfo, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return handleResponse(response);
        } catch (error) {
            throw handleError(error);
        }
    },
    update_account_password: async (data) => {
        try {
            const response = await axiosClient.patch('/customers/update-password', data);
            return handleResponse(response);
        } catch (error) {
            throw handleError(error);
        }
    },
    get_notifications: async () => {
        try {
            const response = await axiosClient.get('/notifications/customer');
            return handleResponse(response);
        } catch (error) {
            throw handleError(error);
        }
    },
}

export default authService;