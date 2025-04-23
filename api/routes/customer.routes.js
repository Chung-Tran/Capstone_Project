const express = require('express');
const router = express.Router();
const { CustomerController } = require('../controllers/customer.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Cấu hình upload nhiều file
const multiUpload = upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'store_logo', maxCount: 1 },
    { name: 'store_banner', maxCount: 1 },
]);

router.post('/register-send-otp', CustomerController.sendRegistrationOTP);
router.post('/register', multiUpload, CustomerController.registerCustomer);
router.post('/login', CustomerController.loginCustomer);
router.post('/store', authMiddleware, CustomerController.registerStore);


router.get('/profile/:id', authMiddleware, CustomerController.getCustomerProfile);
router.get('/shop-info', authMiddleware, CustomerController.getShopInfo);
router.get('/account-info', authMiddleware, CustomerController.getAccountInfo);


router.put('/shop', authMiddleware, multiUpload, CustomerController.updateShopInfo);
router.put('/save-voucher', authMiddleware, CustomerController.saveVoucher);
router.put('/:id', authMiddleware, multiUpload, CustomerController.updateCustomerProfile);

router.patch('/update-password', authMiddleware, CustomerController.updatePassword);

module.exports = router; 