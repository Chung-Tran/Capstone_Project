const express = require('express');
const router = express.Router();
const { OrderController } = require('../controllers/order.controller');
const { protect } = require('../middlewares/auth');

router.post('/', protect, OrderController.createOrder);
router.get('/', protect, OrderController.getOrders);
router.get('/:id', protect, OrderController.getOrderById);
router.put('/:id/status', protect, OrderController.updateOrderStatus);

module.exports = router; 