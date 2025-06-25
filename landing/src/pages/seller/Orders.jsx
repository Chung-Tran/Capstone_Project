import React, { useEffect, useState } from 'react';
import {
    Table,
    Card,
    Button,
    Modal,
    Tag,
    Row,
    Col,
    Input,
    Select,
    DatePicker,
    Space,
    Typography,
    Descriptions,
    Image,
    Divider,
    Avatar,
    Statistic,
    Badge,
    Tooltip,
    notification,
    Spin,
    Alert
} from 'antd';
import {
    EyeOutlined,
    SearchOutlined,
    FilterOutlined,
    ShoppingCartOutlined,
    UserOutlined,
    CalendarOutlined,
    DollarOutlined,
    TruckOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    StopOutlined,
    SyncOutlined,
    PhoneOutlined,
    MailOutlined,
    HomeOutlined,
    CreditCardOutlined,
    ShopOutlined
} from '@ant-design/icons';
import orderService from '../../services/order.service';
import { getStatusOrder } from '../../common/methodsCommon';
import OrderActions from '../../components/order/OrderActions';
import { showToast } from '../../utils/toast';
import { PaymentStatusTag } from '../account/OrderHistory';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dateRange, setDateRange] = useState(null);
    const [orderItemsDetail, setOrderItemsDetail] = useState([]);
    const [detailLoading, setDetailLoading] = useState(false);
    // Thống kê đơn hàng
    const [orderStats, setOrderStats] = useState({
        total: 0,
        pending: 0,
        processing: 0,
        shipped: 0,
        cancelled: 0
    });

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        filterOrders();
    }, [orders, searchText, statusFilter, dateRange]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await orderService.get_store_order();
            const orderData = response?.data || [];
            setOrders(orderData);
            calculateStats(orderData);
        } catch (error) {
            notification.error({
                message: 'Lỗi',
                description: 'Không thể tải dữ liệu đơn hàng'
            });
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (orderData) => {
        const stats = {
            total: orderData.length,
            pending: orderData.filter(order => order.status === 'pending').length,
            processing: orderData.filter(order => order.status === 'processing').length,
            shipped: orderData.filter(order => order.status === 'shipped').length,
            cancelled: orderData.filter(order => order.status === 'cancelled').length
        };
        setOrderStats(stats);
    };

    const filterOrders = () => {
        let filtered = orders;

        // Lọc theo tìm kiếm
        if (searchText) {
            filtered = filtered.filter(order =>
                order.order_id.toLowerCase().includes(searchText.toLowerCase()) ||
                order.receiverName.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        // Lọc theo trạng thái
        if (statusFilter) {
            filtered = filtered.filter(order => order.status === statusFilter);
        }

        // Lọc theo ngày
        if (dateRange && dateRange.length === 2) {
            filtered = filtered.filter(order => {
                const orderDate = new Date(order.created_at);
                return orderDate >= dateRange[0].toDate() && orderDate <= dateRange[1].toDate();
            });
        }

        setFilteredOrders(filtered);
    };

    const handleViewDetail = async (order) => {
        setSelectedOrder(order);
        setDetailLoading(true);
        setIsDetailOpen(true);
        try {
            const orderDetail = await orderService.get_store_order_detail(order.order_id);
            setOrderItemsDetail(orderDetail.data);

        } catch (error) {

        } finally {
            setDetailLoading(false);

        }
    };

    const closeDetail = () => {
        setIsDetailOpen(false);
        setSelectedOrder(null);
    };

    const clearFilters = () => {
        setSearchText('');
        setStatusFilter('');
        setDateRange(null);
    };

    const columns = [
        {
            title: 'Mã đơn hàng',
            dataIndex: 'order_code',
            key: 'order_id',
            width: 150,
            render: (text) => (
                <Text strong copyable={{ text }}>
                    {text}
                </Text>
            ),
        },
        {
            title: 'Khách hàng',
            dataIndex: 'receiverName',
            key: 'receiverName',
            render: (text) => (
                <Space>
                    <Avatar icon={<UserOutlined />} size="small" />
                    <Text>{text}</Text>
                </Space>
            ),
        },
        {
            title: 'Ngày đặt',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => (
                <Space>
                    <CalendarOutlined />
                    <Text>{new Date(date).toLocaleDateString('vi-VN')}</Text>
                </Space>
            ),
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'total_amount',
            key: 'total_amount',
            render: (amount) => (
                <Text strong style={{ color: '#1890ff' }}>
                    {amount.toLocaleString('vi-VN')}đ
                </Text>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const config = getStatusOrder(status);
                return (
                    <Tag icon={config.icon} color={config.color}>
                        {config.text}
                    </Tag>
                );
            },
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 120,
            render: (_, record) => (
                <Tooltip title="Xem chi tiết">
                    <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        size="small"
                        onClick={() => handleViewDetail(record)}
                    >
                        Chi tiết
                    </Button>
                </Tooltip>
            ),
        },
    ];
    const updateOrderStatus = async (id, nextStatus, reason) => {
        try {
            const res = await orderService.update_order_status(id, nextStatus, reason);
            if (res.isSuccess) {
                showToast.success("Thao tác thành công");

                // Cập nhật đơn hàng cụ thể trong local state
                setOrders(prev =>
                    prev.map(order =>
                        order.order_id === id
                            ? { ...order, status: nextStatus }
                            : order
                    )
                );

                // Cập nhật chi tiết modal (nếu đang mở)
                setOrderItemsDetail(prev => ({
                    ...prev,
                    order: {
                        ...prev.order,
                        status: nextStatus
                    }
                }));

                setIsDetailOpen(false); // Đóng modal nếu cần
            } else {
                showToast.error("Thao tác thất bại");
            }
        } catch (error) {
            console.error('err', error.message);
            showToast.error("Thao tác thất bại");
        }
    };

    return (
        <div style={{ padding: '24px' }}>
            <Title level={2} style={{ marginBottom: '24px' }}>
                <ShoppingCartOutlined /> Quản lý Đơn hàng
            </Title>

            {/* Thống kê tổng quan */}
            <Row gutter={16} style={{ marginBottom: '24px' }}>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Tổng đơn hàng"
                            value={orderStats.total}
                            prefix={<ShoppingCartOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Chờ xử lý"
                            value={orderStats.pending}
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Đang xử lý"
                            value={orderStats.processing}
                            prefix={<SyncOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="Đã giao"
                            value={orderStats.shipped}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Bộ lọc */}
            <Card style={{ marginBottom: '24px' }}>
                <Row gutter={16} align="middle">
                    <Col span={6}>
                        <Input
                            placeholder="Tìm kiếm mã đơn, khách hàng..."
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            allowClear
                        />
                    </Col>
                    <Col span={4}>
                        <Select
                            placeholder="Trạng thái"
                            style={{ width: '100%' }}
                            value={statusFilter}
                            onChange={setStatusFilter}
                            allowClear
                        >
                            <Option value="pending">Chờ xử lý</Option>
                            <Option value="processing">Đang xử lý</Option>
                            <Option value="shipped">Đã giao</Option>
                            <Option value="cancelled">Đã hủy</Option>
                        </Select>
                    </Col>
                    <Col span={6}>
                        <RangePicker
                            style={{ width: '100%' }}
                            placeholder={['Từ ngày', 'Đến ngày']}
                            value={dateRange}
                            onChange={setDateRange}
                        />
                    </Col>
                    <Col span={4}>
                        <Button onClick={clearFilters} icon={<FilterOutlined />}>
                            Xóa bộ lọc
                        </Button>
                    </Col>
                    <Col span={4}>
                        <Button type="primary" onClick={fetchOrders} loading={loading}>
                            Làm mới
                        </Button>
                    </Col>
                </Row>
            </Card>

            {/* Bảng đơn hàng */}
            <Card>
                <Table
                    columns={columns}
                    dataSource={filteredOrders}
                    rowKey="order_id"
                    loading={loading}
                    pagination={{
                        total: filteredOrders.length,
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} của ${total} đơn hàng`,
                    }}
                    scroll={{ x: 1000 }}
                />
            </Card>

            {/* Modal chi tiết đơn hàng */}
            {selectedOrder && orderItemsDetail && orderItemsDetail.order &&
                <Modal
                    title={
                        <Space>
                            <TruckOutlined />
                            <span>Chi tiết đơn hàng: {selectedOrder?.order_code}</span>
                        </Space>
                    }
                    open={isDetailOpen}
                    onCancel={closeDetail}
                    footer={[
                        <OrderActions
                            status={orderItemsDetail.order.status}
                            onAction={(nextStatus, reason) => {
                                updateOrderStatus(orderItemsDetail.order._id, nextStatus, reason);
                            }}
                        />,
                        <Button key="close " className='ml-2' onClick={closeDetail}>
                            Đóng
                        </Button>,
                    ]}
                    width={1200}
                    style={{ top: 20 }}
                >
                    {detailLoading ? (
                        <div style={{ textAlign: 'center', padding: '50px' }}>
                            <Spin size="large" />
                        </div>
                    ) : orderItemsDetail ? (
                        <div>

                            {/* Thông tin đơn hàng */}
                            <Descriptions
                                title="Thông tin đơn hàng"
                                bordered
                                column={2}
                                style={{ marginBottom: '24px' }}
                            >
                                <Descriptions.Item label="Mã đơn hàng" span={2}>
                                    <Text strong copyable={{ text: orderItemsDetail.order?.order_code }}>
                                        {orderItemsDetail.order?.order_code}
                                    </Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Khách hàng">
                                    <Space>
                                        <Avatar icon={<UserOutlined />} size="small" />
                                        {orderItemsDetail.order?.receiverName}
                                    </Space>
                                </Descriptions.Item>
                                <Descriptions.Item label="Số điện thoại">
                                    <Space>
                                        <PhoneOutlined />
                                        {orderItemsDetail.order.receiverPhone}
                                    </Space>
                                </Descriptions.Item>
                                <Descriptions.Item label="Email">
                                    <Space>
                                        <MailOutlined />
                                        {orderItemsDetail.order.receiverEmail || '—'}
                                    </Space>
                                </Descriptions.Item>
                                <Descriptions.Item label="Ngày đặt">
                                    <Space>
                                        <CalendarOutlined />
                                        {new Date(orderItemsDetail.order.created_at).toLocaleString('vi-VN')}
                                    </Space>
                                </Descriptions.Item>
                                <Descriptions.Item label="Trạng thái">
                                    {(() => {
                                        const config = getStatusOrder(orderItemsDetail.order.status);
                                        return (
                                            <Tag icon={config.icon} color={config.color}>
                                                {config.text}
                                            </Tag>
                                        );
                                    })()}
                                </Descriptions.Item>
                                <Descriptions.Item label="Phương thức thanh toán">
                                    <Space>
                                        <CreditCardOutlined />
                                        {orderItemsDetail.order.payment_method || 'COD'}
                                    </Space>
                                </Descriptions.Item>
                                <Descriptions.Item label="Trạng thái thanh toán">
                                    <Space>
                                        <CreditCardOutlined />
                                        <PaymentStatusTag status={orderItemsDetail.order.payment_status} />
                                    </Space>
                                </Descriptions.Item>
                                <Descriptions.Item label="Địa chỉ giao hàng" >
                                    <Space>
                                        <HomeOutlined />
                                        {orderItemsDetail.order.address}
                                    </Space>
                                </Descriptions.Item>
                                <Descriptions.Item label="Tổng tiền đơn hàng">
                                    <Text strong style={{ fontSize: '14px', color: '#666' }}>
                                        {orderItemsDetail.order.total_amount.toLocaleString('vi-VN')}đ
                                    </Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Tiền của cửa hàng">
                                    <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                                        {orderItemsDetail.order.store_total_amount.toLocaleString('vi-VN')}đ
                                    </Text>
                                </Descriptions.Item>
                            </Descriptions>

                            <Divider />

                            {/* Danh sách sản phẩm */}
                            <Title level={4}>Danh sách sản phẩm</Title>
                            <Alert
                                message={`Có ${orderItemsDetail.items.length} sản phẩm thuộc cửa hàng trong đơn hàng này`}
                                type="info"
                                style={{ marginBottom: '16px' }}
                            />

                            {orderItemsDetail.items.map((item, idx) => (
                                <Card
                                    key={idx}
                                    size="small"
                                    style={{ marginBottom: '12px' }}
                                    bodyStyle={{ padding: '12px' }}
                                >
                                    <Row align="middle" gutter={16}>
                                        <Col span={4}>
                                            <Image
                                                src={item.product_id.main_image}
                                                alt={item.product_id.name}
                                                width={60}
                                                height={60}
                                                style={{ objectFit: 'cover', borderRadius: '4px' }}
                                                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FmuFHkSStXdsOWw=="
                                            />
                                        </Col>
                                        <Col span={12}>
                                            <Text strong>{item.product_id.name}</Text>
                                            <br />
                                            <Text type="secondary">
                                                Số lượng: {item.quantity} × {item.unit_price.toLocaleString('vi-VN')}đ
                                            </Text>
                                        </Col>
                                        <Col span={8} style={{ textAlign: 'right' }}>
                                            <Text strong style={{ color: '#1890ff', fontSize: '16px' }}>
                                                {item.total_price.toLocaleString('vi-VN')}đ
                                            </Text>
                                        </Col>
                                    </Row>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Alert
                            message="Không có dữ liệu"
                            description="Không thể tải chi tiết đơn hàng"
                            type="warning"
                        />
                    )}
                </Modal>
            }
        </div>
    );
};

export default Orders;