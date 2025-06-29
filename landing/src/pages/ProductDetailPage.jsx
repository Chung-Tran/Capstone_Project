import React, { useEffect, useState } from "react";
import {
  Star,
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  MessageCircle,
  Store,
  MapPin,
  ThumbsUp,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import CarouselList from "../components/CarouselList";
import ProductCardItem from "../components/product/ProductCard";
import { formatCurrency, formatDateTime } from "../common/methodsCommon";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import productService from "../services/product.service";
import { showToast } from "../utils/toast";
import { useLoading } from "../utils/useLoading";
import { Rating } from "react-simple-star-rating";
import reviewService from "../services/review.service";
import ReviewModal from "../components/ReviewModal";
import create_logger from "../config/logger";
import { incrementCartCount } from "../store/slices/authSlice";
import customerItemsService from "../services/customerItems.service";
import { useDispatch } from "react-redux";
import BlockchainAuthModal from "../components/product/BlockchainAuthModal";
import { useRequireAuth } from "../hooks/useRequireAuth";
import { COLOR_OPTIONS, log_action_type } from "../common/Constant";

const ProductDetailPage = () => {
  const { setLoading } = useLoading();
  const dispatch = useDispatch()
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");
  const [expandedReviewImage, setExpandedReviewImage] = useState(null);
  const [product, setProduct] = useState({});
  const [productsRelate, setProductsRelate] = useState([]);
  const [reviewList, setReviewList] = useState({});
  const [isModalReviewOpen, setIsModalReviewOpen] = useState(false);
  const [store, setStore] = useState({});
  const { id } = useParams();
  const requireAuth = useRequireAuth();
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      await Promise.all([
        fetchProductById(id),
        fetchProductReviews(id, { limit: 5, skip: 0 }),
      ]);

      setLoading(false);
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (product && product.category_id?.length > 0) {
      fetchProductRelate();
    }
  }, [product]);

  const fetchProductById = async (id) => {
    try {
      const response = await productService.getProductById(id);
      if (response.isSuccess) {
        setProduct(response.data);
        create_logger({
          customer_id: localStorage.getItem('customer_id'),
          action_type: log_action_type.CLICK_PRODUCT,
          product_id: id,
          keywords: product?.keywords,
          categories: response.data.category_id?.map(item => item._id).filter(item => !!item).toString(),
        })
        setStore(response.data.store_info);
      } else {
        showToast.error("Không tìm thấy sản phẩm");
      }
    } catch (error) {
      console.error("Lỗi lấy sản phẩm:", error);
      showToast.error("Đã có lỗi xảy ra khi lấy sản phẩm");
    }
  };

  const fetchProductRelate = async () => {

    try {
      const relateData = {};
      if (product?.category_id?.length > 0) {
        relateData.categories = product?.category_id?.filter(Boolean).map(item => item._id)
      }
      const response = await productService.product_relate(relateData, 10, 0);
      if (response.isSuccess) {
        setProductsRelate(response.data);
      } else {
      }
    } catch (error) {
      showToast.error("Đã có lỗi xảy ra khi lấy sản phẩm liên quan");
    }
  };


  const fetchProductReviews = async (id, { limit = 5, skip = 0 } = {}) => {
    try {
      console.log(`Fetching reviews for product id: ${id}`);
      const response = await reviewService.get_product_review(id, {
        limit,
        skip,
      });
      if (response.isSuccess) {
        setReviewList(response.data);
      } else {
        showToast.error("Không thể lấy đánh giá sản phẩm");
      }
    } catch (error) {
      console.error("Lỗi lấy đánh giá:", error);
      showToast.error("Đã có lỗi xảy ra khi lấy đánh giá");
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const handlePostReview = async (formData) => {
    try {
      setLoading(true);
      formData.append("product_id", id);
      formData.append("review_type", "product_review");
      formData.append("store_id", store._id);

      const response = await reviewService.post_product_review(formData);
      create_logger({
        customer_id: localStorage.getItem('customer_id'),
        action_type: log_action_type.COMMENT,
        product_id: id,
        description: formData.get("content"),
        store_id: store._id
      });
      if (response.isSuccess) {
        showToast.success("Đánh giá thành công");
        await fetchProductReviews(id, { limit: 5, skip: 0 });
      } else {
        showToast.error("Lỗi đánh giá sản phẩm");
      }
    } catch (error) {
      console.error("Lỗi đăng đánh giá:", error);
      showToast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewShop = () => {
    if (store?._id) {
      navigate(`/store/${store._id}`);
    } else {
      showToast.error("Không tìm thấy thông tin shop");
    }
  };

  const images =
    [product?.main_image, ...(product?.additional_images || [])].map((img) => ({
      original: img,
      thumbnail: img,
      originalClass: "w-full h-full object-contain",
      thumbnailClass: "object-cover",
    })) || [];

  const moveItemToCart = async () => {
    requireAuth(async () => {
      try {
        if (product.stock <= 0 || product.stock < quantity) {
          showToast.error("Không đủ hàng trong kho để thêm vào giỏ hàng");
          return;
        }
        await customerItemsService.addToCart({
          product_id: product._id,
          quantity: quantity,
          type: 'cart'
        });

        dispatch(incrementCartCount())
        showToast.success('Thêm vào giỏ hàng thành công');

      } catch (error) {
        showToast.error('Lỗi thêm sản phẩm vào giỏ hàng: ', error.message);

        console.error('Error moving item to cart:', error);
      }
    })


  }
  return product ? (
    <div className="container mx-auto py-6">
      <div className="flex items-center text-sm text-gray-500 mb-6">
        <a href="/" className="hover:text-blue-600">
          Trang chủ
        </a>
        <ChevronRight size={16} className="mx-2" />
        <a href="/dien-thoai" className="hover:text-blue-600">
          Sản phẩm
        </a>
        <ChevronRight size={16} className="mx-2" />
        <a href="/dien-thoai/samsung" className="hover:text-blue-600">
          {product?.name}
        </a>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          <div className="w-full mx-auto">
            <div className="relative mb-4 rounded-lg overflow-hidden h-fit">
              <div className="product-gallery-container aspect-square">
                <ImageGallery
                  items={images}
                  showPlayButton={false}
                  showFullscreenButton={false}
                  showNav={true}
                  thumbnailPosition="bottom"
                  useBrowserFullscreen={false}
                  additionalClass="aspect-square"
                />
              </div>
              {product.discount > 0 && (
                <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded-md text-sm font-bold">
                  -{product.discount}%
                </div>
              )}
            </div>
            <div className="flex justify-center gap-4 mt-4">
              <button className="flex items-center gap-1 text-sm text-gray-700 hover:text-blue-600">
                <Share2 size={18} />
                <span>Chia sẻ</span>
              </button>
              <button className="flex items-center gap-1 text-sm text-gray-700 hover:text-red-600">
                <Heart size={18} />
                <span>Yêu thích</span>
              </button>
              <button className="flex items-center gap-1 text-sm text-gray-700 hover:text-blue-600">
                <MessageCircle size={18} />
                <span>Hỏi đáp</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-gray-800 mb-3">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center">
                <span className="font-bold text-lg text-red-600 mr-2 flex items-center top-[3px] relative">
                  {product.average_rating}
                </span>
                <Rating
                  initialValue={product.average_rating}
                  size={20}
                  allowFraction
                  readonly
                  SVGstyle={{ display: "inline-block" }}
                  fillColor="#facc15"
                  emptyColor="#e5e7eb"
                />
              </div>
              <div className="text-sm text-gray-600 border-l border-gray-300 pl-4">
                <span>{product.total_reviews} đánh giá</span>
              </div>
              <div className="text-sm text-gray-600 border-l border-gray-300 pl-4">
                <span>{product.quantitySold} đã bán</span>
              </div>
            </div>
            <div className="flex items-baseline gap-3 mb-4">
              <div className="text-3xl font-bold text-red-600">
                {formatCurrency(product.price)}
              </div>
              {product.originalPrice > product.price && (
                <div className="text-base text-gray-500 line-through">
                  {formatCurrency(product.originalPrice)}
                </div>
              )}
            </div>
            {
              product.isTraceVerified &&
              <BlockchainAuthModal productId={product._id} isAuthenticated={product.isTraceVerified} />
            }
            <div className="mb-6">
              <div className="text-sm font-medium text-gray-700 mb-2">
                Màu sắc:
              </div>

              {!!product?.colors?.length && (
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((colorValue, index) => {
                    const matchedOption = COLOR_OPTIONS.find(opt => opt.value === colorValue);

                    return (
                      <div
                        key={colorValue}
                        className={`px-4 py-2 border rounded-lg cursor-pointer text-sm 
                          "border-gray-300 hover:border-blue-300"
                          `}
                      >
                        {matchedOption?.label || colorValue}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mb-6">
              <div className="text-sm font-medium text-gray-700 mb-2">
                Số lượng:
              </div>
              <div className="flex items-center">
                <button
                  className="w-10 h-10 rounded-l-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                  onClick={decreaseQuantity}
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-16 h-10 border-t border-b border-gray-300 text-center outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <button
                  className="w-10 h-10 rounded-r-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                  onClick={increaseQuantity}
                >
                  +
                </button>
                <span className="ml-3 text-sm text-gray-600">
                  {product.stock > 0 ? "Còn hàng" : "Hết hàng"}
                </span>
              </div>
            </div>
            <div className="flex gap-4 mt-2">
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-colors"
                onClick={() => moveItemToCart()}
              >
                <ShoppingCart size={20} />
                <span>Thêm vào giỏ</span>
              </button>
              {/* <button className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg shadow-sm transition-colors">
                Mua ngay
              </button> */}
            </div>

            <div className="mt-4">
              <a
                href="https://zalo.me/your_zalo_id"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg animate-bounce shadow-md transition"
              >
                <img
                  src="/zalo-icon.png"
                  alt="Zalo"
                  className="w-6 h-6"
                />
                <span>Nhấn để chat Zalo - Tư vấn ngay</span>
              </a>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-6 border-t border-gray-200 pt-6">
              <div className="flex flex-col items-center text-center">
                <Truck size={22} className="text-blue-600 mb-2" />
                <span className="text-xs text-gray-600">
                  Giao hàng miễn phí
                </span>
              </div>
              <div className="flex flex-col items-center text-center">
                <Shield size={22} className="text-blue-600 mb-2" />
                <span className="text-xs text-gray-600">Bảo hành 24 tháng</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <RotateCcw size={22} className="text-blue-600 mb-2" />
                <span className="text-xs text-gray-600">30 ngày đổi trả</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-800">Thông tin shop</h2>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full overflow-hidden">
              <img
                src={store.store_logo}
                alt={store.store_name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-grow">
              <h3 className="text-xl font-bold text-gray-800 mb-1">
                {store.store_name}
              </h3>

              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Store size={16} className="text-gray-500" />
                  <span>{store.totalProduct} sản phẩm</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin size={16} className="text-gray-500" />
                  <span>{store.address}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle size={16} className="text-gray-500" />
                  <span>Phản hồi trong 5 phút</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleViewShop}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-colors"
              >
                Xem shop
              </button>

            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              className={`px-6 py-3 text-sm font-medium ${activeTab === "description"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-800"
                }`}
              onClick={() => setActiveTab("description")}
            >
              Mô tả sản phẩm
            </button>
            <button
              className={`px-6 py-3 text-sm font-medium ${activeTab === "specifications"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-800"
                }`}
              onClick={() => setActiveTab("specifications")}
            >
              Thông số kỹ thuật
            </button>
          </div>
        </div>
        <div className="p-6">
          {activeTab === "description" ? (
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          ) : (
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: product.specifications }}
            />
          )}
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-800">
            Đánh giá từ khách hàng
          </h2>
        </div>
        <div className="p-6">
          <div className="flex bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex-1 flex flex-col items-center justify-center border-r border-blue-100">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {product.average_rating}/5
              </div>
              <div className="flex mb-1">
                <Rating
                  initialValue={product.average_rating}
                  size={20}
                  allowFraction
                  readonly
                  SVGstyle={{ display: "inline-block" }}
                  fillColor="#facc15"
                  emptyColor="#e5e7eb"
                />
              </div>
              <div className="text-sm text-gray-600">
                {product.total_reviews} đánh giá
              </div>
            </div>
            <div className="flex-1 pl-6">
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const totalReviewCount =
                    reviewList.count1Star +
                    reviewList.count2Star +
                    reviewList.count3Star +
                    reviewList.count4Star +
                    reviewList.count5Star;
                  const reviewCounts = {
                    5: reviewList.count5Star || 0,
                    4: reviewList.count4Star || 0,
                    3: reviewList.count3Star || 0,
                    2: reviewList.count2Star || 0,
                    1: reviewList.count1Star || 0,
                  };
                  const count = reviewCounts[star];
                  const percentage = totalReviewCount
                    ? Math.round((count / totalReviewCount) * 100)
                    : 0;
                  return (
                    <div key={star} className="flex items-center text-sm">
                      <div className="flex items-center w-16">
                        <span>{star}</span>
                        <Star
                          size={12}
                          className="ml-1 fill-yellow-400 text-yellow-400"
                        />
                      </div>
                      <div className="w-48 h-2 bg-gray-200 rounded-full mx-2">
                        <div
                          className="h-2 bg-yellow-400 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-gray-600">{percentage}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-6">
            <button className="px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded-full">
              Tất cả
            </button>
            {!!reviewList.count5Star && reviewList.count5Star > 0 && (
              <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full">
                5 Sao ({reviewList.count5Star})
              </button>
            )}
            {!!reviewList.count4Star && reviewList.count4Star > 0 && (
              <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full">
                4 Sao ({reviewList.count4Star})
              </button>
            )}
            {!!reviewList.count3Star && reviewList.count3Star > 0 && (
              <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full">
                3 Sao ({reviewList.count3Star})
              </button>
            )}
            {!!reviewList.count2Star && reviewList.count2Star > 0 && (
              <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full">
                2 Sao ({reviewList.count2Star})
              </button>
            )}
            {!!reviewList.count1Star && reviewList.count1Star > 0 && (
              <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full">
                1 Sao ({reviewList.count1Star})
              </button>
            )}
          </div>
          <div className="space-y-6">
            <button
              className="mb-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              onClick={() => setIsModalReviewOpen(true)}
            >
              Viết đánh giá
            </button>
            <ReviewModal
              visible={isModalReviewOpen}
              onClose={() => setIsModalReviewOpen(false)}
              onSubmit={handlePostReview}
            />
            {reviewList?.reviewList?.map((review) => (
              <div
                key={review._id}
                className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <img
                      src={review.customer_id.avatar || '/user.png'}
                      alt={review.customer_id.fullName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">
                      {review.customer_id.fullName}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="flex">
                        <Rating
                          initialValue={review.rating}
                          size={20}
                          allowFraction
                          readonly
                          SVGstyle={{ display: "inline-block" }}
                          fillColor="#facc15"
                          emptyColor="#e5e7eb"
                        />
                      </div>
                      <span>|</span>
                      <span>{formatDateTime(review.created_at)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-gray-800 mb-3">{review.content}</div>
                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2 mb-3">
                    {review.images.map((img, idx) => (
                      <div
                        key={idx}
                        className="w-16 h-16 rounded-md overflow-hidden cursor-pointer"
                        onClick={() => setExpandedReviewImage(img)}
                      >
                        <img
                          src={img}
                          alt={`Review image ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
                <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600">
                  <ThumbsUp size={14} />
                  <span>Hữu ích ({review.helpful || 0})</span>
                </button>
                {review.reply && (
                  <div className="mt-3 bg-gray-50 p-3 rounded-md border-l-4 border-blue-500">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden">
                        <img
                          src={store.store_logo}
                          alt={store.store_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium text-gray-800 flex items-center">
                          {store.store_name}
                          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                            Shop
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDateTime(review.reply.replied_at)}
                        </div>
                      </div>
                    </div>
                    <div className="text-gray-700 pl-10">
                      {review.reply.content}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <button className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
              Xem thêm đánh giá
            </button>
          </div>
          {expandedReviewImage && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
              <div className="max-w-3xl max-h-full relative">
                <button
                  className="absolute -top-10 right-0 text-white"
                  onClick={() => setExpandedReviewImage(null)}
                >
                  Đóng
                </button>
                <img
                  src={expandedReviewImage}
                  alt="Review detail"
                  className="max-w-full max-h-[80vh] object-contain"
                />
              </div>
            </div>
          )}
        </div>
      </div>
      <CarouselList
        title="Sản phẩm tương tự"
        icon={<ThumbsUp size={18} />}
        viewAll="/related-products"
      >
        {productsRelate.map((product) => (
          <div key={product.id} className="flex-shrink-0 w-64">
            <ProductCardItem product={product} />
          </div>
        ))}
      </CarouselList>
      <button
        className="fixed bottom-6 right-6 bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-blue-700 transition-colors"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <ChevronLeft size={24} className="rotate-90" />
      </button>
    </div>
  ) : null;
};

export default ProductDetailPage;