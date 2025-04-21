import { handleError, handleResponse } from "../common/methodsCommon";
import axiosClient from "../config/axios";

const flashSaleService = {
  registerFlashSale: async (flashSaleId, registrationData) => {
    try {
      const response = await axiosClient.post(`/flash-sales/${flashSaleId}/register`, registrationData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return handleResponse(response);
    } catch (error) {
      const errorInfo = handleError(error);
      throw new Error(errorInfo.message);
    }
  },

  getRegistrations: async (flashSaleId) => {
    try {
      const response = await axiosClient.get(`/flash-sales/${flashSaleId}/registrations`);
      return handleResponse(response);
    } catch (error) {
      const errorInfo = handleError(error);
      throw new Error(errorInfo.message);
    }
  },

  deleteRegistration: async (registrationId) => {
    try {
      const response = await axiosClient.delete(`/flash-sales/registrations/${registrationId}`);
      return handleResponse(response);
    } catch (error) {
      const errorInfo = handleError(error);
      throw new Error(errorInfo.message);
    }
  },

  getSellerProducts: async () => {
    try {
      const response = await axiosClient.get("/products/seller");
      return handleResponse(response);
    } catch (error) {
      const errorInfo = handleError(error);
      throw new Error(errorInfo.message);
    }
  },
};

export default flashSaleService;