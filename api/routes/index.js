const express = require('express');
const router = express.Router();

const userRoutes = require('./user.routes');
const productRoutes = require('./product.routes');
const customerRoutes = require('./customer.routes');
const categoryRoutes = require('./category.routes');
const orderRoutes = require('./order.routes');
const reviewRoutes = require('./review.routes');
const notificationRoutes = require('./notification.routes');
const customerItemsRoutes = require('./customerItems.routes');
const paymentRoutes = require('./payment.routes');
const providerRoutes = require('./provider.routes');
const dashboardRoutes = require('./dashboard.routes');
const messengerRoutes = require('./messenger.routes.js');

router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/customers', customerRoutes);
router.use('/categories', categoryRoutes);
router.use('/orders', orderRoutes);
router.use('/reviews', reviewRoutes);
router.use('/notifications', notificationRoutes);
router.use('/customer-items', customerItemsRoutes);
router.use('/payment', paymentRoutes);
router.use('/traceability', providerRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/messenger', messengerRoutes);

module.exports = router;