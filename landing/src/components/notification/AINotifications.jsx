import React, { useState } from 'react';
import { Bell, X, MessageCircle, Calendar, AlertCircle, Sparkles, Clock, Eye, Star, TrendingUp } from 'lucide-react';
import dashboardService from "../../services/dashboard.service"; // Điều chỉnh đường dẫn theo cấu trúc của bạn
import reviewService from '../../services/review.service';
import { useNavigate } from 'react-router-dom';
import ProductForm from '../../pages/seller/ProductForm';
import productService from '../../services/product.service';
import notificationService from '../../services/notification.service';

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};


// Modal cho sự kiện sắp tới
export const UpcomingEventsModal = ({ notification, onlyShowModal }) => {
    return notification?.data?.length > 0 && (
        <div className="p-6">
            <div className="flex items-center mb-4">
                <div className="p-2 bg-blue-100 rounded-full mr-3">
                    <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">{notification.title}</h3>
                    <p className="text-sm text-gray-500">
                        <Clock className="w-4 h-4 inline mr-1" />
                        {formatDate(notification.created_at)}
                    </p>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                    <Calendar className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                        <p className="text-blue-800 font-medium">{notification.content}</p>
                        <p className="text-blue-600 text-sm mt-1">
                            Chuẩn bị kho hàng và chiến lược marketing cho các sự kiện sắp tới
                        </p>
                    </div>
                </div>
            </div>

            {/* Duyệt qua từng sự kiện */}
            <div className="space-y-6">
                {notification?.data?.length > 0 && notification?.data?.map((item, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4" >
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                            <Star className="w-4 h-4 mr-2" />
                            {item.event} ({item?.categories?.length || 0} danh mục)
                        </h4>

                        {/* Danh mục sản phẩm */}
                        <div className="grid grid-cols-2 gap-3">
                            {item?.categories?.map((category, idx) => (
                                <div
                                    key={idx}
                                    className="bg-gradient-to-r from-orange-100 to-red-100 rounded-lg p-3 text-center"
                                >
                                    <p className="font-medium text-gray-800">{category}</p>
                                    <p className="text-xs text-gray-600 mt-1">Tiềm năng cao</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* AI đề xuất */}
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2 flex items-center">
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI đề xuất chiến lược
                </h4>
                <ul className="text-sm text-green-700 space-y-1">
                    <li>• Chuẩn bị inventory cho các danh mục hot</li>
                    <li>• Tạo campaign marketing sớm để tăng visibility</li>
                    <li>• Thiết kế combo sản phẩm phù hợp với từng sự kiện</li>
                    <li>• Theo dõi xu hướng tìm kiếm để điều chỉnh kịp thời</li>
                </ul>
            </div>
        </div>
    )
};
// Modal cho bình luận tiêu cực
export const NegativeCommentModal = ({ notification }) => {
    const [reviewsData, setReviewsData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isModalProductOpen, setIsModalProductOpen] = useState(false);
    const [productData, setProductData] = useState(null);
    const navigate = useNavigate();

    const fetchNegativeReviews = async () => {
        if (!notification.negative_comment_ids || notification.negative_comment_ids.length === 0) {
            return;
        }
        setLoading(true);
        try {
            // Gọi API service của bạn
            const response = await reviewService.getProductListAndReviewsByIds(notification.negative_comment_ids);
            setReviewsData(response.data);
        } catch (error) {
            console.error('Error fetching negative reviews:', error);
        } finally {
            setLoading(false);
        }
    };
    const closeProductModal = () => {
        setIsModalProductOpen(false);
    };
    const handleFetchProduct = async (productId) => {
        try {
            const response = await productService.getProductById(productId);
            if (response.isSuccess) {
                setProductData(response.data);
                setIsModalProductOpen(true);
            }
        } catch (error) {
            console.error("Không thể tải thông tin sản phẩm. Vui lòng thử lại.");
        }
    }

    // Gọi API khi modal mở
    React.useEffect(() => {
        fetchNegativeReviews();
    }, [notification]);

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, index) => (
            <Star
                key={index}
                className={`w-4 h-4 ${index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
            />
        ));
    };

    const getReviewSentiment = (rating) => {
        if (rating <= 2) return { text: 'Rất tiêu cực', color: 'text-red-600', bg: 'bg-red-100' };
        if (rating === 3) return { text: 'Trung bình', color: 'text-yellow-600', bg: 'bg-yellow-100' };
        return { text: 'Tích cực', color: 'text-green-600', bg: 'bg-green-100' };
    };

    return (
        <div className="p-6">
            <ProductForm
                isOpen={isModalProductOpen}
                onClose={closeProductModal}
                refreshData={() => { }}
                initialData={productData}
                mode='view'
            />
            <div className="flex items-center mb-4">
                <div className="p-2 bg-red-100 rounded-full mr-3">
                    <MessageCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">{notification.title}</h3>
                    <p className="text-sm text-gray-500">
                        <Clock className="w-4 h-4 inline mr-1" />
                        {formatDate(notification.created_at)}
                    </p>
                </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                        <p className="text-red-800 font-medium">{notification.content}</p>
                        <p className="text-red-600 text-sm mt-1">
                            Cần xem xét và phản hồi để cải thiện trải nghiệm khách hàng
                        </p>
                    </div>
                </div>
            </div>

            {/* Danh sách bình luận tiêu cực theo sản phẩm */}
            <div className="space-y-6">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                        <span className="ml-2 text-gray-600">Đang tải bình luận...</span>
                    </div>
                ) : reviewsData && reviewsData.groupedReviews ? (
                    Object.entries(reviewsData.groupedReviews).map(([productId, productData]) => (
                        <div key={productId} className="bg-white border border-gray-200 rounded-lg p-4">
                            {/* Thông tin sản phẩm */}
                            <div className="flex items-center mb-4 pb-4 border-b border-gray-100">
                                <img
                                    src={productData.product.main_image}
                                    alt={productData.product.name}
                                    className="w-16 h-16 rounded-lg object-cover mr-4"
                                />
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900 mb-1">{productData.product.name}</h4>
                                    <p className="text-red-600 font-medium">{productData.product.price?.toLocaleString()}đ</p>
                                    <p className="text-sm text-gray-500">{productData.reviews.length} bình luận tiêu cực</p>
                                </div>
                                <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200 transition-colors"
                                    onClick={() => handleFetchProduct(productData.product._id)}
                                >
                                    Xem sản phẩm
                                </button>
                            </div>

                            {/* Danh sách bình luận */}
                            <div className="space-y-4">
                                <h5 className="font-medium text-gray-900 flex items-center">
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    Bình luận cần xem xét
                                </h5>
                                {productData.reviews.map((review) => {
                                    const sentiment = getReviewSentiment(review.rating);
                                    return (
                                        <div key={review._id} className="bg-gray-50 rounded-lg p-4 space-y-3">
                                            {/* Thông tin khách hàng và đánh giá */}
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <img
                                                        src={review.customer_id.avatar || "/default-avatar.png"}
                                                        alt={review.customer_id.fullName}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                        onError={(e) => {
                                                            e.target.src = "/default-avatar.png";
                                                        }}
                                                    />
                                                    <div>
                                                        <p className="font-medium text-gray-900">{review.customer_id.fullName}</p>
                                                        <div className="flex items-center space-x-2">
                                                            <div className="flex items-center">
                                                                {renderStars(review.rating)}
                                                            </div>
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${sentiment.bg} ${sentiment.color}`}>
                                                                {sentiment.text}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-500">
                                                        {formatDate(review.created_at)}
                                                    </p>
                                                    {review.verified_purchase && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                                                            <Eye className="w-3 h-3 mr-1" />
                                                            Đã mua hàng
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Nội dung bình luận */}
                                            <div className="bg-white rounded-lg p-3 border-l-4 border-red-300">
                                                <p className="text-gray-800">{review.content}</p>
                                                {review.images && review.images.length > 0 && (
                                                    <div className="flex space-x-2 mt-2">
                                                        {review.images.map((image, index) => (
                                                            <img
                                                                key={index}
                                                                src={image}
                                                                alt={`Review image ${index + 1}`}
                                                                className="w-12 h-12 rounded object-cover"
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8">
                        <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Không có bình luận tiêu cực nào được tìm thấy</p>
                    </div>
                )}
            </div>

            {/* Thống kê tóm tắt */}
            {reviewsData && (
                <div className="mt-6 bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Thống kê tóm tắt</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-2xl font-bold text-red-600">{reviewsData.totalReviews}</p>
                            <p className="text-sm text-gray-600">Tổng bình luận</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-orange-600">
                                {Object.keys(reviewsData.groupedReviews).length}
                            </p>
                            <p className="text-sm text-gray-600">Sản phẩm bị ảnh hưởng</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-blue-600">
                                {Math.round(Object.values(reviewsData.groupedReviews).reduce((sum, product) =>
                                    sum + product.reviews.reduce((rSum, review) => rSum + review.rating, 0) / product.reviews.length, 0
                                ) / Object.keys(reviewsData.groupedReviews).length * 10) / 10}/5
                            </p>
                            <p className="text-sm text-gray-600">Điểm TB</p>
                        </div>
                    </div>
                </div>
            )}

            {/* AI đề xuất */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI đề xuất hành động
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Ưu tiên phản hồi những bình luận có rating 1-2 sao</li>
                    <li>• Liên hệ trực tiếp với khách hàng đã mua để giải quyết vấn đề</li>
                    <li>• Phân tích nguyên nhân chung để cải thiện sản phẩm</li>
                    <li>• Tạo chương trình khuyến mãi bù đắp cho khách hàng không hài lòng</li>
                </ul>
            </div>
        </div>
    );
};
const AINotifications = ({ notifications = [] }) => {
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'negative_comments':
                return <MessageCircle className="w-5 h-5 text-red-500" />;
            case 'upcoming_events':
                return <Calendar className="w-5 h-5 text-blue-500" />;
            default:
                return <Bell className="w-5 h-5 text-gray-500" />;
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'negative_comments':
                return 'border-l-red-500 bg-red-50';
            case 'upcoming_events':
                return 'border-l-blue-500 bg-blue-50';
            default:
                return 'border-l-gray-500 bg-gray-50';
        }
    };


    const handleRead = async (notification) => {
        if (!notification?.is_read)
            await notificationService.markNotificationAsRead(notification._id);
    }
    const handleNotificationClick = (notification) => {
        setSelectedNotification(notification);
        handleRead(notification)
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedNotification(null);
    };
    const renderModal = () => {
        if (!selectedNotification) return null;

        switch (selectedNotification.type) {
            case 'negative_comments':
                return <NegativeCommentModal notification={selectedNotification} />;
            case 'upcoming_events':
                return <UpcomingEventsModal notification={selectedNotification} />;
            default:
                return (
                    <div className="p-6">
                        <h3 className="text-lg font-semibold mb-4">{selectedNotification.title}</h3>
                        <p className="text-gray-600">{selectedNotification.content}</p>
                    </div>
                );
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                    Thông báo mới từ AI
                </h2>
                <div className="flex items-center text-sm text-gray-500">
                    <Bell className="w-4 h-4 mr-1" />
                    {notifications.length} thông báo
                </div>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="text-center py-8">
                        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Không có thông báo nào</p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification._id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`border-l-4 rounded-lg p-4 cursor-pointer hover:shadow-md transition-all duration-200 ${getNotificationColor(notification.type)}`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3 flex-1">
                                    {getNotificationIcon(notification.type)}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">{notification.title}</p>
                                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notification.content}</p>
                                        <p className="text-xs text-gray-500 mt-2">
                                            {formatDate(notification.created_at)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {!notification.is_read && (
                                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    )}
                                    <Sparkles className="w-4 h-4 text-purple-500" />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900">Chi tiết thông báo</h2>
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                aria-label="Đóng modal"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        {renderModal()}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AINotifications;