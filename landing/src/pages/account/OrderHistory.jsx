import React, { useState, useEffect } from 'react';
import {
    Table,
    Tag,
    Button,
    Modal,
    Pagination,
    Empty,
    Spin,
    Typography,
    Divider,
    Badge,
    Card,
    Image,
    Row,
    Col
} from 'antd';
import { ShoppingOutlined, HistoryOutlined, EyeOutlined, ShopOutlined } from '@ant-design/icons';
import orderService from '../../services/order.service';

const { Title, Text } = Typography;

const PaymentStatusTag = ({ status }) => {
    const statusMap = {
        pending: { text: 'Chưa thanh toán', color: 'gold' },
        success: { text: 'Thành công', color: 'green' },
        failed: { text: 'Thất bại', color: 'red' },
    };

    const { text, color } = statusMap[status] || { text: 'Không xác định', color: 'gray' };

    return <Tag color={color}>{text}</Tag>;
};

const OrderHistory = () => {
    const [orderData, setOrderData] = useState([]);
    const [orderItems, setOrderItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const pageSize = 10;

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await orderService.get_customer_order();
                const formatted = res.data.map(order => ({
                    id: order.order_code,
                    date: order.created_at,
                    total: order.total_amount,
                    status: convertStatus(order.status),
                    raw: order
                }));
                setOrderData(formatted);
                setTotalOrders(res.data.length);
            } catch (error) {
                console.error('Lỗi khi tải dữ liệu đơn hàng:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [currentPage]);

    const handleViewOrderDetails = async (order) => {
        setSelectedOrder(order.raw);
        setModalVisible(true);
        setLoadingDetails(true);

        try {
            const res = await orderService.get_customer_order_detail(order.raw._id);
            setOrderItems(res.data);
        } catch (error) {
            console.error('Lỗi khi tải chi tiết đơn hàng:', error);
            setOrderItems([]);
        } finally {
            setLoadingDetails(false);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        setLoading(true);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Đã giao':
            case 'delivered':
                return 'success';
            case 'Đang giao':
            case 'shipping':
                return 'processing';
            case 'Đang xử lý':
            case 'processing':
                return 'warning';
            case 'Đã hủy':
            case 'cancelled':
                return 'error';
            case 'pending':
                return 'default';
            default:
                return 'default';
        }
    };

    const convertStatus = (status) => {
        const map = {
            pending: 'Đang xử lý',
            processing: 'Đang chuẩn bị',
            shipping: 'Đang giao',
            delivered: 'Đã giao',
            cancelled: 'Đã hủy',
            rejected: 'Từ chối',
            shipped: 'Đang vận chuyển',
            done: 'Hoàn thành',
        };
        return map[status] || status;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Nhóm sản phẩm theo shop
    const groupItemsByStore = (items) => {
        const grouped = {};
        items.forEach(item => {
            const storeId = item.product_id.store_id._id;
            const storeName = item.product_id.store_id.store_name || 'Shop không xác định';
            const storeAddress = item.product_id.store_id.address || 'Shop không xác định';

            if (!grouped[storeId]) {
                grouped[storeId] = {
                    store: {
                        id: storeId,
                        name: storeName,
                        address: storeAddress
                    },
                    items: []
                };
            }
            grouped[storeId].items.push(item);
        });
        return Object.values(grouped);
    };

    const columns = [
        {
            title: 'Mã đơn hàng',
            dataIndex: 'id',
            key: 'id',
            render: (id) => <Text strong>{id}</Text>,
        },
        {
            title: 'Ngày đặt hàng',
            dataIndex: 'date',
            key: 'date',
            render: (date) => formatDate(date),
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'total',
            key: 'total',
            render: (total) => <Text type="success" strong>{formatCurrency(total)}</Text>,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={getStatusColor(status)}>{status}</Tag>
            ),
        },
        {
            title: 'Chi tiết',
            key: 'action',
            render: (_, record) => (
                <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewOrderDetails(record)}
                    size="middle"
                    shape="round"
                >
                    Xem
                </Button>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                <HistoryOutlined style={{ fontSize: '28px', color: '#1890ff', marginRight: '12px' }} />
                <Title level={2} style={{ margin: 0 }}>Lịch sử đơn hàng</Title>
            </div>

            <Divider />

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Spin size="large" tip="Đang tải đơn hàng..." />
                </div>
            ) : orderData.length === 0 ? (
                <Empty
                    description="Bạn chưa có đơn hàng nào"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                    <Button type="primary" icon={<ShoppingOutlined />}>Mua sắm ngay</Button>
                </Empty>
            ) : (
                <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}>
                    <Table
                        columns={columns}
                        dataSource={orderData}
                        rowKey="id"
                        pagination={false}
                        style={{ overflowX: 'auto' }}
                        rowClassName={(record) => record.status === 'Đã hủy' ? 'order-cancelled' : ''}
                        onRow={(record) => ({
                            onClick: () => handleViewOrderDetails(record),
                            style: { cursor: 'pointer' }
                        })}
                    />

                    <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'flex-end' }}>
                        <Pagination
                            current={currentPage}
                            total={totalOrders}
                            pageSize={pageSize}
                            onChange={handlePageChange}
                            showTotal={(total) => `Tổng ${total} đơn hàng`}
                        />
                    </div>
                </div>
            )}

            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <ShoppingOutlined style={{ fontSize: '20px', marginRight: '8px', color: '#1890ff' }} />
                        <span>Chi tiết đơn hàng {selectedOrder?.order_code}</span>
                    </div>
                }
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={[
                    <Button key="back" onClick={() => setModalVisible(false)}>
                        Đóng
                    </Button>
                ]}
                width={800}
                style={{ maxHeight: '80vh' }}
                bodyStyle={{ maxHeight: '60vh', overflowY: 'auto' }}
            >
                {selectedOrder && (
                    <div>
                        {/* Thông tin đơn hàng */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <Text>Ngày đặt: <Text strong>{formatDate(selectedOrder.created_at)}</Text></Text>
                            <Badge status={getStatusColor(selectedOrder.status)} text={convertStatus(selectedOrder.status)} />
                        </div>

                        <Divider />

                        {/* Thông tin người nhận */}
                        <div style={{ marginBottom: '12px' }}>
                            <Text strong>Người nhận:</Text> {selectedOrder.receiverName}<br />
                            <Text strong>SĐT:</Text> {selectedOrder.receiverPhone}<br />
                            <Text strong>Địa chỉ:</Text> {selectedOrder.address}<br />
                            <Text strong>Trạng thái thanh toán: </Text> <PaymentStatusTag status={selectedOrder.payment_status} />

                        </div>

                        <Divider />

                        {/* Chi tiết sản phẩm */}
                        <div style={{ marginBottom: '16px' }}>
                            <Text strong style={{ fontSize: '16px' }}>Sản phẩm đã đặt:</Text>

                            {loadingDetails ? (
                                <div style={{ textAlign: 'center', padding: '20px' }}>
                                    <Spin tip="Đang tải chi tiết sản phẩm..." />
                                </div>
                            ) : orderItems.length > 0 ? (
                                <div style={{ marginTop: '12px' }}>
                                    {groupItemsByStore(orderItems).map((storeGroup, storeIndex) => (
                                        <Card
                                            key={storeGroup.store.id}
                                            style={{ marginBottom: '16px' }}
                                            size="small"
                                        >
                                            {/* Header shop */}
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                marginBottom: '12px',
                                                padding: '8px 0',
                                                borderBottom: '1px solid #f0f0f0'
                                            }}>
                                                <ShopOutlined style={{ fontSize: '16px', color: '#1890ff', marginRight: '8px' }} />
                                                <Text strong style={{ fontSize: '14px' }}>
                                                    Shop: {storeGroup.store.name}
                                                </Text>
                                            </div>

                                            {/* Danh sách sản phẩm của shop */}
                                            {storeGroup.items.map((item, itemIndex) => (
                                                <Row key={item._id} style={{ marginBottom: '12px' }} gutter={16}>
                                                    <Col span={4}>
                                                        <Image
                                                            src={item.product_id.main_image}
                                                            alt={item.product_id.name}
                                                            style={{
                                                                width: '60px',
                                                                height: '60px',
                                                                objectFit: 'cover',
                                                                borderRadius: '6px'
                                                            }}
                                                            preview={false}
                                                        />
                                                    </Col>
                                                    <Col span={12}>
                                                        <div>
                                                            <Text strong style={{ fontSize: '14px' }}>
                                                                {item.product_id.name}
                                                            </Text>
                                                            <br />
                                                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                                                Đơn giá: {formatCurrency(item.unit_price)}
                                                            </Text>
                                                        </div>
                                                    </Col>
                                                    <Col span={4} style={{ textAlign: 'center' }}>
                                                        <Text>Số lượng</Text>
                                                        <br />
                                                        <Text strong>{item.quantity}</Text>
                                                    </Col>
                                                    <Col span={4} style={{ textAlign: 'right' }}>
                                                        <Text>Thành tiền</Text>
                                                        <br />
                                                        <Text strong style={{ color: '#52c41a' }}>
                                                            {formatCurrency(item.total_price)}
                                                        </Text>
                                                    </Col>
                                                </Row>
                                            ))}
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <Empty
                                    description="Không có thông tin sản phẩm"
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                />
                            )}
                        </div>

                        <Divider />

                        {/* Tổng kết đơn hàng */}
                        <div>
                            <Row justify="space-between" style={{ marginBottom: '8px' }}>
                                <Text>Phí vận chuyển:</Text>
                                <Text>{formatCurrency(0)}</Text>
                            </Row>

                            <Divider style={{ margin: '12px 0' }} />
                            <Row justify="space-between">
                                <Text strong style={{ fontSize: '16px' }}>Tổng cộng:</Text>
                                <Text type="success" strong style={{ fontSize: '18px' }}>
                                    {formatCurrency(selectedOrder.total_amount)}
                                </Text>
                            </Row>
                        </div>
                    </div>
                )}
            </Modal>

            <style jsx>{`
                .order-cancelled {
                    opacity: 0.7;
                }
                .ant-table-row:hover {
                    background-color: #f5f5f5;
                }
            `}</style>
        </div>
    );
};

export default OrderHistory;