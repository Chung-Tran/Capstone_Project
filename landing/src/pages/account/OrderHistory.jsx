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

const { Title, Text } = Typography;

const OrderHistory = () => {
    const [orderData, setOrderData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);
    const pageSize = 10;

    // Giả lập dữ liệu cho mục đích minh họa
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                // Thay thế bằng API call thực tế
                setTimeout(() => {
                    const mockOrders = Array.from({ length: 35 }, (_, i) => ({
                        id: `ORD-${1000 + i}`,
                        date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
                        status: ['Đã giao', 'Đang giao', 'Đang xử lý', 'Đã hủy'][Math.floor(Math.random() * 4)],
                        total: Math.floor(Math.random() * 5000000) + 100000,
                        items: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, j) => ({
                            id: `PROD-${j}`,
                            name: ['Áo thun nam', 'Quần jeans nữ', 'Đầm dạ hội', 'Giày thể thao', 'Túi xách', 'Mũ lưỡi trai'][Math.floor(Math.random() * 6)],
                            price: Math.floor(Math.random() * 1000000) + 50000,
                            quantity: Math.floor(Math.random() * 3) + 1,
                            image: '/api/placeholder/80/80'
                        }))
                    }));

                    const startIndex = (currentPage - 1) * pageSize;
                    const endIndex = startIndex + pageSize;

                    setOrderData(mockOrders.slice(startIndex, endIndex));
                    setTotalOrders(mockOrders.length);
                    setLoading(false);
                }, 1000);
            } catch (error) {
                console.error('Lỗi khi tải dữ liệu đơn hàng:', error);
                setLoading(false);
            }
        };

        fetchOrders();
    }, [currentPage]);

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
                        <span>Chi tiết đơn hàng {selectedOrder?.id}</span>
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
                                        <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                                        <div style={{ marginLeft: '16px', flex: 1 }}>
                                            <Text strong>{item.name}</Text>
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
                                    {formatCurrency(selectedOrder.total)}
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