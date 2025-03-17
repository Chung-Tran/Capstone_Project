const asyncHandler = require('express-async-handler');
const User = require('../models/user.model');

const registerUser = asyncHandler(async (req, res) => {
    const { fullname, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({
        fullname,
        email,
        password,
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            role: user.role,
            message: 'User registered successfully',
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        res.status(400);
        throw new Error('Invalid email or password');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
        res.status(400);
        throw new Error('Invalid email or password');
    }

    res.json({
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        message: 'Login successful',
    });
});

// @desc    Lấy thông tin người dùng
// @route   GET /api/users/profile/:id
// @access  Private (sẽ thêm middleware xác thực sau)
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');

    if (user) {
        res.json(user);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Cập nhật thông tin người dùng
// @route   PUT /api/users/profile/:id
// @access  Private (sẽ thêm middleware xác thực sau)
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.fullname = req.body.fullname || user.fullname;
        user.email = req.body.email || user.email;
        if (req.body.password) {
            user.password = req.body.password; // Mật khẩu sẽ được mã hóa tự động bởi middleware trong model
        }
        user.address = req.body.address || user.address;
        user.phone = req.body.phone || user.phone;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            fullname: updatedUser.fullname,
            email: updatedUser.email,
            role: updatedUser.role,
            address: updatedUser.address,
            phone: updatedUser.phone,
            message: 'User updated successfully',
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile,
};