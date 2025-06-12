import { handleError, handleResponse } from "../common/methodsCommon";
import axiosClient from "../config/axios";

const dashboardService = {
    // Lấy thống kê tổng quan
    getSummary: async (timeRange = '6months') => {
        try {
            const response = await axiosClient.get("/dashboard/summary", {
                params: { timeRange }
            });
            return handleResponse(response);
        } catch (error) {
            throw handleError(error);
        }
    },

    // Lấy doanh thu theo thời gian
    getRevenueOverTime: async (type = 'month', timeRange = '6months') => {
        try {
            const response = await axiosClient.get("/dashboard/revenue", {
                params: { type, timeRange }
            });
            return handleResponse(response);
        } catch (error) {
            throw handleError(error);
        }
    },

    // Lấy thống kê đơn hàng theo thời gian
    getOrdersOverTime: async (type = 'month', timeRange = '6months') => {
        try {
            const response = await axiosClient.get("/dashboard/orders", {
                params: { type, timeRange }
            });
            return handleResponse(response);
        } catch (error) {
            throw handleError(error);
        }
    },

    // Lấy sản phẩm bán chạy nhất
    getTopSellingProducts: async (limit = 10, timeRange = '6months') => {
        try {
            const response = await axiosClient.get("/dashboard/top-products", {
                params: { limit, timeRange }
            });
            return handleResponse(response);
        } catch (error) {
            throw handleError(error);
        }
    },

    // Lấy trạng thái đơn hàng
    getOrderStatus: async (timeRange = '6months') => {
        try {
            const response = await axiosClient.get("/dashboard/order-status", {
                params: { timeRange }
            });
            return handleResponse(response);
        } catch (error) {
            throw handleError(error);
        }
    },

    // Lấy thống kê khách hàng
    getCustomerStats: async (timeRange = '6months') => {
        try {
            const response = await axiosClient.get("/dashboard/customer-stats", {
                params: { timeRange }
            });
            return handleResponse(response);
        } catch (error) {
            throw handleError(error);
        }
    }
};

export default dashboardService;