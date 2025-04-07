const express = require('express');
const router = express.Router();
const { NotificationController } = require('../controllers/notification.controller');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, NotificationController.createNotification);
router.get('/', authMiddleware, NotificationController.getCustomerNotifications);
router.put('/:id/read', authMiddleware, NotificationController.markNotificationAsRead);
router.delete('/:id', authMiddleware, NotificationController.deleteNotification);

module.exports = router; 