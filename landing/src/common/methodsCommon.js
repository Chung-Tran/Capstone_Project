const handleResponse = (response) => {
    if (!response.data.isSuccess) {
        throw new Error(response.data.message || 'Yêu cầu không thành công');
    }
    return response.data;
};

const handleError = (error) => {
    if (error.response) {
        const { status, data } = error.response;
        const message = data?.message || `Lỗi server: ${status}`;
        const isSuccess = data?.isSuccess ?? false;
        return { message, isSuccess, status };
    } else if (error.request) {
        return { message: 'Không nhận được phản hồi từ server', isSuccess: false, status: null };
    } else {
        return { message: error.message || 'Lỗi không xác định', isSuccess: false, status: null };
    }
};
const formatCurrency = (price) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
};

const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
};
const formatTimeOnly = (isoString) => {
    const date = new Date(isoString);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${hours}:${minutes}`;
};


export { handleResponse, handleError, formatCurrency, formatDateTime, formatTimeOnly };