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
    Space,
    Badge
} from 'antd';
import { ShoppingOutlined, HistoryOutlined, EyeOutlined } from '@ant-design/icons';
import orderService from '../../services/order.service';

const { Title, Text } = Typography;

const OrderHistory = () => {
    const [orderData, setOrderData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);
    const pageSize = 10;

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const response = await orderService.get_customer_orders({
                    page: currentPage,
                    limit: pageSize,
                });
                // Lấy mảng orders từ response.data
                const orders = Array.isArray(response.data?.orders) ? response.data.orders : [];
                setOrderData(orders);
                setTotalOrders(response.data?.total || orders.length);
                setLoading(false);
            } catch (error) {
                console.error('Lỗi khi tải dữ liệu đơn hàng:', error);
                setOrderData([]); // Đặt lại thành mảng rỗng nếu lỗi
                setTotalOrders(0);
                setLoading(false);
            }
        };

        fetchOrders();
    }, [currentPage]);

    // ... (Phần còn lại của code giữ nguyên: handleViewOrderDetails, handlePageChange, getStatusColor, formatCurrency, formatDate, columns, JSX)

    const handleViewOrderDetails = (order) => {
        setSelectedOrder(order);
        setModalVisible(true);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        setLoading(true);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Đã giao':
                return 'success';
            case 'Đang giao':
                return 'processing';
            case 'Đang xử lý':
                return 'warning';
            case 'Đã hủy':
                return 'error';
            default:
                return 'default';
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const columns = [
        {
            title: 'Mã đơn hàng',
            dataIndex: 'order_code',
            key: 'order_code',
            render: (order_code) => <Text strong>{order_code}</Text>,
        },
        {
            title: 'Ngày đặt hàng',
            dataIndex: 'date',
            key: 'date',
            render: (date) => formatDate(date),
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'total_amount',
            key: 'total_amount',
            render: (total_amount) => <Text type="success" strong>{formatCurrency(total_amount)}</Text>,
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
        <div className="order-history-container" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
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
                <div className="order-table-container" style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}>
                    <Table
                        columns={columns}
                        dataSource={orderData}
                        rowKey="order_code"
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
                width={700}
            >
                {selectedOrder && (
                    <div className="order-details">
                        <div className="order-summary" style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <Text>Ngày đặt hàng: <Text strong>{formatDate(selectedOrder.date)}</Text></Text>
                                <Badge status={getStatusColor(selectedOrder.status)} text={selectedOrder.status} />
                            </div>
                            <Divider style={{ margin: '12px 0' }} />
                        </div>

                        <div className="order-items">
                            <Title level={5}>Sản phẩm trong đơn hàng</Title>
                            <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '8px 0' }}>
                                {selectedOrder.items.map((item, index) => (
                                    <div key={index} style={{
                                        display: 'flex',
                                        padding: '12px',
                                        borderBottom: index < selectedOrder.items.length - 1 ? '1px solid #f0f0f0' : 'none',
                                        alignItems: 'center'
                                    }}>
                                        <img 
                                            src={item.image || '/api/placeholder/80/80'} 
                                            alt={item.product_name} 
                                            style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} 
                                        />
                                        <div style={{ marginLeft: '16px', flex: 1 }}>
                                            <Text strong>{item.product_name}</Text>
                                            <Text style={{ display: 'block', color: '#888' }}>
                                                Cửa hàng: {item.shop?.name || 'Không xác định'}
                                            </Text>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                                                <Text type="secondary">SL: {item.quantity}</Text>
                                                <Text>{formatCurrency(item.price)}</Text>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Divider style={{ margin: '16px 0' }} />

                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                                <Text strong>Tổng cộng:</Text>
                                <Text type="success" style={{ fontSize: '18px', fontWeight: 'bold' }}>
                                    {formatCurrency(selectedOrder.total_amount)}
                                </Text>
                            </div>
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