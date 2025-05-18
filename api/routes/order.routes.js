const express = require('express');
const router = express.Router();
const { OrderController } = require('../controllers/order.controller');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, OrderController.createOrder);
router.get('/', authMiddleware, OrderController.getOrders);
router.get('/customer', authMiddleware, OrderController.getCustomerOrders); // API mới thêm vào để khách hàng xem lịch sử đơn hàng
router.get('/:orderId', authMiddleware, OrderController.getOrderById);
router.put('/:orderId/status', authMiddleware, OrderController.updateOrderStatus);

module.exports = router;