const express = require('express');
const router = express.Router();
const { DashboardController } = require('../controllers/dashboard.controller');
const authMiddleware = require('../middlewares/authMiddleware');

// Lấy thống kê tổng quan
router.get("/summary", authMiddleware, DashboardController.getDashboardSummary);

// Lấy doanh thu theo thời gian
router.get("/revenue", authMiddleware, DashboardController.getRevenueOverTime);

// Lấy thống kê đơn hàng theo thời gian
router.get("/orders", authMiddleware, DashboardController.getOrdersOverTime);

// Lấy sản phẩm bán chạy nhất
router.get("/top-products", authMiddleware, DashboardController.getTopSellingProducts);

// Lấy trạng thái đơn hàng
router.get("/order-status", authMiddleware, DashboardController.getOrderStatus);

// Lấy thống kê khách hàng
router.get("/customer-stats", authMiddleware, DashboardController.getCustomerStats);

module.exports = router;