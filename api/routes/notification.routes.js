const express = require('express');
const router = express.Router();
const { NotificationController } = require('../controllers/notification.controller');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, NotificationController.createNotification);
router.put('/:id/read', authMiddleware, NotificationController.markNotificationAsRead);
router.get('/created-by-ai', authMiddleware, NotificationController.getNotificationCreatedByAI);
router.get('/customer', authMiddleware, NotificationController.getCustomerNotifications);
router.delete('/:id', authMiddleware, NotificationController.deleteNotification);

module.exports = router; 