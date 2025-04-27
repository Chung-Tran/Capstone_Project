import React, { useState, useEffect } from 'react';
import {
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  BellOutlined
} from '@ant-design/icons';
import {
  Table,
  Card,
  Badge,
  Space,
  Typography,
  Avatar,
  Rate,
  Input,
  Button,
  Select,
  Tag
} from 'antd';
import { useSelector } from 'react-redux';
import productService from '../../services/product.service';
import reviewService from '../../services/review.service';
import ReviewProductModal from './ReviewProductModal';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const ReviewManager = () => {
  // State for products
  const shopInfo = useSelector((state) => state.shop.shopInfo);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // UI states
  const [loading, setLoading] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [productFilter, setProductFilter] = useState({
    search: '',
    status: '',
  });

  // Fetch all products with review stats
  const fetchProducts = async () => {
    if (shopInfo?._id) {
      setLoading(true);
      try {
        const response = await reviewService.getProductListAndReviewsByStoreId(shopInfo._id, { limit: 10, skip: 0 });
        if (response.isSuccess) {
          setProducts(response.data?.products || []);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Load products on component mount
  useEffect(() => {
    fetchProducts();
  }, [shopInfo?._id]);

  // Handle opening review modal for a product
  const handleViewReviews = (product) => {
    setSelectedProduct(product);
    setReviewModalVisible(true);
  };

  // Handle filter changes for products
  const handleProductFilterChange = (name, value) => {
    setProductFilter(prev => ({ ...prev, [name]: value }));
  };

  // Apply product filters
  const handleApplyProductFilter = () => {
    // Implementation would be added here for filtering products
    // This would likely require a call to the backend with filter params
    console.log('Applying filters:', productFilter);
  };

  // Product table columns
  const productColumns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Avatar
            shape="square"
            size={64}
            src={record.main_image || 'https://via.placeholder.com/64'}
          />
          <Space direction="vertical" size={0}>
            <Text strong>{text}</Text>
            <Text type="secondary">CODE: {record.product_code || 'N/A'}</Text>
            {record.hasNewReviews && (
              <Badge
                count={<BellOutlined style={{ color: '#f5222d' }} />}
                offset={[5, 0]}
              >
                <Tag color="red">Đánh giá mới</Tag>
              </Badge>
            )}
          </Space>
        </Space>
      ),
    },
    {
      title: 'Đánh giá',
      key: 'rating',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Space>
            <Rate disabled defaultValue={record.avgRating || 0} allowHalf />
            <Text strong>{record.avgRating || 0}</Text>
          </Space>
          <Text type="secondary">{record.totalReviews || 0} đánh giá</Text>
        </Space>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => handleViewReviews(record)}
        >
          Xem đánh giá
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Card className="mb-6">
        <Title level={3}>Quản lý đánh giá sản phẩm</Title>
        <Paragraph>
          Xem và phản hồi đánh giá từ khách hàng về sản phẩm của bạn.
        </Paragraph>
      </Card>

      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Space>
            <Input
              placeholder="Tìm kiếm sản phẩm"
              prefix={<SearchOutlined />}
              style={{ width: 250 }}
              value={productFilter.search}
              onChange={(e) => handleProductFilterChange('search', e.target.value)}
            />
            <Select
              value={productFilter.status}
              style={{ width: 150 }}
              onChange={(value) => handleProductFilterChange('status', value)}
            >
              <Option value="">Tất cả trạng thái</Option>
              <Option value="has_new">Có đánh giá mới</Option>
              <Option value="no_reply">Chưa phản hồi</Option>
            </Select>
            <Button
              type="primary"
              icon={<FilterOutlined />}
              onClick={handleApplyProductFilter}
            >
              Lọc
            </Button>
          </Space>

          <Table
            columns={productColumns}
            dataSource={products}
            rowKey="_id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
            }}
            loading={loading}
          />
        </Space>
      </Card>

      {/* Review Modal Component */}
      <ReviewProductModal
        visible={reviewModalVisible}
        product={selectedProduct}
        onCancel={() => setReviewModalVisible(false)}
      />
    </div>
  );
};

export default ReviewManager;