const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
    try {
        // Lấy token từ header
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            res.status(401);
            throw new Error('Không tìm thấy token xác thực');
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Gán thông tin user vào request để sử dụng ở các middleware tiếp theo
        req.user = decoded;

        next();
    } catch (error) {
        res.status(401);
        next(error);
    }
};

module.exports = authMiddleware; 