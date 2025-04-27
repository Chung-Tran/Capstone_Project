import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { StarIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/solid';
import reviewService from '../../services/review.service';
import productService from '../../services/product.service';

const Reviews = () => {
  const { productId } = useParams(); // Lấy productId từ URL
  const [reviews, setReviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [ratingCounts, setRatingCounts] = useState({
    count5Star: 0,
    count4Star: 0,
    count3Star: 0,
    count2Star: 0,
    count1Star: 0,
  });
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    rating: '',
    status: '',
  });
  const [pagination, setPagination] = useState({
    limit: 5,
    skip: 0,
  });
  const [replyForm, setReplyForm] = useState({ id: null, content: '' });

  const fetchProduct = async () => {
    try {
      const productData = await productService.getProductById(productId);
      setProduct(productData);
    } catch (err) {
      console.error("Error fetching product:", err);
      setError(err.message);
    }
  };

  const fetchReviews = async () => {
    setLoading(true);
    try {
      console.log("Fetching reviews for product:", productId);
      const response = await reviewService.get_product_review(productId, {
        limit: pagination.limit,
        skip: pagination.skip,
      });
      console.log("API response:", response);
      
      // Kiểm tra cấu trúc phản hồi và gán dữ liệu phù hợp
      if (response && response.reviewList) {
        setReviews(response.reviewList);
        setTotal(response.total || 0);
        setRatingCounts({
          count5Star: response.count5Star || 0,
          count4Star: response.count4Star || 0,
          count3Star: response.count3Star || 0,
          count2Star: response.count2Star || 0,
          count1Star: response.count1Star || 0,
        });
        setError(null);
      } else {
        console.error("Invalid response format:", response);
        setError("Định dạng phản hồi không hợp lệ");
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Current productId:", productId);
    if (productId) {
      fetchProduct();
      fetchReviews();
    } else {
      console.log("No productId available");
      setError("Không có ID sản phẩm");
    }
  }, [pagination.limit, pagination.skip, productId]);

  const handleReply = async (reviewId) => {
    if (!replyForm.content.trim()) {
      setError('Phản hồi không được để trống');
      return;
    }
    try {
      console.log("Replying to review:", reviewId, "with content:", replyForm.content);
      const response = await reviewService.reply_product_review(reviewId, replyForm.content);
      console.log("Reply response:", response);
      
      // Cập nhật state sau khi phản hồi thành công
      setReviews(
        reviews.map((review) =>
          review._id === reviewId
            ? { ...review, reply: { content: replyForm.content, replied_at: new Date() } }
            : review
        )
      );
      setReplyForm({ id: null, content: '' });
      setError(null);
    } catch (err) {
      console.error("Error replying to review:", err);
      setError(err.message);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPagination((prev) => ({ ...prev, skip: 0 }));
  };

  const handlePageChange = (newSkip) => {
    setPagination((prev) => ({ ...prev, skip: newSkip }));
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <StarIcon
        key={index}
        className={`w-5 h-5 ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const filteredReviews = reviews.filter((review) => {
    if (!review || !review.customer_id) {
      console.log("Invalid review data:", review);
      return false;
    }
    
    const matchesSearch = filters.search
      ? (review.customer_id.fullName && review.customer_id.fullName
          .toLowerCase()
          .includes(filters.search.toLowerCase())) ||
        (review.content && review.content.toLowerCase().includes(filters.search.toLowerCase()))
      : true;
    const matchesRating = filters.rating
      ? review.rating === parseInt(filters.rating)
      : true;
    const matchesStatus = filters.status
      ? (filters.status === 'replied' ? review.reply?.content : !review.reply?.content)
      : true;
    return matchesSearch && matchesRating && matchesStatus;
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">
        Đánh giá {product ? `cho ${product.name}` : 'Sản phẩm'}
      </h1>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Thống kê đánh giá</h2>
        <div className="grid grid-cols-5 gap-4">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="text-center">
              <p>{star} sao</p>
              <p className="font-medium">{ratingCounts[`count${star}Star`]}</p>
            </div>
          ))}
        </div>
      </div>

      {loading && <p className="text-gray-600">Đang tải...</p>}
      {error && <p className="text-red-500">Lỗi: {error}</p>}

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            name="search"
            placeholder="Tìm kiếm đánh giá..."
            value={filters.search}
            onChange={handleFilterChange}
            className="border rounded-lg px-4 py-2"
          />
          <select
            name="rating"
            value={filters.rating}
            onChange={handleFilterChange}
            className="border rounded-lg px-4 py-2"
          >
            <option value="">Tất cả sao</option>
            <option value="5">5 sao</option>
            <option value="4">4 sao</option>
            <option value="3">3 sao</option>
            <option value="2">2 sao</option>
            <option value="1">1 sao</option>
          </select>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="border rounded-lg px-4 py-2"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="replied">Đã phản hồi</option>
            <option value="not_replied">Chưa phản hồi</option>
          </select>
          <button
            onClick={() => {
              setPagination((prev) => ({ ...prev, skip: 0 }));
              fetchReviews();
            }}
            className="bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600"
          >
            Lọc
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((review) => (
            <div key={review._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={review.customer_id.avatar || 'https://via.placeholder.com/40'}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h3 className="font-medium">{review.customer_id.fullName}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex">{renderStars(review.rating)}</div>
              </div>
              <p className="text-gray-600 mb-2 font-semibold">{review.title}</p>
              <p className="mb-4">{review.content}</p>
              {review.images?.length > 0 && (
                <div className="flex space-x-2 mb-4">
                  {review.images.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt="Review"
                      className="w-32 h-32 object-cover rounded"
                    />
                  ))}
                </div>
              )}
              {review.reply?.content ? (
                <p className="text-gray-500 italic">Phản hồi: {review.reply.content}</p>
              ) : (
                <div className="mt-4">
                  {replyForm.id === review._id ? (
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Nhập phản hồi..."
                        value={replyForm.content}
                        onChange={(e) =>
                          setReplyForm({ ...replyForm, content: e.target.value })
                        }
                        className="border rounded-lg px-4 py-2 flex-1"
                      />
                      <button
                        onClick={() => handleReply(review._id)}
                        className="bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600"
                      >
                        Gửi
                      </button>
                      <button
                        onClick={() => setReplyForm({ id: null, content: '' })}
                        className="bg-gray-300 text-gray-700 rounded-lg px-4 py-2 hover:bg-gray-400"
                      >
                        Hủy
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReplyForm({ id: review._id, content: '' })}
                      className="flex items-center text-blue-500 hover:text-blue-600"
                    >
                      <ChatBubbleLeftIcon className="w-5 h-5 mr-2" />
                      Phản hồi
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-600">Không có đánh giá nào phù hợp.</p>
        )}
      </div>

      {total > pagination.limit && (
        <div className="flex justify-center mt-6 space-x-2">
          <button
            onClick={() => handlePageChange(Math.max(0, pagination.skip - pagination.limit))}
            disabled={pagination.skip === 0}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Trước
          </button>
          <span className="px-4 py-2">
            Trang {Math.floor(pagination.skip / pagination.limit) + 1} /{' '}
            {Math.ceil(total / pagination.limit)}
          </span>
          <button
            onClick={() => handlePageChange(pagination.skip + pagination.limit)}
            disabled={pagination.skip + pagination.limit >= total}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
};

export default Reviews;