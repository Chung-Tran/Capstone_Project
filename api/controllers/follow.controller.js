const asyncHandler = require('express-async-handler');
const Customer = require('../models/customer.model');
const Store = require('../models/store.model');
const formatResponse = require('../middlewares/responseFormat');
const mongoose = require('mongoose');

const followShop = asyncHandler(async (req, res) => {
    const { storeId } = req.params;
    const userId = req.user._id;

    if (!mongoose.isValidObjectId(storeId)) {
        return res.status(400).json(formatResponse(false, null, 'ID chủ cửa hàng không hợp lệ'));
    }

    const store = await Store.findOneAndUpdate(
        { 
            owner_id: storeId, 
            followers: { $ne: userId }
        },
        { $addToSet: { followers: userId } },
        { new: true, runValidators: true }
    );

    if (!store) {
        const exists = await Store.findOne({ owner_id: storeId });
        if (!exists) {
            console.log(`Không tìm thấy cửa hàng với owner_id: ${storeId}`);
            return res.status(404).json(formatResponse(false, null, `Không tìm thấy cửa hàng với owner_id: ${storeId}`));
        }
        return res.status(400).json(formatResponse(false, null, 'Bạn đã theo dõi cửa hàng này'));
    }

    res.status(200).json(formatResponse(true, {
        storeId: store._id,
        followersCount: store.followers.length,
        isFollowing: true
    }, 'Theo dõi cửa hàng thành công'));
});

const unfollowShop = asyncHandler(async (req, res) => {
    const { storeId } = req.params;
    const userId = req.user._id;

    if (!mongoose.isValidObjectId(storeId)) {
        return res.status(400).json(formatResponse(false, null, 'ID chủ cửa hàng không hợp lệ'));
    }

    const store = await Store.findOneAndUpdate(
        { 
            owner_id: storeId, 
            followers: userId
        },
        { $pull: { followers: userId } },
        { new: true, runValidators: true }
    );

    if (!store) {
        const exists = await Store.findOne({ owner_id: storeId });
        if (!exists) {
            console.log(`Không tìm thấy cửa hàng với owner_id: ${storeId}`);
            return res.status(404).json(formatResponse(false, null, `Không tìm thấy cửa hàng với owner_id: ${storeId}`));
        }
        return res.status(400).json(formatResponse(false, null, 'Bạn chưa theo dõi cửa hàng này'));
    }

    res.status(200).json(formatResponse(true, {
        storeId: store._id,
        followersCount: store.followers.length,
        isFollowing: false
    }, 'Bỏ theo dõi cửa hàng thành công'));
});

const checkFollowStatus = asyncHandler(async (req, res) => {
    const { storeId } = req.params;
    const userId = req.user._id;

    if (!mongoose.isValidObjectId(storeId)) {
        return res.status(400).json(formatResponse(false, null, 'ID chủ cửa hàng không hợp lệ'));
    }

    const store = await Store.findOne({ owner_id: storeId }).select('followers');
    if (!store) {
        console.log(`Không tìm thấy cửa hàng với owner_id: ${storeId}`);
        return res.status(404).json(formatResponse(false, null, `Không tìm thấy cửa hàng với owner_id: ${storeId}`));
    }

    const isFollowing = store.followers.includes(userId);
    res.status(200).json(formatResponse(true, {
        storeId: store._id,
        followersCount: store.followers.length,
        isFollowing
    }, 'Kiểm tra trạng thái theo dõi thành công'));
});

module.exports = {
    FollowController: {
        followShop,
        unfollowShop,
        checkFollowStatus
    }
};