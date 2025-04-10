import React, { useState, useEffect } from 'react';
import {
    List,
    Typography,
    Badge,
    Avatar,
    Button,
    Divider,
    Space,
    Pagination,
    Spin,
    Empty,
    Tag,
    Dropdown,
    Menu,
    Tooltip,
    Modal,
    message
} from 'antd';
import {
    BellOutlined,
    CheckOutlined,
    DeleteOutlined,
    EllipsisOutlined,
    FilterOutlined,
    RedoOutlined,
    ExclamationCircleOutlined,
    CloseOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { confirm } = Modal;

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalNotifications, setTotalNotifications] = useState(0);
    const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
    const pageSize = 10;

    // Giả lập dữ liệu thông báo
    useEffect(() => {
        const fetchNotifications = async () => {
            setLoading(true);
            try {
                // Giả lập API call
                await new Promise(resolve => setTimeout(resolve, 800));

                // Tạo dữ liệu mẫu
                const mockData = Array.from({ length: 35 }, (_, index) => {
                    const now = new Date();
                    const id = `notif-${100 + index}`;
                    const randomDaysAgo = Math.floor(Math.random() * 15);
                    const date = new Date(now.getTime() - randomDaysAgo * 24 * 60 * 60 * 1000);

                    // Tạo các loại thông báo khác nhau
                    const types = ['order', 'promotion', 'system', 'payment', 'shipping'];
                    const type = types[Math.floor(Math.random() * types.length)];

                    // Nội dung thông báo dựa trên loại
                    let title = '';
                    let description = '';
                    let avatar = '';

                    switch (type) {
                        case 'order':
                            title = `Đơn hàng #${10000 + Math.floor(Math.random() * 5000)} đã được xác nhận`;
                            description = 'Đơn hàng của bạn đã được xác nhận và đang được chuẩn bị giao đến bạn.';
                            avatar = '📦';
                            break;
                        case 'promotion':
                            title = 'Ưu đãi đặc biệt dành cho bạn!';
                            description = `Giảm giá ${Math.floor(Math.random() * 30) + 10}% cho đơn hàng tiếp theo của bạn. Mã: SALE${Math.floor(Math.random() * 1000)}`;
                            avatar = '🎁';
                            break;
                        case 'system':
                            title = 'Cập nhật hệ thống';
                            description = 'Hệ thống sẽ bảo trì từ 23:00 đến 01:00 ngày mai. Xin lỗi vì sự bất tiện này.';
                            avatar = '🔧';
                            break;
                        case 'payment':
                            title = 'Thanh toán thành công';
                            description = `Bạn đã thanh toán thành công số tiền ${(Math.random() * 2000000 + 100000).toFixed(0)}đ.`;
                            avatar = '💰';
                            break;
                        case 'shipping':
                            title = 'Đơn hàng đang được giao';
                            description = 'Đơn hàng của bạn đang được giao. Dự kiến sẽ đến trong 2-3 ngày tới.';
                            avatar = '🚚';
                            break;
                    }

                    return {
                        id,
                        title,
                        description,
                        date,
                        type,
                        avatar,
                        read: Math.random() > 0.4, // 40% cơ hội là chưa đọc
                        important: Math.random() > 0.7 // 30% cơ hội là quan trọng
                    };
                });

                // Sắp xếp theo thời gian giảm dần (mới nhất đầu tiên)
                mockData.sort((a, b) => b.date - a.date);

                // Lọc theo trạng thái đã đọc/chưa đọc
                let filteredData = mockData;
                if (filter === 'unread') {
                    filteredData = mockData.filter(item => !item.read);
                } else if (filter === 'read') {
                    filteredData = mockData.filter(item => item.read);
                }

                // Phân trang
                const startIndex = (currentPage - 1) * pageSize;
                const endIndex = startIndex + pageSize;
                const paginatedData = filteredData.slice(startIndex, endIndex);

                setNotifications(paginatedData);
                setTotalNotifications(filteredData.length);
                setLoading(false);
            } catch (error) {
                console.error('Lỗi khi tải thông báo:', error);
                setLoading(false);
                message.error('Không thể tải thông báo. Vui lòng thử lại sau.');
            }
        };

        fetchNotifications();
    }, [currentPage, filter]);

    // Xử lý khi đánh dấu đã đọc
    const handleMarkAsRead = (id) => {
        setNotifications(prev =>
            prev.map(notification =>
                notification.id === id ? { ...notification, read: true } : notification
            )
        );
        message.success('Đã đánh dấu thông báo là đã đọc');
    };

    // Xử lý khi đánh dấu tất cả đã đọc
    const handleMarkAllAsRead = () => {
        confirm({
            title: 'Bạn có chắc muốn đánh dấu tất cả thông báo là đã đọc?',
            icon: <ExclamationCircleOutlined />,
            content: 'Thao tác này sẽ đánh dấu tất cả thông báo của bạn là đã đọc.',
            onOk() {
                setNotifications(prev =>
                    prev.map(notification => ({ ...notification, read: true }))
                );
                message.success('Đã đánh dấu tất cả thông báo là đã đọc');
            }
        });
    };

    // Xử lý khi xóa thông báo
    const handleDeleteNotification = (id) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
        message.success('Đã xóa thông báo');
    };

    // Xử lý khi xóa tất cả thông báo
    const handleDeleteAllNotifications = () => {
        confirm({
            title: 'Xóa tất cả thông báo?',
            icon: <ExclamationCircleOutlined />,
            content: 'Bạn có chắc chắn muốn xóa tất cả thông báo? Hành động này không thể hoàn tác.',
            okText: 'Xóa tất cả',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk() {
                setNotifications([]);
                setTotalNotifications(0);
                message.success('Đã xóa tất cả thông báo');
            }
        });
    };

    // Xử lý thay đổi trang
    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo(0, 0);
    };

    // Xử lý thay đổi bộ lọc
    const handleFilterChange = (filterValue) => {
        setFilter(filterValue);
        setCurrentPage(1);
    };

    // Menu cho các tùy chọn bộ lọc
    const filterMenu = (
        <Menu
            selectedKeys={[filter]}
            onClick={({ key }) => handleFilterChange(key)}
            items={[
                {
                    key: 'all',
                    label: 'Tất cả thông báo',
                },
                {
                    key: 'unread',
                    label: 'Chưa đọc',
                },
                {
                    key: 'read',
                    label: 'Đã đọc',
                },
            ]}
        />
    );

    // Menu cho các hành động của từng thông báo
    const getNotificationMenu = (notification) => (
        <Menu
            items={[
                {
                    key: 'read',
                    label: notification.read ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc',
                    icon: <CheckOutlined />,
                    onClick: () => handleMarkAsRead(notification.id)
                },
                {
                    key: 'delete',
                    label: 'Xóa thông báo',
                    icon: <DeleteOutlined />,
                    danger: true,
                    onClick: () => handleDeleteNotification(notification.id)
                },
            ]}
        />
    );

    // Hàm định dạng thời gian
    const formatTime = (date) => {
        const now = new Date();
        const diffInMs = now - date;
        const diffInSeconds = Math.floor(diffInMs / 1000);
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        const diffInHours = Math.floor(diffInMinutes / 60);
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInDays > 0) {
            return `${diffInDays} ngày trước`;
        } else if (diffInHours > 0) {
            return `${diffInHours} giờ trước`;
        } else if (diffInMinutes > 0) {
            return `${diffInMinutes} phút trước`;
        } else {
            return 'Vừa xong';
        }
    };

    // Lấy màu tag dựa trên loại thông báo
    const getTagColor = (type) => {
        switch (type) {
            case 'order':
                return 'blue';
            case 'promotion':
                return 'purple';
            case 'system':
                return 'orange';
            case 'payment':
                return 'green';
            case 'shipping':
                return 'cyan';
            default:
                return 'default';
        }
    };

    // Lấy tên tag dựa trên loại thông báo
    const getTagName = (type) => {
        switch (type) {
            case 'order':
                return 'Đơn hàng';
            case 'promotion':
                return 'Khuyến mãi';
            case 'system':
                return 'Hệ thống';
            case 'payment':
                return 'Thanh toán';
            case 'shipping':
                return 'Vận chuyển';
            default:
                return type;
        }
    };

    const unreadCount = notifications.filter(notification => !notification.read).length;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <BellOutlined style={{ fontSize: '28px', color: '#1890ff', marginRight: '12px' }} />
                    <Title level={2} style={{ margin: 0 }}>Thông báo</Title>
                    {unreadCount > 0 && (
                        <Badge count={unreadCount} style={{ marginLeft: '12px' }} />
                    )}
                </div>

                <Space>
                    <Dropdown overlay={filterMenu} trigger={['click']}>
                        <Button icon={<FilterOutlined />}>
                            {filter === 'all' ? 'Tất cả' : filter === 'unread' ? 'Chưa đọc' : 'Đã đọc'}
                        </Button>
                    </Dropdown>

                    <Button icon={<RedoOutlined />} onClick={() => {
                        setLoading(true);
                        setTimeout(() => setLoading(false), 500);
                    }}>
                        Làm mới
                    </Button>

                    <Dropdown
                        menu={{
                            items: [
                                {
                                    key: 'mark-all-read',
                                    label: 'Đánh dấu tất cả đã đọc',
                                    icon: <CheckOutlined />,
                                    onClick: handleMarkAllAsRead
                                },
                                {
                                    key: 'delete-all',
                                    label: 'Xóa tất cả thông báo',
                                    icon: <DeleteOutlined />,
                                    danger: true,
                                    onClick: handleDeleteAllNotifications
                                },
                            ]
                        }}
                    >
                        <Button type="text" icon={<EllipsisOutlined style={{ fontSize: '20px' }} />} />
                    </Dropdown>
                </Space>
            </div>

            <Divider style={{ margin: '0 0 16px 0' }} />

            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <Spin size="large" tip="Đang tải thông báo..." />
                </div>
            ) : notifications.length === 0 ? (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                        <Text>
                            {filter === 'all'
                                ? 'Bạn không có thông báo nào.'
                                : filter === 'unread'
                                    ? 'Bạn không có thông báo chưa đọc nào.'
                                    : 'Bạn không có thông báo đã đọc nào.'}
                        </Text>
                    }
                />
            ) : (
                <>
                    <List
                        itemLayout="horizontal"
                        dataSource={notifications}
                        renderItem={(item) => (
                            <List.Item
                                style={{
                                    padding: '16px',
                                    borderRadius: '8px',
                                    backgroundColor: item.read ? 'transparent' : 'rgba(24, 144, 255, 0.05)',
                                    marginBottom: '8px',
                                    transition: 'background-color 0.3s',
                                    position: 'relative',
                                    borderLeft: item.important ? '4px solid #ff4d4f' : 'none',
                                }}
                                actions={[
                                    <Dropdown overlay={getNotificationMenu(item)} trigger={['click']}>
                                        <Button type="text" icon={<EllipsisOutlined />} />
                                    </Dropdown>
                                ]}
                            >
                                {!item.read && (
                                    <Badge
                                        dot
                                        style={{
                                            position: 'absolute',
                                            top: '16px',
                                            left: '8px'
                                        }}
                                    />
                                )}

                                <List.Item.Meta
                                    avatar={
                                        <Avatar style={{
                                            backgroundColor: item.type === 'order' ? '#1890ff' :
                                                item.type === 'promotion' ? '#722ed1' :
                                                    item.type === 'system' ? '#fa8c16' :
                                                        item.type === 'payment' ? '#52c41a' :
                                                            '#13c2c2',
                                            fontSize: '20px',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}>
                                            {item.avatar}
                                        </Avatar>
                                    }
                                    title={
                                        <div style={{ display: 'flex', alignItems: 'center', fontWeight: item.read ? 'normal' : 'bold' }}>
                                            <Text style={{ marginRight: '8px', fontWeight: item.read ? 'normal' : 'bold' }}>
                                                {item.title}
                                            </Text>
                                            <Tag color={getTagColor(item.type)}>{getTagName(item.type)}</Tag>
                                        </div>
                                    }
                                    description={
                                        <div>
                                            <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: '4px' }}>
                                                {item.description}
                                            </Paragraph>
                                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                                {formatTime(item.date)}
                                            </Text>
                                        </div>
                                    }
                                />

                                {!item.read && (
                                    <Tooltip title="Đánh dấu đã đọc">
                                        <Button
                                            type="text"
                                            size="small"
                                            icon={<CheckOutlined />}
                                            onClick={() => handleMarkAsRead(item.id)}
                                            style={{ marginLeft: '8px' }}
                                        />
                                    </Tooltip>
                                )}
                            </List.Item>
                        )}
                    />

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                        <Pagination
                            current={currentPage}
                            total={totalNotifications}
                            pageSize={pageSize}
                            onChange={handlePageChange}
                            showSizeChanger={false}
                            showTotal={(total) => `Tổng cộng ${total} thông báo`}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default Notifications;