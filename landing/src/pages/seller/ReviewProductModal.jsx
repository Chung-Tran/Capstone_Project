import React, { useState, useEffect } from "react";
import {
  StarOutlined,
  MessageOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  BellOutlined,
} from "@ant-design/icons";
import {
  Card,
  Badge,
  Space,
  Typography,
  Modal,
  Avatar,
  Rate,
  Input,
  Button,
  Tabs,
  Tag,
  Progress,
  Image,
  Form,
  Select,
  Empty,
  Divider,
  notification,
  Spin,
} from "antd";
import reviewService from "../../services/review.service";
import { showToast } from "../../utils/toast";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Option } = Select;

const ReviewProductModal = ({ visible, product, onCancel }) => {
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({
    avgRating: 0,
    total: 0,
    count5Star: 0,
    count4Star: 0,
    count3Star: 0,
    count2Star: 0,
    count1Star: 0,
  });
  const [loading, setLoading] = useState(false);
  const [replyForm, setReplyForm] = useState({ reviewId: null, content: "" });
  const [previewImage, setPreviewImage] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    rating: "",
    status: "",
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    if (visible && product?._id) {
      fetchReviews(product._id);
    }
  }, [visible, product, pagination.current, pagination.pageSize]);

  useEffect(() => {
    if (!visible) {
      setReviews([]);
      setReviewStats({
        avgRating: 0,
        total: 0,
        count5Star: 0,
        count4Star: 0,
        count3Star: 0,
        count2Star: 0,
        count1Star: 0,
      });
      setFilters({
        search: "",
        rating: "",
        status: "",
      });
      setPagination({
        current: 1,
        pageSize: 10,
        total: 0,
      });
      setReplyForm({ reviewId: null, content: "" });
    }
  }, [visible]);

  const fetchReviews = async (productId) => {
    setLoading(true);
    try {
      const response = await reviewService.get_product_review(productId, {
        limit: pagination.pageSize,
        skip: (pagination.current - 1) * pagination.pageSize,
        ...filters,
      });

      if (response && response.data.reviewList) {
        setReviews(response.data.reviewList);
        setReviewStats({
          total: response.data.total || 0,
          count5Star: response.data.count5Star || 0,
          count4Star: response.data.count4Star || 0,
          count3Star: response.data.count3Star || 0,
          count2Star: response.data.count2Star || 0,
          count1Star: response.data.count1Star || 0,
          avgRating: calculateAvgRating(response.data),
        });
        setPagination({
          ...pagination,
          total: response.data.total || 0,
        });
      }
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: `Không thể tải đánh giá: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateAvgRating = (data) => {
    const totalRatings =
      data.count5Star +
      data.count4Star +
      data.count3Star +
      data.count2Star +
      data.count1Star;
    const weightedSum =
      5 * data.count5Star +
      4 * data.count4Star +
      3 * data.count3Star +
      2 * data.count2Star +
      1 * data.count1Star;

    return totalRatings > 0 ? (weightedSum / totalRatings).toFixed(1) : 0;
  };

  const handleReply = async () => {
    try {
      setLoading(true);

      // Kiểm tra nội dung phản hồi có trống không
      if (!replyForm.content.trim()) {
        showToast.warning('Phản hồi không được để trống');
        return;
      }

      try {
        // Gọi API phản hồi đánh giá
        const response = await reviewService.reply_product_review(replyForm.reviewId, replyForm.content);

        // Cập nhật state reviews
        setReviews(
          reviews.map((review) =>
            review._id === replyForm.reviewId
              ? {
                ...review,
                reply: {
                  content: replyForm.content,
                  replied_at: response?.data?.reply?.replied_at || new Date(),
                },
              }
              : review
          )
        );

        // Reset form và đóng dialog
        setReplyForm({ reviewId: null, content: '' });
        onCancel();

        // Thông báo thành công
        showToast.success('Đã phản hồi đánh giá thành công');
      } catch (apiError) {
        console.error('Reply API error:', apiError);

        // Xử lý trường hợp đặc biệt khi lỗi có message "Reply submitted successfully"
        if (apiError.message && apiError.message.includes('submitted successfully')) {
          // Đây thực ra là thành công nhưng được trả về dưới dạng lỗi
          setReviews(
            reviews.map((review) =>
              review._id === replyForm.reviewId
                ? {
                  ...review,
                  reply: {
                    content: replyForm.content,
                    replied_at: new Date(),
                  },
                }
                : review
            )
          );

          // Reset form và đóng dialog
          setReplyForm({ reviewId: null, content: '' });

          // Thông báo thành công
          showToast.success('Đã phản hồi đánh giá thành công');
        } else {
          // Đây là lỗi thực sự
          showToast.error(apiError.message || 'Không thể phản hồi đánh giá');
        }
      }
    } catch (error) {
      console.error('HandleReply error:', error);
      showToast.error(error.message || 'Không thể phản hồi đánh giá');
    } finally {
      setLoading(false);
    }
  };
  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilter = () => {
    setPagination({ ...pagination, current: 1 });
    fetchReviews(product._id);
  };

  const calculateRatingPercentage = (count) => {
    return reviewStats.total > 0 ? (count / reviewStats.total) * 100 : 0;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  return (
    <Modal
      title={
        <Space>
          <Text strong>{product?.name}</Text>
          <Divider type="vertical" />
          <Rate disabled value={reviewStats.avgRating} allowHalf />
          <Text>{reviewStats.avgRating}</Text>
          <Text type="secondary">({reviewStats.total} đánh giá)</Text>
        </Space>
      }
      visible={visible}
      onCancel={onCancel}
      width={1000}
      footer={null}
    >
      <Spin spinning={loading}>
        <Tabs defaultActiveKey="reviews">
          <TabPane
            tab={
              <span>
                <StarOutlined />
                Tổng quan đánh giá
              </span>
            }
            key="overview"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
              <Card>
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-blue-600 mb-2">
                      {reviewStats.avgRating}
                    </div>
                    <Rate disabled value={reviewStats.avgRating} allowHalf />
                    <div className="text-gray-500 mt-2">
                      {reviewStats.total} đánh giá
                    </div>
                  </div>
                </div>
              </Card>
              <Card>
                <Title level={5}>Phân bố đánh giá</Title>
                <Space direction="vertical" style={{ width: "100%" }}>
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center">
                      <div style={{ width: 60 }}>
                        <Space>
                          <span>{star}</span>
                          <StarOutlined />
                        </Space>
                      </div>
                      <Progress
                        percent={calculateRatingPercentage(
                          reviewStats[`count${star}Star`]
                        )}
                        showInfo={false}
                        style={{ width: "calc(100% - 120px)" }}
                      />
                      <div style={{ width: 60, textAlign: "right" }}>
                        {reviewStats[`count${star}Star`]}
                      </div>
                    </div>
                  ))}
                </Space>
              </Card>
            </div>
          </TabPane>
          <TabPane
            tab={
              <span>
                <MessageOutlined />
                Danh sách đánh giá
              </span>
            }
            key="reviews"
          >
            <div className="p-4">
              <div className="mb-4 flex items-center gap-4 flex-wrap">
                <Input
                  placeholder="Tìm kiếm theo tên KH hoặc nội dung"
                  prefix={<SearchOutlined />}
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  style={{ width: 300 }}
                />
                <Select
                  placeholder="Lọc theo số sao"
                  style={{ width: 150 }}
                  value={filters.rating}
                  onChange={(value) => handleFilterChange("rating", value)}
                >
                  <Option value="">Tất cả sao</Option>
                  <Option value="5">5 sao</Option>
                  <Option value="4">4 sao</Option>
                  <Option value="3">3 sao</Option>
                  <Option value="2">2 sao</Option>
                  <Option value="1">1 sao</Option>
                </Select>
                <Select
                  placeholder="Trạng thái phản hồi"
                  style={{ width: 150 }}
                  value={filters.status}
                  onChange={(value) => handleFilterChange("status", value)}
                >
                  <Option value="">Tất cả trạng thái</Option>
                  <Option value="replied">Đã phản hồi</Option>
                  <Option value="not_replied">Chưa phản hồi</Option>
                </Select>
                <Button
                  type="primary"
                  icon={<FilterOutlined />}
                  onClick={handleApplyFilter}
                >
                  Áp dụng
                </Button>
              </div>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review._id} className="mb-4">
                      <div className="review-container">
                        <div className="flex justify-between">
                          <div className="flex items-start space-x-4">
                            <Avatar
                              src={
                                review.customer_id?.avatar ||
                                "https://via.placeholder.com/40"
                              }
                              alt={review.customer_id?.fullName || "Khách hàng"}
                              size={40}
                            />
                            <div className="flex-1">
                              <div className="flex items-center mb-1">
                                <Text strong className="mr-2">
                                  {review.customer_id?.fullName || "Khách hàng"}
                                </Text>
                                <Rate disabled value={review.rating} />
                              </div>
                              <Text type="secondary" className="text-xs">
                                {formatDate(review.created_at)}
                              </Text>
                              <div className="mt-2">
                                {review.title && (
                                  <Text strong className="block mb-1">
                                    {review.title}
                                  </Text>
                                )}
                                <Paragraph>{review.content}</Paragraph>
                              </div>
                              {review.images?.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {review.images.map((img, idx) => (
                                    <div key={idx}>
                                      <Image
                                        width={80}
                                        height={80}
                                        src={img}
                                        alt={`Hình ảnh ${idx + 1}`}
                                        preview={{
                                          visible:
                                            previewVisible &&
                                            previewImage === img,
                                          onVisibleChange: (visible) => {
                                            setPreviewVisible(visible);
                                            if (!visible) setPreviewImage(null);
                                          },
                                          src: img,
                                        }}
                                        onClick={() => {
                                          setPreviewImage(img);
                                          setPreviewVisible(true);
                                        }}
                                        style={{
                                          objectFit: "cover",
                                          cursor: "pointer",
                                        }}
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                        </div>
                        <div className="mt-4 border-t pt-4">
                          {review.reply ? (
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <div className="flex items-start space-x-3">
                                <Avatar style={{ backgroundColor: "#1890ff" }}>
                                  Shop
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center">
                                    <Text strong className="mr-2">
                                      Phản hồi của shop
                                    </Text>
                                    <Text type="secondary" className="text-xs">
                                      {formatDate(review.reply.replied_at)}
                                    </Text>
                                  </div>
                                  <Paragraph className="mt-2">
                                    {review.reply.content}
                                  </Paragraph>
                                  <Button
                                    type="link"
                                    size="small"
                                    className="p-0"
                                    onClick={() =>
                                      setReplyForm({
                                        reviewId: review._id,
                                        content: review.reply.content,
                                      })
                                    }
                                  >
                                    Chỉnh sửa
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div>
                              {replyForm.reviewId === review._id ? (
                                <Form layout="vertical">
                                  <Form.Item>
                                    <TextArea
                                      rows={4}
                                      value={replyForm.content}
                                      onChange={(e) =>
                                        setReplyForm({
                                          ...replyForm,
                                          content: e.target.value,
                                        })
                                      }
                                      placeholder="Nhập phản hồi của bạn..."
                                    />
                                  </Form.Item>
                                  <Form.Item>
                                    <Space>
                                      <Button
                                        type="primary"
                                        onClick={handleReply}
                                        loading={loading}
                                      >
                                        Gửi phản hồi
                                      </Button>
                                      <Button
                                        onClick={() =>
                                          setReplyForm({
                                            reviewId: null,
                                            content: "",
                                          })
                                        }
                                      >
                                        Hủy
                                      </Button>
                                    </Space>
                                  </Form.Item>
                                </Form>
                              ) : (
                                <Button
                                  type="primary"
                                  icon={<MessageOutlined />}
                                  onClick={() =>
                                    setReplyForm({
                                      reviewId: review._id,
                                      content: "",
                                    })
                                  }
                                >
                                  Phản hồi
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Empty
                  description="Không có đánh giá nào phù hợp"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
              {reviewStats.total > 0 && (
                <div className="mt-4 flex justify-center">
                  <Button
                    type="primary"
                    onClick={() => {
                      setFilters({ search: "", rating: "", status: "" });
                      setPagination({ ...pagination, current: 1 });
                      fetchReviews(product._id);
                    }}
                  >
                    Xem tất cả đánh giá
                  </Button>
                </div>
              )}
            </div>
          </TabPane>
        </Tabs>
      </Spin>
    </Modal>
  );
};

export default ReviewProductModal;