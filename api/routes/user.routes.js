const express = require('express');
const router = express.Router();

const {
    UserController
} = require('../controllers/user.controller');

router.post('/register', UserController.registerUser);
router.post('/login', UserController.loginUser);
router.get('/profile/:id', UserController.getUserProfile);
router.put('/profile/:id', UserController.updateUserProfile);

module.exports = router;