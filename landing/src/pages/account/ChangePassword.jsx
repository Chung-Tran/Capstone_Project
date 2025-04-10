import React, { useState } from 'react';
import {
    Form,
    Input,
    Button,
    Card,
    Typography,
    Space,
    Alert,
    Divider,
    notification
} from 'antd';
import {
    LockOutlined,
    SafetyOutlined,
    EyeInvisibleOutlined,
    EyeTwoTone,
    CheckCircleOutlined,
    CloseCircleOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const ChangePassword = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        message: 'Chưa nhập mật khẩu',
        status: 'normal'
    });

    // Hàm kiểm tra độ mạnh của mật khẩu
    const checkPasswordStrength = (password) => {
        if (!password) {
            return { score: 0, message: 'Chưa nhập mật khẩu', status: 'normal' };
        }

        let score = 0;
        let message = '';
        let status = 'error';

        // Tính điểm cho độ mạnh mật khẩu
        if (password.length >= 8) score += 1;
        if (password.length >= 12) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[a-z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;

        // Xác định thông báo và trạng thái dựa trên điểm
        if (score < 3) {
            message = 'Yếu';
            status = 'error';
        } else if (score < 4) {
            message = 'Trung bình';
            status = 'warning';
        } else if (score < 6) {
            message = 'Khá mạnh';
            status = 'success';
        } else {
            message = 'Rất mạnh';
            status = 'success';
        }

        return { score, message, status };
    };

    const handlePasswordChange = (e) => {
        const password = e.target.value;
        setPasswordStrength(checkPasswordStrength(password));
    };

    const onFinish = async (values) => {
        setLoading(true);

        try {
            // Giả lập API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Thành công
            notification.success({
                message: 'Đổi mật khẩu thành công!',
                description: 'Mật khẩu của bạn đã được cập nhật. Vui lòng sử dụng mật khẩu mới khi đăng nhập lần sau.',
                icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
            });

            form.resetFields();
            setPasswordStrength({ score: 0, message: 'Chưa nhập mật khẩu', status: 'normal' });
        } catch (error) {
            // Xử lý lỗi
            notification.error({
                message: 'Đổi mật khẩu thất bại',
                description: 'Có lỗi xảy ra khi đổi mật khẩu. Vui lòng thử lại sau.',
                icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
            });
        } finally {
            setLoading(false);
        }
    };

    // Render chỉ số độ mạnh mật khẩu
    const renderPasswordStrengthIndicator = () => {
        const { score, message, status } = passwordStrength;

        return (
            <div style={{ marginBottom: '24px' }}>
                <Text style={{ marginBottom: '8px', display: 'block' }}>Độ mạnh mật khẩu: <Text strong type={status === 'error' ? 'danger' : status === 'warning' ? 'warning' : 'success'}>{message}</Text></Text>
                <div style={{ display: 'flex', marginTop: '4px' }}>
                    {[1, 2, 3, 4, 5].map((level) => (
                        <div
                            key={level}
                            style={{
                                height: '6px',
                                width: '20%',
                                backgroundColor: level <= score ? getColorForScore(score) : '#f0f0f0',
                                marginRight: '4px',
                                borderRadius: '2px',
                                transition: 'background-color 0.3s'
                            }}
                        />
                    ))}
                </div>
            </div>
        );
    };

    // Hàm lấy màu dựa trên điểm
    const getColorForScore = (score) => {
        if (score < 3) return '#ff4d4f';
        if (score < 4) return '#faad14';
        return '#52c41a';
    };

    return (
        <div style={{ maxWidth: '500px', margin: '0 auto', padding: '24px' }}>
            <Card
                bordered={false}
                style={{
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                    borderRadius: '8px'
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <SafetyOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
                    <Title level={2} style={{ margin: 0 }}>Đổi mật khẩu</Title>
                    <Paragraph type="secondary">
                        Vui lòng nhập mật khẩu hiện tại và mật khẩu mới của bạn
                    </Paragraph>
                </div>

                <Alert
                    message="Mật khẩu mạnh giúp bảo vệ tài khoản của bạn"
                    description={
                        <ul style={{ paddingLeft: '20px', marginBottom: 0 }}>
                            <li>Ít nhất 8 ký tự (nên dùng 12 ký tự trở lên)</li>
                            <li>Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</li>
                            <li>Không sử dụng thông tin cá nhân hoặc mật khẩu phổ biến</li>
                        </ul>
                    }
                    type="info"
                    showIcon
                    style={{ marginBottom: '24px' }}
                />

                <Form
                    form={form}
                    name="change_password"
                    layout="vertical"
                    onFinish={onFinish}
                    autoComplete="off"
                >
                    <Form.Item
                        name="currentPassword"
                        label="Mật khẩu hiện tại"
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng nhập mật khẩu hiện tại!',
                            },
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Nhập mật khẩu hiện tại"
                            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                        />
                    </Form.Item>

                    <Divider />

                    <Form.Item
                        name="newPassword"
                        label="Mật khẩu mới"
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng nhập mật khẩu mới!',
                            },
                            {
                                min: 8,
                                message: 'Mật khẩu phải có ít nhất 8 ký tự!',
                            },
                            {
                                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                                message: 'Mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt!',
                            },
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Nhập mật khẩu mới"
                            onChange={handlePasswordChange}
                            visibilityToggle={{ visible: passwordVisible, onVisibleChange: setPasswordVisible }}
                            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                        />
                    </Form.Item>

                    {renderPasswordStrengthIndicator()}

                    <Form.Item
                        name="confirmPassword"
                        label="Xác nhận mật khẩu mới"
                        dependencies={['newPassword']}
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng xác nhận mật khẩu mới!',
                            },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Hai mật khẩu không khớp!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Nhập lại mật khẩu mới"
                            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                        />
                    </Form.Item>

                    <Form.Item style={{ marginTop: '32px' }}>
                        <Space style={{ width: '100%', justifyContent: 'center' }}>
                            <Button type="default" style={{ width: '120px' }}>
                                Hủy
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                style={{ width: '120px' }}
                            >
                                Xác nhận
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default ChangePassword;