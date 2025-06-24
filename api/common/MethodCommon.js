const Product = require('../models/product.model');
const Review = require('../models/review.model');



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
const calculateProductRatings = async (products) => {
    const productIds = products.map(p => p._id);

    const reviews = await Review.find({
        product_id: { $in: productIds },
        review_type: 'product_review'
    });

    const reviewMap = {};
    reviews.forEach(review => {
        const pid = review.product_id.toString();
        if (!reviewMap[pid]) reviewMap[pid] = [];
        reviewMap[pid].push(review);
    });

    const productsWithRatings = products.map(product => {
        const pid = product._id.toString();
        const productReviews = reviewMap[pid] || [];
        const totalReviews = productReviews.length;
        let averageRating = 0;

        if (totalReviews > 0) {
            const sumRatings = productReviews.reduce((sum, r) => sum + r.rating, 0);
            averageRating = parseFloat((sumRatings / totalReviews).toFixed(1));
        }

        return {
            ...product.toObject(),
            average_rating: averageRating,
            total_reviews: totalReviews
        };
    });

    return productsWithRatings;
};
module.exports = { formatResponse, generateSlug, calculateProductRatings };