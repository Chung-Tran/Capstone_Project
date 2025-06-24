const express = require('express');
const router = express.Router();
const {
    getMessengerInfo,
    sendMessage,
    getMessageHistory,
    markMessagesAsRead,
    getConversationList
} = require('../controllers/messenger.controller');
const authMiddleware = require('../middlewares/authMiddleware');


router.get('/:id', authMiddleware, getMessengerInfo);

router.post('/send', authMiddleware, sendMessage);

router.get('/:storeId/history', authMiddleware, getMessageHistory);

router.put('/:storeId/read', authMiddleware, markMessagesAsRead);

router.get('/', authMiddleware, getConversationList);

module.exports = router;