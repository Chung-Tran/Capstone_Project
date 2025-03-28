const express = require('express');
const router = express.Router();

const userRoutes = require('./user.routes');
const productRoutes = require('./product.routes');
const customerRoutes = require('./customer.routes');
const categoryRoutes = require('./category.routes');
const orderRoutes = require('./order.routes');
const reviewRoutes = require('./review.routes');
const promotionRoutes = require('./promotion.routes');
const notificationRoutes = require('./notification.routes');

router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/customers', customerRoutes);
router.use('/categories', categoryRoutes);
router.use('/orders', orderRoutes);
router.use('/reviews', reviewRoutes);
router.use('/promotions', promotionRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;