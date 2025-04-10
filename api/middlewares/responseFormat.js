const formatResponse = (isSuccess = true, data = null, message = 'Success', metadata = {}) => {
    return {
        isSuccess,
        message,
        data,
        metadata
    };
};

module.exports = formatResponse;