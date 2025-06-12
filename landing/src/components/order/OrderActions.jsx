import { Button, Space, Modal, Input } from 'antd';
import { useState } from 'react';

const OrderActions = ({ status, onAction }) => {
    const [isRejectModalVisible, setRejectModalVisible] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    const handleReject = () => {
        onAction('rejected', rejectReason);
        setRejectModalVisible(false);
        setRejectReason('');
    };

    const renderButtons = () => {
        switch (status) {
            case 'pending':
                return (
                    <Space>
                        <Button type="primary" onClick={() => onAction('processing')}>
                            Xác nhận đơn hàng
                        </Button>
                        <Button danger onClick={() => setRejectModalVisible(true)}>
                            Từ chối đơn hàng
                        </Button>
                    </Space>
                );

            case 'processing':
                return (
                    <Button type="primary" onClick={() => onAction('shipped')}>
                        Chuẩn bị đơn hàng
                    </Button>
                );

            case 'shipped':
                return (
                    <Button type="primary" onClick={() => onAction('delivered')}>
                        Xác nhận đã giao hàng
                    </Button>
                );

            case 'delivered':
                return (
                    <Button type="primary" onClick={() => onAction('done')}>
                        Hoàn tất đơn hàng
                    </Button>
                );

            case 'cancelled':
            case 'rejected':
            case 'done':
            default:
                return null;
        }
    };

    return (
        <>
            {renderButtons()}

            <Modal
                title="Lý do từ chối đơn hàng"
                open={isRejectModalVisible}
                onOk={handleReject}
                onCancel={() => setRejectModalVisible(false)}
                okText="Xác nhận từ chối"
                cancelText="Hủy"
            >
                <Input.TextArea
                    rows={4}
                    placeholder="Nhập lý do từ chối đơn hàng..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                />
            </Modal>
        </>
    );
};
export default OrderActions