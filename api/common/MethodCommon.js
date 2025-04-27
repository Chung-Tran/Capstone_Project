const formatResponse = (success, data, message, metadata = {}) => {
    return {
        success: success,
        message: message || (success ? 'Operation successful' : 'Operation failed'),
        data: data || {},
        metadata: metadata
    };
};
function removeVietnameseTones(str) {
    return str.normalize('NFD') // Tách ký tự và dấu
        .replace(/[\u0300-\u036f]/g, '') // Xóa dấu
        .replace(/đ/g, 'd') // Chuyển đ -> d
        .replace(/Đ/g, 'D'); // Chuyển Đ -> D
}

function generateSlug(name) {
    return removeVietnameseTones(name)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '') // Loại bỏ ký tự đặc biệt
        .replace(/\s+/g, '-') // Thay khoảng trắng bằng dấu gạch ngang
        .replace(/-+/g, '-'); // Gộp nhiều dấu gạch ngang thành một
}

module.exports = { formatResponse, generateSlug };