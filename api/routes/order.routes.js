const express = require('express');
const router = express.Router();
const { OrderController } = require('../controllers/order.controller');
const authMiddleware = require('../middlewares/authMiddleware');


router.post('/', authMiddleware, OrderController.createOrder);
router.get('/customer-orders', authMiddleware, OrderController.getCustomerOrders);
router.get('/customer-orders/:orderId', authMiddleware, OrderController.getCustomerOrderDetail);

router.get('/store-orders/', authMiddleware, OrderController.getStoreOrders);
router.get('/store-orders/:orderId/', authMiddleware, OrderController.getStoreOrderDetail);
router.get('/:id', OrderController.getOrderById);
router.get('/', authMiddleware, OrderController.getOrders);
router.put('/:id/status', authMiddleware, OrderController.updateOrderStatus);

//Route customer
router.get('/customer', authMiddleware, OrderController.getCustomerOrders);


//Route admin


module.exports = router; 