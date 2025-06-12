const asyncHandler = require('express-async-handler');
const Order = require('../models/order.model');
const Review = require('../models/review.model');
const OrderItem = require('../models/orderItem.model');
const CustomerItems = require('../models/customerItems.model');
const Store = require('../models/store.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');
const formatResponse = require('../middlewares/responseFormat');

// Helper function để tính toán khoảng thời gian
const getDateRange = (timeRange) => {
    const now = new Date();
    let startDate, previousStartDate;

    switch (timeRange) {
        case '7days':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            previousStartDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
            break;
        case '1month':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            previousStartDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
            break;
        case '3months':
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            previousStartDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
            break;
        case '6months':
            startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
            previousStartDate = new Date(now.getTime() - 360 * 24 * 60 * 60 * 1000);
            break;
        case '1year':
            startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            previousStartDate = new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000);
            break;
        default:
            startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
            previousStartDate = new Date(now.getTime() - 360 * 24 * 60 * 60 * 1000);
    }

    return { startDate, previousStartDate };
};

// Helper function để tính tỷ lệ tăng trưởng
const calculateGrowth = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return parseFloat(((current - previous) / previous * 100).toFixed(1));
};

// Lấy thống kê tổng quan chi tiết
const getDashboardSummary = asyncHandler(async (req, res) => {
    try {
        const { timeRange = '6months' } = req.query;
        const { startDate, previousStartDate } = getDateRange(timeRange);

        // Thống kê hiện tại
        const [
            currentStats,
            previousStats,
            totalProducts,
            totalViews,
            totalCustomers,
            averageRating
        ] = await Promise.all([
            // Thống kê kỳ hiện tại
            Promise.all([
                Order.countDocuments({ created_at: { $gte: startDate } }),
                Order.countDocuments({ status: 'done', created_at: { $gte: startDate } }),
                Order.aggregate([
                    { $match: { status: 'done', created_at: { $gte: startDate } } },
                    { $group: { _id: null, total: { $sum: "$total_amount" } } }
                ])
            ]),
            // Thống kê kỳ trước
            Promise.all([
                Order.countDocuments({ created_at: { $gte: previousStartDate, $lt: startDate } }),
                Order.countDocuments({ status: 'done', created_at: { $gte: previousStartDate, $lt: startDate } }),
                Order.aggregate([
                    { $match: { status: 'done', created_at: { $gte: previousStartDate, $lt: startDate } } },
                    { $group: { _id: null, total: { $sum: "$total_amount" } } }
                ])
            ]),
            // Sản phẩm đang hoạt động
            Product.countDocuments({ status: 'active' }),
            // Tổng lượt xem
            Product.aggregate([
                { $group: { _id: null, total: { $sum: "$view_count" } } }
            ]),
            // Tổng khách hàng
            Order.distinct('customer_id').then(customers => customers.length),
            // Đánh giá trung bình
            Review.aggregate([
                { $match: { review_type: "product_review" } },
                { $group: { _id: null, avgRating: { $avg: "$rating" } } }
            ])
        ]);

        const [currentOrders, currentCompleted, currentRevenue] = currentStats;
        const [previousOrders, previousCompleted, previousRevenue] = previousStats;

        const currentRevenueAmount = currentRevenue[0]?.total || 0;
        const previousRevenueAmount = previousRevenue[0]?.total || 0;
        const currentCompletionRate = currentOrders > 0 ? (currentCompleted / currentOrders) * 100 : 0;
        const previousCompletionRate = previousOrders > 0 ? (previousCompleted / previousOrders) * 100 : 0;

        const totalViewsCount = totalViews[0]?.total || 1;
        const conversionRate = totalViewsCount > 0 ? (currentOrders / totalViewsCount) * 100 : 0;

        // Tính tỷ lệ tăng trưởng
        const revenueGrowth = calculateGrowth(currentRevenueAmount, previousRevenueAmount);
        const orderGrowth = calculateGrowth(currentOrders, previousOrders);
        const ratingValue = averageRating[0]?.avgRating || 0;

        res.status(200).json(formatResponse(true, {
            totalOrders: currentOrders,
            completedOrders: currentCompleted,
            completionRate: parseFloat(currentCompletionRate.toFixed(1)),
            totalRevenue: currentRevenueAmount,
            revenueGrowth,
            orderGrowth,
            averageRating: parseFloat(ratingValue.toFixed(1)),
            ratingGrowth: 0, // Có thể tính sau nếu cần
            totalProducts,
            totalViews: totalViewsCount,
            totalCustomers,
            conversionRate: parseFloat(conversionRate.toFixed(1)),
            conversionGrowth: 0 // Có thể tính sau nếu cần
        }, "Lấy dữ liệu tổng quan thành công"));
    } catch (err) {
        console.log(err.message);
        res.status(500).json(formatResponse(false, null, "Lỗi server"));
    }
});

// Lấy doanh thu theo thời gian
const getRevenueOverTime = asyncHandler(async (req, res) => {
    try {
        const { type = 'month', timeRange = '6months' } = req.query;
        const { startDate } = getDateRange(timeRange);

        const groupBy = {
            day: {
                year: { $year: "$created_at" },
                month: { $month: "$created_at" },
                day: { $dayOfMonth: "$created_at" }
            },
            week: {
                year: { $year: "$created_at" },
                week: { $week: "$created_at" }
            },
            month: {
                year: { $year: "$created_at" },
                month: { $month: "$created_at" }
            }
        };

        const data = await Order.aggregate([
            { $match: { status: 'done', created_at: { $gte: startDate } } },
            {
                $group: {
                    _id: groupBy[type] || groupBy.month,
                    total: { $sum: "$total_amount" },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.week": 1 } }
        ]);

        const formattedData = data.map(item => {
            let label;
            if (type === 'day') {
                label = `${item._id.day}/${item._id.month}`;
            } else if (type === 'week') {
                label = `T${item._id.week}`;
            } else {
                label = `T${item._id.month}`;
            }

            return {
                ...item,
                label,
                month: item._id.month,
                day: item._id.day,
                week: item._id.week,
                year: item._id.year
            };
        });

        res.status(200).json(formatResponse(true, formattedData, "Lấy doanh thu theo thời gian thành công"));
    } catch (err) {
        console.log(err.message);
        res.status(500).json(formatResponse(false, null, "Lỗi server"));
    }
});

// Lấy thống kê đơn hàng theo thời gian
const getOrdersOverTime = asyncHandler(async (req, res) => {
    try {
        const { type = 'month', timeRange = '6months' } = req.query;
        const { startDate } = getDateRange(timeRange);

        const groupBy = {
            day: {
                year: { $year: "$created_at" },
                month: { $month: "$created_at" },
                day: { $dayOfMonth: "$created_at" }
            },
            week: {
                year: { $year: "$created_at" },
                week: { $week: "$created_at" }
            },
            month: {
                year: { $year: "$created_at" },
                month: { $month: "$created_at" }
            }
        };

        const data = await Order.aggregate([
            { $match: { created_at: { $gte: startDate } } },
            {
                $group: {
                    _id: {
                        period: groupBy[type] || groupBy.month,
                        status: "$status"
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.period.year": 1, "_id.period.month": 1, "_id.period.day": 1, "_id.period.week": 1 } }
        ]);

        // Group by period và tính tổng các trạng thái
        const groupedData = {};
        data.forEach(item => {
            const period = item._id.period;
            const periodKey = `${period.year}-${period.month || 0}-${period.day || 0}-${period.week || 0}`;

            if (!groupedData[periodKey]) {
                groupedData[periodKey] = {
                    period,
                    count: 0,
                    completed: 0,
                    cancelled: 0,
                    pending: 0
                };
            }

            groupedData[periodKey].count += item.count;

            switch (item._id.status) {
                case 'done':
                    groupedData[periodKey].completed = item.count;
                    break;
                case 'cancelled':
                    groupedData[periodKey].cancelled = item.count;
                    break;
                case 'pending':
                    groupedData[periodKey].pending = item.count;
                    break;
            }
        });

        const formattedData = Object.values(groupedData).map(item => {
            let label;
            if (type === 'day') {
                label = `${item.period.day}/${item.period.month}`;
            } else if (type === 'week') {
                label = `T${item.period.week}`;
            } else {
                label = `T${item.period.month}`;
            }

            return {
                ...item,
                label,
                month: item.period.month,
                day: item.period.day,
                week: item.period.week,
                year: item.period.year
            };
        });

        res.status(200).json(formatResponse(true, formattedData, "Lấy thống kê đơn hàng thành công"));
    } catch (err) {
        console.log(err.message);
        res.status(500).json(formatResponse(false, null, "Lỗi server"));
    }
});

// Lấy sản phẩm bán chạy nhất
const getTopSellingProducts = asyncHandler(async (req, res) => {
    try {
        const { limit = 10, timeRange = '6months' } = req.query;
        const { startDate } = getDateRange(timeRange);

        const topProducts = await OrderItem.aggregate([
            {
                $lookup: {
                    from: 'orders',
                    localField: 'order_id',
                    foreignField: '_id',
                    as: 'order'
                }
            },
            { $unwind: '$order' },
            {
                $match: {
                    'order.status': 'done',
                    'order.created_at': { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: '$product_id',
                    totalSold: { $sum: '$quantity' },
                    revenue: { $sum: { $multiply: ['$quantity', '$price'] } }
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            {
                $project: {
                    _id: 1,
                    name: '$product.name',
                    image: '$product.main_image',
                    totalSold: '$product.quantitySold',
                    revenue: 1,
                    growth: { $literal: Math.floor(Math.random() * 50) + 10 } // Mock growth data
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: parseInt(limit) }
        ]);

        res.status(200).json(formatResponse(true, topProducts, "Lấy sản phẩm bán chạy thành công"));
    } catch (err) {
        console.log(err.message);
        res.status(500).json(formatResponse(false, null, "Lỗi server"));
    }
});

// Lấy trạng thái đơn hàng
const getOrderStatus = asyncHandler(async (req, res) => {
    try {
        const { timeRange = '6months' } = req.query;
        const { startDate } = getDateRange(timeRange);

        const statusData = await Order.aggregate([
            { $match: { created_at: { $gte: startDate } } },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    status: {
                        $switch: {
                            branches: [
                                { case: { $eq: ["$_id", "done"] }, then: "Hoàn thành" },
                                { case: { $eq: ["$_id", "pending"] }, then: "Chờ xử lý" },
                                { case: { $eq: ["$_id", "cancelled"] }, then: "Đã hủy" },
                                { case: { $eq: ["$_id", "processing"] }, then: "Đang xử lý" }
                            ],
                            default: "Khác"
                        }
                    },
                    count: 1
                }
            }
        ]);

        res.status(200).json(formatResponse(true, statusData, "Lấy trạng thái đơn hàng thành công"));
    } catch (err) {
        console.log(err.message);
        res.status(500).json(formatResponse(false, null, "Lỗi server"));
    }
});

// Lấy thống kê khách hàng
const getCustomerStats = asyncHandler(async (req, res) => {
    try {
        const { timeRange = '6months' } = req.query;
        const { startDate } = getDateRange(timeRange);

        const customerStats = await Order.aggregate([
            { $match: { created_at: { $gte: startDate } } },
            {
                $group: {
                    _id: "$customer_id",
                    totalOrders: { $sum: 1 },
                    totalSpent: { $sum: "$total_amount" },
                    lastOrderDate: { $max: "$created_at" }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'customer'
                }
            },
            { $unwind: '$customer' },
            {
                $project: {
                    _id: 1,
                    name: '$customer.name',
                    email: '$customer.email',
                    totalOrders: 1,
                    totalSpent: 1,
                    lastOrderDate: 1,
                    avgOrderValue: { $divide: ['$totalSpent', '$totalOrders'] }
                }
            },
            { $sort: { totalSpent: -1 } },
            { $limit: 20 }
        ]);

        res.status(200).json(formatResponse(true, customerStats, "Lấy thống kê khách hàng thành công"));
    } catch (err) {
        console.log(err.message);
        res.status(500).json(formatResponse(false, null, "Lỗi server"));
    }
});

const DashboardController = {
    getDashboardSummary,
    getRevenueOverTime,
    getOrdersOverTime,
    getTopSellingProducts,
    getOrderStatus,
    getCustomerStats
};

module.exports = { DashboardController };