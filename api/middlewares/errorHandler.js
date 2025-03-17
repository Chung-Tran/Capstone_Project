const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
    res.status(statusCode);
    res.json({
        message: err.message || 'Internal Server Error',
        stack: err.stack,
    });
};

module.exports = errorHandler;