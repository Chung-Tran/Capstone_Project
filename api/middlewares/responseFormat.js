const responseFormat = (req, res, next) => {
    res.success = (statusCode, message, data = null) => {
        res.status(statusCode).json({
            success: true,
            status: statusCode,
            message,
            data,
        });
    };

    res.error = (statusCode, message, error = null) => {
        res.status(statusCode).json({
            success: false,
            status: statusCode,
            message,
            error,
        });
    };

    next();
};

module.exports = responseFormat;