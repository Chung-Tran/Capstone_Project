const express = require('express');
const router = express.Router();
const { PaymentController } = require('../controllers/payment.controller');
const authMiddleware = require('../middlewares/authMiddleware');


router.get('/check_payment_status/:orderId', authMiddleware, PaymentController.checkTransactionStatus);
router.post('/callback', PaymentController.callback);
router.post('/create-payment-url', authMiddleware, PaymentController.createPayment);

module.exports = router; 