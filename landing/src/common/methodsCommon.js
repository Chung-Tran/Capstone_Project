const handleResponse = (response) => {
    if (!response.data.isSuccess) {
        throw new Error({ message: response.data.message, isSuccess: response.data.success });
    }
    return response.data;
};

const handleError = (error) => {
    const { status, data } = error.response;
    const { message, isSuccess } = data;
    return { message, isSuccess, status };
}
const formatCurrency = (price) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
};
export { handleResponse, handleError, formatCurrency };