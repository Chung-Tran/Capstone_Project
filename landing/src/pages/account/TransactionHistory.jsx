import React, { useState, useEffect } from 'react';
import {
    Table,
    Card,
    Typography,
    Tag,
    Button,
    Space,
    DatePicker,
    Input,
    Select,
    Statistic,
    Row,
    Col,
    Divider,
    Tooltip,
    Badge,
    Modal,
    Descriptions,
    Empty,
    Spin,
    Radio,
    Pagination
} from 'antd';
import {
    SearchOutlined,
    FilterOutlined,
    DownloadOutlined,
    ReloadOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    ExclamationCircleOutlined,
    CreditCardOutlined,
    WalletOutlined,
    BankOutlined,
    DollarOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const TransactionHistory = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    const [dateRange, setDateRange] = useState([null, null]);
    const [searchText, setSearchText] = useState('');
    const [transactionType, setTransactionType] = useState('all');
    const [transactionStatus, setTransactionStatus] = useState('all');
    const [sortedInfo, setSortedInfo] = useState({});
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [statisticsData, setStatisticsData] = useState({
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        pendingAmount: 0,
        totalTransactions: 0
    });
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'

    // Giả lập dữ liệu giao dịch
    useEffect(() => {
        const fetchTransactions = async () => {
            setLoading(true);
            try {
                // Giả lập API call
                await new Promise(resolve => setTimeout(resolve, 1000));

                const currentDate = new Date();
                const mockTransactions = Array.from({ length: 50 }, (_, index) => {
                    // Random date within last 90 days
                    const daysAgo = Math.floor(Math.random() * 90);
                    const transactionDate = new Date(currentDate);
                    transactionDate.setDate(currentDate.getDate() - daysAgo);

                    // Random transaction type
                    const types = ['deposit', 'withdrawal', 'transfer', 'payment', 'refund'];
                    const type = types[Math.floor(Math.random() * types.length)];

                    // Random amount based on type
                    let amount;
                    if (type === 'deposit' || type === 'refund') {
                        amount = Math.floor(Math.random() * 50000000) + 100000;
                    } else {
                        amount = -(Math.floor(Math.random() * 30000000) + 50000);
                    }

                    // Random status
                    const statuses = ['completed', 'pending', 'failed'];
                    const statusWeights = [0.8, 0.15, 0.05]; // 80% completed, 15% pending, 5% failed

                    let statusIndex;
                    const randomVal = Math.random();
                    let cumulativeWeight = 0;

                    for (let i = 0; i < statusWeights.length; i++) {
                        cumulativeWeight += statusWeights[i];
                        if (randomVal <= cumulativeWeight) {
                            statusIndex = i;
                            break;
                        }
                    }

                    const status = statuses[statusIndex];

                    // Generate transaction details based on type
                    let description = '';
                    let recipient = '';
                    let paymentMethod = '';
                    let category = '';

                    switch (type) {
                        case 'deposit':
                            description = 'Nạp tiền vào tài khoản';
                            paymentMethod = ['Thẻ tín dụng', 'Chuyển khoản ngân hàng', 'Ví điện tử'][Math.floor(Math.random() * 3)];
                            category = 'Nạp tiền';
                            break;
                        case 'withdrawal':
                            description = 'Rút tiền từ tài khoản';
                            recipient = ['Ngân hàng Vietcombank', 'Ngân hàng BIDV', 'Ngân hàng Techcombank'][Math.floor(Math.random() * 3)];
                            paymentMethod = 'Chuyển khoản ngân hàng';
                            category = 'Rút tiền';
                            break;
                        case 'transfer':
                            description = 'Chuyển tiền cho người dùng khác';
                            recipient = ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Thị D'][Math.floor(Math.random() * 4)];
                            paymentMethod = 'Chuyển khoản nội bộ';
                            category = 'Chuyển tiền';
                            break;
                        case 'payment':
                            description = 'Thanh toán hàng hóa/dịch vụ';
                            recipient = ['Cửa hàng ABC', 'Dịch vụ XYZ', 'Công ty 123', 'Đối tác DEF'][Math.floor(Math.random() * 4)];
                            paymentMethod = ['Thẻ tín dụng', 'Ví điện tử', 'Số dư tài khoản'][Math.floor(Math.random() * 3)];
                            category = ['Mua sắm', 'Dịch vụ', 'Hóa đơn', 'Khác'][Math.floor(Math.random() * 4)];
                            break;
                        case 'refund':
                            description = 'Hoàn tiền cho giao dịch trước đó';
                            recipient = 'Hệ thống';
                            paymentMethod = 'Hoàn trả vào tài khoản';
                            category = 'Hoàn tiền';
                            break;
                    }

                    const transactionId = `TRX${100000 + index}`;

                    return {
                        key: index,
                        id: transactionId,
                        date: transactionDate,
                        amount,
                        type,
                        status,
                        description,
                        recipient,
                        paymentMethod,
                        category,
                        fees: Math.abs(amount) * 0.01, // 1% fee
                        reference: `REF-${Math.floor(Math.random() * 1000000)}`,
                        note: Math.random() > 0.7 ? 'Ghi chú về giao dịch này' : '',
                    };
                });

                // Sort by date (newest first)
                mockTransactions.sort((a, b) => b.date - a.date);

                // Calculate statistics
                const total = mockTransactions.length;
                let totalIncome = 0;
                let totalExpense = 0;
                let pendingAmount = 0;

                mockTransactions.forEach(transaction => {
                    if (transaction.amount > 0) {
                        totalIncome += transaction.amount;
                    } else {
                        totalExpense += Math.abs(transaction.amount);
                    }

                    if (transaction.status === 'pending') {
                        pendingAmount += Math.abs(transaction.amount);
                    }
                });

                setStatisticsData({
                    totalIncome,
                    totalExpense,
                    balance: totalIncome - totalExpense,
                    pendingAmount,
                    totalTransactions: total
                });

                // Apply filters
                let filteredData = [...mockTransactions];

                // Filter by date range
                if (dateRange[0] && dateRange[1]) {
                    const startDate = dateRange[0].startOf('day').toDate();
                    const endDate = dateRange[1].endOf('day').toDate();
                    filteredData = filteredData.filter(
                        item => item.date >= startDate && item.date <= endDate
                    );
                }

                // Filter by search text
                if (searchText) {
                    const searchLower = searchText.toLowerCase();
                    filteredData = filteredData.filter(
                        item =>
                            item.id.toLowerCase().includes(searchLower) ||
                            item.description.toLowerCase().includes(searchLower) ||
                            (item.recipient && item.recipient.toLowerCase().includes(searchLower))
                    );
                }

                // Filter by transaction type
                if (transactionType !== 'all') {
                    filteredData = filteredData.filter(item => item.type === transactionType);
                }

                // Filter by status
                if (transactionStatus !== 'all') {
                    filteredData = filteredData.filter(item => item.status === transactionStatus);
                }

                // Update pagination
                setPagination({
                    ...pagination,
                    total: filteredData.length
                });

                // Apply pagination
                const { current, pageSize } = pagination;
                const paginatedData = filteredData.slice(
                    (current - 1) * pageSize,
                    current * pageSize
                );

                setTransactions(paginatedData);
                setLoading(false);
            } catch (error) {
                console.error('Lỗi khi tải dữ liệu giao dịch:', error);
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [dateRange, searchText, transactionType, transactionStatus, pagination.current, pagination.pageSize]);

    // Xử lý khi thay đổi trang hoặc số lượng hiển thị trên trang
    const handleTableChange = (pagination, filters, sorter) => {
        setPagination(pagination);
        setSortedInfo(sorter);
    };

    // Xử lý khi xem chi tiết giao dịch
    const showTransactionDetails = (transaction) => {
        setSelectedTransaction(transaction);
        setDetailsModalVisible(true);
    };

    // Xử lý khi đặt lại các bộ lọc
    const handleResetFilters = () => {
        setDateRange([null, null]);
        setSearchText('');
        setTransactionType('all');
        setTransactionStatus('all');
        setPagination({
            ...pagination,
            current: 1
        });
    };

    // Xử lý khi xuất dữ liệu
    const handleExportData = () => {
        Modal.confirm({
            title: 'Xuất dữ liệu',
            icon: <ExclamationCircleOutlined />,
            content: 'Bạn muốn xuất dữ liệu lịch sử giao dịch theo định dạng nào?',
            okText: 'Xuất Excel',
            cancelText: 'Xuất PDF',
            onOk() {
                console.log('Xuất Excel');
            },
            onCancel() {
                console.log('Xuất PDF');
            },
        });
    };

    // Format số tiền với đơn vị tiền tệ
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Format ngày tháng
    const formatDate = (date) => {
        return dayjs(date).format('DD/MM/YYYY HH:mm:ss');
    };

    // Lấy màu tag cho trạng thái
    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'success';
            case 'pending':
                return 'warning';
            case 'failed':
                return 'error';
            default:
                return 'default';
        }
    };

    // Lấy tên hiển thị của trạng thái
    const getStatusText = (status) => {
        switch (status) {
            case 'completed':
                return 'Hoàn thành';
            case 'pending':
                return 'Đang xử lý';
            case 'failed':
                return 'Thất bại';
            default:
                return status;
        }
    };

    // Lấy màu tag cho loại giao dịch
    const getTypeColor = (type) => {
        switch (type) {
            case 'deposit':
                return 'green';
            case 'withdrawal':
                return 'volcano';
            case 'transfer':
                return 'blue';
            case 'payment':
                return 'purple';
            case 'refund':
                return 'cyan';
            default:
                return 'default';
        }
    };

    // Lấy tên hiển thị của loại giao dịch
    const getTypeText = (type) => {
        switch (type) {
            case 'deposit':
                return 'Nạp tiền';
            case 'withdrawal':
                return 'Rút tiền';
            case 'transfer':
                return 'Chuyển tiền';
            case 'payment':
                return 'Thanh toán';
            case 'refund':
                return 'Hoàn tiền';
            default:
                return type;
        }
    };

    // Lấy biểu tượng cho loại giao dịch
    const getTypeIcon = (type) => {
        switch (type) {
            case 'deposit':
                return <ArrowDownOutlined style={{ color: '#52c41a' }} />;
            case 'withdrawal':
                return <ArrowUpOutlined style={{ color: '#f5222d' }} />;
            case 'transfer':
                return <BankOutlined style={{ color: '#1890ff' }} />;
            case 'payment':
                return <CreditCardOutlined style={{ color: '#722ed1' }} />;
            case 'refund':
                return <DollarOutlined style={{ color: '#13c2c2' }} />;
            default:
                return <WalletOutlined />;
        }
    };

    // Định nghĩa cột cho bảng
    const columns = [
        {
            title: 'Mã giao dịch',
            dataIndex: 'id',
            key: 'id',
            width: 120,
            render: (id) => <Text copyable strong>{id}</Text>,
        },
        {
            title: 'Ngày giao dịch',
            dataIndex: 'date',
            key: 'date',
            sorter: (a, b) => a.date - b.date,
            sortOrder: sortedInfo.columnKey === 'date' && sortedInfo.order,
            render: (date) => formatDate(date),
            width: 160,
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            render: (description, record) => (
                <div>
                    <div>{description}</div>
                    {record.recipient && (
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            {record.recipient}
                        </Text>
                    )}
                </div>
            ),
            ellipsis: true,
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            render: (type) => (
                <Tag color={getTypeColor(type)} icon={getTypeIcon(type)}>
                    {getTypeText(type)}
                </Tag>
            ),
            width: 120,
            filters: [
                { text: 'Nạp tiền', value: 'deposit' },
                { text: 'Rút tiền', value: 'withdrawal' },
                { text: 'Chuyển tiền', value: 'transfer' },
                { text: 'Thanh toán', value: 'payment' },
                { text: 'Hoàn tiền', value: 'refund' },
            ],
            onFilter: (value, record) => record.type === value,
        },
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            key: 'amount',
            sorter: (a, b) => a.amount - b.amount,
            sortOrder: sortedInfo.columnKey === 'amount' && sortedInfo.order,
            render: (amount) => (
                <Text style={{ color: amount > 0 ? '#52c41a' : '#f5222d', fontWeight: 'bold' }}>
                    {formatCurrency(amount)}
                </Text>
            ),
            align: 'right',
            width: 140,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={getStatusColor(status)}>
                    {getStatusText(status)}
                </Tag>
            ),
            width: 120,
            filters: [
                { text: 'Hoàn thành', value: 'completed' },
                { text: 'Đang xử lý', value: 'pending' },
                { text: 'Thất bại', value: 'failed' },
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Button
                    type="primary"
                    size="small"
                    onClick={() => showTransactionDetails(record)}
                >
                    Chi tiết
                </Button>
            ),
            width: 80,
        },
    ];

    // Render thẻ giao dịch (cho chế độ xem dạng thẻ)
    const renderTransactionCard = (transaction) => {
        return (
            <Card
                key={transaction.id}
                hoverable
                style={{ marginBottom: 16 }}
                onClick={() => showTransactionDetails(transaction)}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ marginBottom: 8 }}>
                            <Tag color={getTypeColor(transaction.type)} icon={getTypeIcon(transaction.type)}>
                                {getTypeText(transaction.type)}
                            </Tag>
                            <Tag color={getStatusColor(transaction.status)}>
                                {getStatusText(transaction.status)}
                            </Tag>
                        </div>
                        <div style={{ marginBottom: 8 }}>
                            <Text strong>{transaction.description}</Text>
                        </div>
                        {transaction.recipient && (
                            <div style={{ marginBottom: 8 }}>
                                <Text type="secondary">{transaction.recipient}</Text>
                            </div>
                        )}
                        <div>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                {formatDate(transaction.date)} • {transaction.id}
                            </Text>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div>
                            <Text style={{ color: transaction.amount > 0 ? '#52c41a' : '#f5222d', fontSize: '18px', fontWeight: 'bold' }}>
                                {formatCurrency(transaction.amount)}
                            </Text>
                        </div>
                        {transaction.paymentMethod && (
                            <div>
                                <Text type="secondary" style={{ fontSize: '12px' }}>
                                    {transaction.paymentMethod}
                                </Text>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        );
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
            <Title level={2} style={{ marginBottom: 24 }}>
                <WalletOutlined style={{ marginRight: 8 }} />
                Lịch sử giao dịch
            </Title>

            {/* Thống kê tổng quan */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng thu"
                            value={statisticsData.totalIncome}
                            precision={0}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<ArrowDownOutlined />}
                            suffix="₫"
                            formatter={(value) => `${new Intl.NumberFormat('vi-VN').format(value)}`}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <Card>
                        <Statistic
                            title="Tổng chi"
                            value={statisticsData.totalExpense}
                            precision={0}
                            valueStyle={{ color: '#cf1322' }}
                            prefix={<ArrowUpOutlined />}
                            suffix="₫"
                            formatter={(value) => `${new Intl.NumberFormat('vi-VN').format(value)}`}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <Card>
                        <Statistic
                            title="Số dư"
                            value={statisticsData.balance}
                            precision={0}
                            valueStyle={{ color: statisticsData.balance >= 0 ? '#3f8600' : '#cf1322' }}
                            suffix="₫"
                            formatter={(value) => `${new Intl.NumberFormat('vi-VN').format(value)}`}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                    <Card>
                        <Statistic
                            title="Đang xử lý"
                            value={statisticsData.pendingAmount}
                            precision={0}
                            valueStyle={{ color: '#faad14' }}
                            suffix="₫"
                            formatter={(value) => `${new Intl.NumberFormat('vi-VN').format(value)}`}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Bộ lọc */}
            <Card style={{ marginBottom: 24 }}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Row gutter={16} align="middle">
                        <Col xs={24} md={8}>
                            <Input
                                placeholder="Tìm kiếm mã giao dịch, mô tả..."
                                value={searchText}
                                onChange={e => setSearchText(e.target.value)}
                                prefix={<SearchOutlined />}
                                allowClear
                            />
                        </Col>
                        <Col xs={24} md={8}>
                            <RangePicker
                                style={{ width: '100%' }}
                                value={dateRange}
                                onChange={setDateRange}
                                format="DD/MM/YYYY"
                                placeholder={['Từ ngày', 'Đến ngày']}
                            />
                        </Col>
                        <Col xs={12} md={4}>
                            <Select
                                style={{ width: '100%' }}
                                value={transactionType}
                                onChange={setTransactionType}
                                placeholder="Loại giao dịch"
                            >
                                <Option value="all">Tất cả loại</Option>
                                <Option value="deposit">Nạp tiền</Option>
                                <Option value="withdrawal">Rút tiền</Option>
                                <Option value="transfer">Chuyển tiền</Option>
                                <Option value="payment">Thanh toán</Option>
                                <Option value="refund">Hoàn tiền</Option>
                            </Select>
                        </Col>
                        <Col xs={12} md={4}>
                            <Select
                                style={{ width: '100%' }}
                                value={transactionStatus}
                                onChange={setTransactionStatus}
                                placeholder="Trạng thái"
                            >
                                <Option value="all">Tất cả trạng thái</Option>
                                <Option value="completed">Hoàn thành</Option>
                                <Option value="pending">Đang xử lý</Option>
                                <Option value="failed">Thất bại</Option>
                            </Select>
                        </Col>
                    </Row>

                    <Row justify="space-between" align="middle">
                        <Col>
                            <Space>
                                <Button
                                    icon={<ReloadOutlined />}
                                    onClick={handleResetFilters}
                                >
                                    Đặt lại
                                </Button>
                                <Button
                                    type="primary"
                                    icon={<FilterOutlined />}
                                >
                                    Lọc
                                </Button>
                            </Space>
                        </Col>
                        <Col>
                            <Space>
                                <Radio.Group
                                    value={viewMode}
                                    onChange={e => setViewMode(e.target.value)}
                                    optionType="button"
                                    buttonStyle="solid"
                                >
                                    <Radio.Button value="table">Bảng</Radio.Button>
                                    <Radio.Button value="card">Thẻ</Radio.Button>
                                </Radio.Group>
                                <Button
                                    icon={<DownloadOutlined />}
                                    onClick={handleExportData}
                                >
                                    Xuất dữ liệu
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </Space>
            </Card>

            {/* Dữ liệu giao dịch */}
            <Card bodyStyle={{ padding: viewMode === 'table' ? 0 : 24 }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px 0' }}>
                        <Spin size="large" tip="Đang tải dữ liệu giao dịch..." />
                    </div>
                ) : transactions.length === 0 ? (
                    <Empty
                        description="Không tìm thấy giao dịch nào phù hợp với bộ lọc"
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                ) : viewMode === 'table' ? (
                    <Table
                        columns={columns}
                        dataSource={transactions}
                        pagination={{
                            ...pagination,
                            showSizeChanger: true,
                            showTotal: (total) => `Tổng cộng ${total} giao dịch`,
                            pageSizeOptions: ['10', '20', '50', '100'],
                        }}
                        onChange={handleTableChange}
                        scroll={{ x: 'max-content' }}
                        onRow={(record) => ({
                            onClick: () => showTransactionDetails(record),
                            style: { cursor: 'pointer' }
                        })}
                    />
                ) : (
                    <div>
                        {transactions.map(transaction => renderTransactionCard(transaction))}
                        <div style={{ textAlign: 'right', marginTop: 16 }}>
                            <Pagination
                                {...pagination}
                                showSizeChanger
                                showTotal={(total) => `Tổng cộng ${total} giao dịch`}
                                onChange={(page, pageSize) => setPagination({ ...pagination, current: page, pageSize })}
                                pageSizeOptions={['10', '20', '50', '100']}
                            />
                        </div>
                    </div>
                )}
            </Card>

            {/* Modal chi tiết giao dịch */}
            <Modal
                title={
                    <Space>
                        <span>Chi tiết giao dịch</span>
                        {selectedTransaction && (
                            <Badge
                                status={
                                    selectedTransaction.status === 'completed' ? 'success' :
                                        selectedTransaction.status === 'pending' ? 'processing' : 'error'
                                }
                                text={getStatusText(selectedTransaction?.status)}
                            />
                        )}
                    </Space>
                }
                open={detailsModalVisible}
                onCancel={() => setDetailsModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setDetailsModalVisible(false)}>
                        Đóng
                    </Button>
                ]}
                width={700}
            >
                {selectedTransaction && (
                    <div>
                        <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }}>
                            <Descriptions.Item label="Mã giao dịch" span={2}>
                                <Text copyable>{selectedTransaction.id}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Thời gian">
                                {formatDate(selectedTransaction.date)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Loại giao dịch">
                                <Tag color={getTypeColor(selectedTransaction.type)} icon={getTypeIcon(selectedTransaction.type)}>
                                    {getTypeText(selectedTransaction.type)}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Số tiền" span={2}>
                                <Text style={{
                                    color: selectedTransaction.amount > 0 ? '#52c41a' : '#f5222d',
                                    fontWeight: 'bold',
                                    fontSize: '16px'
                                }}>
                                    {formatCurrency(selectedTransaction.amount)}
                                </Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Mô tả" span={2}>
                                {selectedTransaction.description}
                            </Descriptions.Item>
                            {selectedTransaction.recipient && (
                                <Descriptions.Item label="Người nhận/Đối tác" span={2}>
                                    {selectedTransaction.recipient}
                                </Descriptions.Item>
                            )}
                            {selectedTransaction.paymentMethod && (
                                <Descriptions.Item label="Phương thức thanh toán">
                                    {selectedTransaction.paymentMethod}
                                </Descriptions.Item>
                            )}
                            {selectedTransaction.category && (
                                <Descriptions.Item label="Danh mục">
                                    {selectedTransaction.category}
                                </Descriptions.Item>
                            )}
                            {selectedTransaction.fees > 0 && (
                                <Descriptions.Item label="Phí giao dịch">
                                    {formatCurrency(selectedTransaction.fees)}
                                </Descriptions.Item>
                            )}
                            <Descriptions.Item label="Số tham chiếu">
                                <Text copyable>{selectedTransaction.reference}</Text>
                            </Descriptions.Item>
                            {selectedTransaction.note && (
                                <Descriptions.Item label="Ghi chú" span={2}>
                                    {selectedTransaction.note}
                                </Descriptions.Item>
                            )}{selectedTransaction.note && (
                                <Descriptions.Item label="Ghi chú" span={2}>
                                    {selectedTransaction.note}
                                </Descriptions.Item>
                            )}
                        </Descriptions>

                        <Divider />

                        <Row gutter={16}>
                            <Col span={24}>
                                <Title level={5}>Hành động</Title>
                                <Space>
                                    <Button icon={<DownloadOutlined />}>
                                        Tải biên lai
                                    </Button>
                                    {selectedTransaction.status === 'failed' && (
                                        <Button type="primary" icon={<ReloadOutlined />}>
                                            Thử lại giao dịch
                                        </Button>
                                    )}
                                    {selectedTransaction.status === 'completed' && selectedTransaction.type !== 'refund' && (
                                        <Tooltip title="Yêu cầu hoàn tiền cho giao dịch này">
                                            <Button type="danger" icon={<DollarOutlined />}>
                                                Yêu cầu hoàn tiền
                                            </Button>
                                        </Tooltip>
                                    )}
                                </Space>
                            </Col>
                        </Row>

                        {selectedTransaction.type === 'payment' && (
                            <>
                                <Divider />
                                <Row>
                                    <Col span={24}>
                                        <Title level={5}>Thông tin thanh toán bổ sung</Title>
                                        <Descriptions bordered column={1}>
                                            <Descriptions.Item label="Mã hóa đơn">
                                                <Text copyable>INV-{Math.floor(Math.random() * 100000)}</Text>
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Trạng thái hóa đơn">
                                                <Tag color="green">Đã thanh toán</Tag>
                                            </Descriptions.Item>
                                            <Descriptions.Item label="Người xác nhận">
                                                Hệ thống tự động
                                            </Descriptions.Item>
                                        </Descriptions>
                                    </Col>
                                </Row>
                            </>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default TransactionHistory;