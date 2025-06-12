export const price_range_filter = [
    { id: '0-2m', name: 'Dưới 2 triệu', min: 0, max: 2000000 },
    { id: '2m-5m', name: '2 - 5 triệu', min: 2000000, max: 5000000 },
    { id: '5m-10m', name: '5 - 10 triệu', min: 5000000, max: 10000000 },
    { id: '10m-20m', name: '10 - 20 triệu', min: 10000000, max: 20000000 },
    { id: '20m-up', name: 'Trên 20 triệu', min: 20000000, max: 1000000000 },
];
export const sortOptions = [
    { id: 'relevance', name: 'Liên quan' },
    { id: 'newest', name: 'Mới nhất' },
    { id: 'bestSeller', name: 'Bán chạy' },
    { id: 'priceAsc', name: 'Giá tăng dần' },
    { id: 'priceDesc', name: 'Giá giảm dần' },
    { id: 'rating', name: 'Đánh giá cao' },
];
export const PAYMENT_STATUS = {
    DRAFT: 'draft',
    SUCCESSED: 'success',
    FAILED: 'failed',
};
export const POLLING_CONFIG = {
    INTERVAL: 2000, // 2 seconds
    TIMEOUT: 300000, // 5 minutes
};

export const COLOR_OPTIONS = [
    { label: "Màu đỏ", value: "red" },
    { label: "Màu đỏ tươi", value: "crimson" },
    { label: "Màu đỏ đậm", value: "darkred" },

    { label: "Màu cam", value: "orange" },
    { label: "Màu cam đậm", value: "darkorange" },
    { label: "Màu hổ phách", value: "amber" },

    { label: "Màu vàng", value: "yellow" },
    { label: "Màu vàng chanh", value: "gold" },
    { label: "Màu vàng nhạt", value: "lightyellow" },

    { label: "Màu xanh lá", value: "green" },
    { label: "Màu xanh oliu", value: "olive" },
    { label: "Màu xanh mint", value: "mint" },
    { label: "Màu xanh neon", value: "lime" },
    { label: "Màu xanh rêu", value: "forestgreen" },

    { label: "Màu xanh dương", value: "blue" },
    { label: "Màu xanh da trời", value: "skyblue" },
    { label: "Màu xanh navy", value: "navy" },
    { label: "Màu xanh tím than", value: "midnightblue" },

    { label: "Màu tím", value: "purple" },
    { label: "Màu tím oải hương", value: "lavender" },
    { label: "Màu tím đậm", value: "indigo" },
    { label: "Màu tím pastel", value: "plum" },

    { label: "Màu hồng", value: "pink" },
    { label: "Màu hồng pastel", value: "lightpink" },
    { label: "Màu hồng cánh sen", value: "hotpink" },

    { label: "Màu nâu", value: "brown" },
    { label: "Màu be", value: "beige" },
    { label: "Màu cà phê", value: "chocolate" },

    { label: "Màu xám", value: "gray" },
    { label: "Màu xám nhạt", value: "lightgray" },
    { label: "Màu xám đậm", value: "darkgray" },

    { label: "Màu đen", value: "black" },
    { label: "Màu trắng", value: "white" }
];
export const typeStyles = {
    trending: {
        badge: "bg-orange-600",
        badgeText: "Thịnh hành",
        priceColor: "text-orange-700",
        hoverBorder: "group-hover:border-orange-400"
    },
    recommended: {
        badge: "bg-purple-600",
        badgeText: "Gợi ý",
        priceColor: "text-purple-700",
        hoverBorder: "group-hover:border-purple-400"
    },
    recent: {
        badge: "bg-blue-600",
        badgeText: "Đã xem",
        priceColor: "text-blue-700",
        hoverBorder: "group-hover:border-blue-400"
    },
    default: {
        badge: "bg-gray-600",
        badgeText: "Khuyến mãi",
        priceColor: "text-gray-800",
        hoverBorder: "group-hover:border-gray-400"
    }
};

export const homeTypeStyles = {
    featured: {
        badge: "bg-blue-600",
        badgeText: "Nổi bật",
        priceColor: "text-blue-700",
        hoverBorder: "group-hover:border-blue-400"
    },
    new: {
        badge: "bg-green-600",
        badgeText: "Mới",
        priceColor: "text-green-700",
        hoverBorder: "group-hover:border-green-400"
    },
    recommended: {
        badge: "bg-purple-600",
        badgeText: "Gợi ý",
        priceColor: "text-purple-700",
        hoverBorder: "group-hover:border-purple-400"
    },
    default: {
        badge: "bg-gray-600",
        badgeText: "Khuyến mãi",
        priceColor: "text-gray-800",
        hoverBorder: "group-hover:border-gray-400"
    }
};