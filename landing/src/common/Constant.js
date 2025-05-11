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