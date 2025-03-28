const express = require('express');
const router = express.Router();
const { CustomerController } = require('../controllers/customer.controller');
const { protect } = require('../middlewares/auth');

router.post('/register', CustomerController.registerCustomer);
router.post('/login', CustomerController.loginCustomer);
router.post('/store', protect, CustomerController.registerStore);
router.get('/profile/:id', protect, CustomerController.getCustomerProfile);
router.put('/profile/:id', protect, CustomerController.updateCustomerProfile);

module.exports = router; 