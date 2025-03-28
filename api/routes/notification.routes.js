const express = require('express');
const router = express.Router();
const { NotificationController } = require('../controllers/notification.controller');
const { protect } = require('../middlewares/auth');

router.post('/', protect, NotificationController.createNotification);
router.get('/', protect, NotificationController.getCustomerNotifications);
router.put('/:id/read', protect, NotificationController.markNotificationAsRead);
router.delete('/:id', protect, NotificationController.deleteNotification);

module.exports = router; 