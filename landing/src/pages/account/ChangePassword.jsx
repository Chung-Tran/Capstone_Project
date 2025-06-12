import React from 'react';
import {
    Form,
    Input,
    Button,
    Card,
    Typography,
    Space
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

const { Title, Text } = Typography;

const ChangePassword = () => {
    const [form] = Form.useForm();
    const { isLoading, setLoading } = useLoading();

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
            }
        } catch (error) {
            showToast.error(error.message || 'Có lỗi xảy ra khi đổi mật khẩu. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
    };

    return (
        <div style={{
            maxWidth: '420px',
            margin: '0 auto',
            padding: '20px'
        }}>
            <Card
                bordered={false}
                style={{
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    background: '#fff'
                }}
            >
                <div style={{
                    textAlign: 'center',
                    marginBottom: '32px'
                }}>
                    <KeyOutlined style={{
                        fontSize: '32px',
                        color: '#1890ff',
                        marginBottom: '16px'
                    }} />
                    <Title level={3} style={{
                        margin: 0,
                        color: '#262626',
                        fontWeight: 600
                    }}>
                        Đổi mật khẩu
                    </Title>
                    <Text type="secondary" style={{ fontSize: '14px' }}>
                        Cập nhật mật khẩu để bảo vệ tài khoản của bạn
                    </Text>
                </div>

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
                            prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                            placeholder="Nhập mật khẩu hiện tại"
                            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                        />
                    </Form.Item>

                    <Form.Item
                        name="newPassword"
                        label="Mật khẩu mới"
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
                            placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                        />
                    </Form.Item>

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
                            prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                            placeholder="Nhập lại mật khẩu mới"
                            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                        />
                    </Form.Item>

                    <Form.Item style={{ marginTop: '24px', marginBottom: 0 }}>
                        <Space style={{ width: '100%' }}>
                            <Button
                                onClick={handleCancel}
                                style={{ flex: 1 }}
                            >
                                Hủy
                            </Button>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={isLoading}
                                style={{ flex: 1 }}
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