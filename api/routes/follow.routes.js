const express = require('express');
const router = express.Router();
const { FollowController } = require('../controllers/follow.controller');
const authMiddleware = require('../middlewares/authMiddleware');

// Kiểm tra trạng thái theo dõi
router.get('/:storeId/status', authMiddleware, FollowController.checkFollowStatus);

// Follow một cửa hàng
router.post('/:storeId', authMiddleware, FollowController.followShop);

// Unfollow một cửa hàng
router.delete('/:storeId', authMiddleware, FollowController.unfollowShop);

module.exports = router;