const asyncHandler = require('express-async-handler');
const { verifyToken } = require('../services/jwtService');
const Customer = require('../models/customer.model');

const authMiddleware = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = verifyToken(token);

            // Get user from token
            const user = await Customer.findById(decoded.id).select('-password');
            if (!user) {
                res.status(401);
                throw new Error('User not found');
            }

            req.user = user;
            next();
        } catch (error) {
            res.status(401);
            throw new Error('Not authorized');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Phiên đăng nhập hết hạn');
    }
});

module.exports = authMiddleware; 