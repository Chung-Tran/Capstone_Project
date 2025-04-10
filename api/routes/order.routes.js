const express = require('express');
const router = express.Router();
const { OrderController } = require('../controllers/order.controller');
const authMiddleware = require('../middlewares/authMiddleware');


router.post('/', authMiddleware, OrderController.createOrder);
router.get('/', authMiddleware, OrderController.getOrders);
router.get('/:id', authMiddleware, OrderController.getOrderById);
router.put('/:id/status', authMiddleware, OrderController.updateOrderStatus);

module.exports = router; 