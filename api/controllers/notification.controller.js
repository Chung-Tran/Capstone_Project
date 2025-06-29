const asyncHandler = require('express-async-handler');
const Notification = require('../models/notification.model');
const Store = require('../models/store.model');
const formatResponse = require('../middlewares/responseFormat');
const mongoose = require("mongoose");

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

    // 1. Kiểm tra xem user là chủ store nào không
    const store = await Store.findOne({ owner_id: customer_id });
    const noti = await Notification.find({ store_id: new mongoose.Types.ObjectId("685aa9d10d617373f5fddb25") });
    let notifications;
    if (store) {
        // 2. Nếu là chủ store → lấy noti theo store_id
        notifications = await Notification.find({ $or: [{ store_id: new mongoose.Types.ObjectId(store._id) }, { type: 'upcoming_events' }] })
            .sort({ _id: -1 });
    } else {
        // 3. Nếu là khách → lấy noti theo customer_id
        notifications = await Notification.find({ customer_id, is_created_by_ai: false })
            .sort({ _id: -1 });
    }

    // 4. Tính số lượng chưa đọc
    const unread_count = notifications.filter(noti => !noti.is_read).length;

    // 5. Trả về
    res.json(formatResponse(true, {
        data_list: notifications,
        unread_count
    }, 'Notifications retrieved successfully'));
});

const getNotificationCreatedByAI = asyncHandler(async (req, res) => {
    const customer_id = req.user.id;
    const store = await Store.findOne({
        owner_id: customer_id
    }).lean();
    if (!store) {
        res.json(formatResponse(true, [], 'Store not exist'));
    }
    const notifications = await Notification.find({
        $or: [{
            store_id: store._id,
            is_created_by_ai: true,
            is_read: false
        }, { type: 'upcoming_events' }]
    })
        .sort({ created_at: -1 }).lean();

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
const markAllAsRead = asyncHandler(async (req, res) => {
    const customer_id = req.user.id;

    const notifications = await Notification.find({ customer_id, is_read: false });

    if (notifications.length > 0) {
        await Notification.updateMany({ customer_id, is_read: false }, { is_read: true });
        res.json(formatResponse(true, null, 'All notifications marked as read'));
    } else {
        res.json(formatResponse(true, null, 'All notifications marked as read'));
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
        markAllAsRead
    }
}; 