const asyncHandler = require('express-async-handler');
const Notification = require('../models/notification.model');
const Store = require('../models/store.model');
const formatResponse = require('../middlewares/responseFormat');

const createNotification = asyncHandler(async (req, res) => {
    const { customer_id, type, title, content, order_id, product_id } = req.body;

    const notification = await Notification.create({
        customer_id,
        type,
        title,
        content,
        order_id,
        product_id
    });

    if (notification) {
        res.status(201).json(formatResponse(true, {
            _id: notification._id,
            title: notification.title,
            type: notification.type
        }, 'Notification created successfully'));
    } else {
        res.status(400);
        throw new Error('Invalid notification data');
    }
});

const getCustomerNotifications = asyncHandler(async (req, res) => {
    const customer_id = req.user.id;
    const notifications = await Notification.find({ customer_id })
        .sort({ created_at: -1 });

    if (notifications) {
        res.json(formatResponse(true, notifications, 'Notifications retrieved successfully'));
    } else {
        res.status(404);
        throw new Error('No notifications found');
    }
});
const getNotificationCreatedByAI = asyncHandler(async (req, res) => {
    const customer_id = req.user.id;
    const store = await Store.find({
        owner_id: customer_id
    })
    if (!store) {
        res.json(formatResponse(true, [], 'Store not exist'));
    }
    const notifications = await Notification.find({
        store_id: store._id,
        is_created_by_ai: true,
        is_read: false
    })
        .sort({ created_at: -1 });

    if (notifications) {
        res.json(formatResponse(true, notifications, 'Notifications retrieved successfully'));
    } else {
        res.status(404);
        throw new Error('No notifications found');
    }
});

const markNotificationAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findOne({
        _id: req.params.id,
    });

    if (notification) {
        notification.is_read = true;
        await notification.save();
        res.json(formatResponse(true, null, 'Notification marked as read'));
    } else {
        res.status(404);
        throw new Error('Notification not found');
    }
});

const deleteNotification = asyncHandler(async (req, res) => {
    const notification = await Notification.findOne({
        _id: req.params.id,
        customer_id: req.user.id
    });

    if (notification) {
        await notification.remove();
        res.json(formatResponse(true, null, 'Notification deleted successfully'));
    } else {
        res.status(404);
        throw new Error('Notification not found');
    }
});

module.exports = {
    NotificationController: {
        createNotification,
        getCustomerNotifications,
        markNotificationAsRead,
        deleteNotification,
        getNotificationCreatedByAI,
    }
}; 