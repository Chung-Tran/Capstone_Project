import React, { useState } from 'react';
import {
    Form,
    Input,
    Button,
    Card,
    Typography,
    Space,
    Divider
} from 'antd';
import {
    LockOutlined,
    KeyOutlined,
    EyeInvisibleOutlined,
    EyeTwoTone
} from '@ant-design/icons';
import authService from '../../services/auth.service';
import { showToast } from '../../utils/toast';
import { useLoading } from '../../utils/useLoading';

const { Title, Text, Paragraph } = Typography;

const ChangePassword = () => {
    const [form] = Form.useForm();
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        message: 'Chưa nhập mật khẩu',
        status: 'normal'
    });
    const { isLoading, setLoading } = useLoading();

    // Hàm kiểm tra độ mạnh của mật khẩu (đơn giản hóa)
    const checkPasswordStrength = (password) => {
        if (!password) {
            return { score: 0, message: 'Chưa nhập mật khẩu', status: 'normal' };
        }

        let score = 0;
        let message = '';
        let status = 'error';

        // Tính điểm cho độ mạnh mật khẩu (đơn giản hóa)
        if (password.length >= 6) score += 2;
        if (password.length >= 10) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;

        // Xác định thông báo và trạng thái dựa trên điểm
        if (score < 2) {
            message = 'Yếu';
            status = 'error';
        } else if (score < 4) {
            message = 'Trung bình';
            status = 'warning';
        } else {
            message = 'Mạnh';
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
            const response = await authService.update_account_password({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword
            });

            if (response.isSuccess) {
                showToast.success('Thay đổi mật khẩu thành công');
                form.resetFields();
                setPasswordStrength({ score: 0, message: 'Chưa nhập mật khẩu', status: 'normal' });
            }
        } catch (error) {
            showToast.error(error.message || 'Có lỗi xảy ra khi đổi mật khẩu. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    // Render chỉ số độ mạnh mật khẩu
    const renderPasswordStrengthIndicator = () => {
        const { score, message, status } = passwordStrength;

        return (
            <div style={{ marginBottom: '20px' }}>
                <Text style={{ marginBottom: '8px', display: 'block' }}>
                    Độ mạnh mật khẩu: <Text strong type={status === 'error' ? 'danger' : status === 'warning' ? 'warning' : 'success'}>{message}</Text>
                </Text>
                <div style={{ display: 'flex', marginTop: '4px' }}>
                    {[1, 2, 3, 4, 5].map((level) => (
                        <div
                            key={level}
                            style={{
                                height: '6px',
                                width: '20%',
                                backgroundColor: level <= score ? getColorForScore(score) : '#f0f0f0',
                                marginRight: '4px',
                                borderRadius: '4px',
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
        if (score < 2) return '#ff4d4f';
        if (score < 4) return '#faad14';
        return '#52c41a';
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <Card
                bordered={false}
                style={{
                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.1)',
                    borderRadius: '12px'
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <KeyOutlined style={{ fontSize: '56px', color: '#1890ff', marginBottom: '20px' }} />
                    <Title level={2} style={{ margin: 0, fontWeight: 600 }}>Đổi mật khẩu</Title>
                    <Paragraph type="secondary" style={{ fontSize: '16px', marginTop: '8px' }}>
                        Cập nhật mật khẩu để bảo vệ tài khoản của bạn
                    </Paragraph>
                </div>

                <Form
                    form={form}
                    name="change_password"
                    layout="vertical"
                    onFinish={onFinish}
                    autoComplete="off"
                    size="large"
                    onFinishFailed={(errorInfo) => {
                        console.log("❌ Submit failed:", errorInfo);
                    }}
                >
                    <Form.Item
                        name="currentPassword"
                        label={<Text strong>Mật khẩu hiện tại</Text>}
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng nhập mật khẩu hiện tại!',
                            },
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                            placeholder="Nhập mật khẩu hiện tại"
                            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                            style={{ borderRadius: '8px', height: '45px' }}
                        />
                    </Form.Item>

                    <Divider style={{ margin: '16px 0 24px' }} />

                    <Form.Item
                        name="newPassword"
                        label={<Text strong>Mật khẩu mới</Text>}
                        rules={[
                            {
                                required: true,
                                message: 'Vui lòng nhập mật khẩu mới!',
                            },
                            {
                                min: 6,
                                message: 'Mật khẩu phải có ít nhất 6 ký tự!',
                            },
                        ]}
                    >
                        <Input.Password
                            prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                            placeholder="Nhập mật khẩu mới"
                            onChange={handlePasswordChange}
                            visibilityToggle={{ visible: passwordVisible, onVisibleChange: setPasswordVisible }}
                            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                            style={{ borderRadius: '8px', height: '45px' }}
                        />
                    </Form.Item>

                    {renderPasswordStrengthIndicator()}

                    <Form.Item
                        name="confirmPassword"
                        label={<Text strong>Xác nhận mật khẩu mới</Text>}
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
                            prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                            placeholder="Nhập lại mật khẩu mới"
                            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                            style={{ borderRadius: '8px', height: '45px' }}
                        />
                    </Form.Item>

                    <Form.Item style={{ marginTop: '36px' }}>
                        <Space style={{ width: '100%', justifyContent: 'center' }}>
                            <Button
                                type="default"
                                style={{
                                    width: '140px',
                                    height: '45px',
                                    borderRadius: '8px',
                                    fontSize: '16px'
                                }}
                            >
                                Hủy
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={isLoading}
                                style={{
                                    width: '140px',
                                    height: '45px',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    boxShadow: '0 2px 8px rgba(24, 144, 255, 0.35)'
                                }}
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