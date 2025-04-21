import { handleError, handleResponse } from "../common/methodsCommon";
import axiosClient from "../config/axios";

const voucherService = {
  createVoucher: async (voucherData) => {
    try {
      const response = await axiosClient.post("/vouchers", voucherData, {
        headers: {
          "Content-Type": "application/json", // Voucher không cần multipart/form-data
        },
      });
      return handleResponse(response);
    } catch (error) {
      const errorInfo = handleError(error);
      throw new Error(errorInfo.message);
    }
  },

  updateVoucher: async (id, voucherData) => {
    try {
      const response = await axiosClient.put(`/vouchers/${id}`, voucherData, {
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

  getAllVouchers: async () => {
    try {
      const response = await axiosClient.get("/vouchers");
      return handleResponse(response);
    } catch (error) {
      const errorInfo = handleError(error);
      throw new Error(errorInfo.message);
    }
  },

  getVoucherById: async (id) => {
    try {
      const response = await axiosClient.get(`/vouchers/${id}`);
      return handleResponse(response);
    } catch (error) {
      const errorInfo = handleError(error);
      throw new Error(errorInfo.message);
    }
  },

  voucher_delete: async (id) => {
    try {
        const response = await axiosClient.delete(`/voucher/${id}`);
        return handleResponse(response);
    } catch (error) {
        const errorInfo = handleError(error);
        throw new Error(errorInfo.message);
    }
  },
};

export default voucherService;