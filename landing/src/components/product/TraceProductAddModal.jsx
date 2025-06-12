import { useState } from 'react';
import { Modal, Form, Input, Button, DatePicker, Space, Divider, Card, message, Upload, Image, Tooltip, Progress } from 'antd';
import { PlusOutlined, MinusCircleOutlined, ExclamationCircleOutlined, UploadOutlined, LoadingOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import traceProductService from '../../services/traceProduct.service';
import { showToast } from '../../utils/toast';
import uploadService from '../../services/upload.service';

const { TextArea } = Input;

export default function TraceProductAddModal({ open, onClose, productId, productData }) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [modal, contextHolder] = Modal.useModal();
    const [uploadingSteps, setUploadingSteps] = useState({}); // Track upload status cho từng step
    const [previewImage, setPreviewImage] = useState('');
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewTitle, setPreviewTitle] = useState('');

    // Custom upload handler for multiple images
    const handleImageUpload = async (file, stepIndex) => {
        const uploadKey = `${stepIndex}_${Date.now()}`;
        setUploadingSteps(prev => ({ ...prev, [uploadKey]: { loading: true, progress: 0 } }));

        try {
            // Simulate upload progress (replace with actual progress if your upload service supports it)
            const progressInterval = setInterval(() => {
                setUploadingSteps(prev => ({
                    ...prev,
                    [uploadKey]: {
                        ...prev[uploadKey],
                        progress: Math.min((prev[uploadKey]?.progress || 0) + 10, 90)
                    }
                }));
            }, 200);

            const imageUrl = await uploadService.uploadToCloudinary(file);

            clearInterval(progressInterval);

            // Get current images for this step
            const currentSteps = form.getFieldValue('supplyChainSteps') || [];
            const currentImages = currentSteps[stepIndex]?.images || [];

            // Add new image to the array
            const updatedImages = [...currentImages, {
                uid: uploadKey,
                name: file.name,
                status: 'done',
                url: imageUrl,
                thumbUrl: imageUrl
            }];

            // Update form field
            currentSteps[stepIndex] = {
                ...currentSteps[stepIndex],
                images: updatedImages
            };

            form.setFieldValue('supplyChainSteps', currentSteps);
            showToast.success('Upload hình ảnh thành công!');

        } catch (error) {
            console.error('Upload error:', error);
            showToast.error(`Upload thất bại: ${error.message}`);
        } finally {
            setUploadingSteps(prev => {
                const newState = { ...prev };
                delete newState[uploadKey];
                return newState;
            });
        }

        return false;
    };

    // Handle image removal
    const handleImageRemove = (stepIndex, imageUid) => {
        const currentSteps = form.getFieldValue('supplyChainSteps') || [];
        const currentImages = currentSteps[stepIndex]?.images || [];

        const updatedImages = currentImages.filter(img => img.uid !== imageUid);

        currentSteps[stepIndex] = {
            ...currentSteps[stepIndex],
            images: updatedImages
        };

        form.setFieldValue('supplyChainSteps', currentSteps);
        showToast.success('Đã xóa hình ảnh');
    };

    // Handle preview
    const handlePreview = async (file) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }
        setPreviewImage(file.url || file.preview);
        setPreviewVisible(true);
        setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
    };

    // Convert file to base64 for preview
    const getBase64 = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });

    const ImageUploadField = ({ stepIndex, value = [], onChange }) => {
        const uploadProps = {
            name: 'image',
            multiple: true,
            listType: 'picture-card',
            className: 'step-image-uploader',
            fileList: value,
            showUploadList: {
                showPreviewIcon: true,
                showRemoveIcon: true,
                showDownloadIcon: false,
            },
            beforeUpload: (file) => handleImageUpload(file, stepIndex),
            onPreview: handlePreview,
            onRemove: (file) => {
                handleImageRemove(stepIndex, file.uid);
                return false;
            },
            accept: 'image/*',
            maxCount: 10, // Limit maximum images per step
        };

        // Check if any upload is in progress for this step
        const isUploading = Object.keys(uploadingSteps).some(key =>
            key.startsWith(`${stepIndex}_`)
        );

        const uploadButton = (
            <div style={{ border: 0, background: 'none' }}>
                {isUploading ? <LoadingOutlined /> : <PlusOutlined />}
                <div style={{ marginTop: 8, fontSize: '12px' }}>
                    {isUploading ? 'Đang upload...' : 'Thêm ảnh'}
                </div>
            </div>
        );

        return (
            <div className="image-upload-container">
                <Upload {...uploadProps}>
                    {value.length >= 10 ? null : uploadButton}
                </Upload>

                {/* Show upload progress */}
                {Object.entries(uploadingSteps).map(([key, status]) => {
                    if (!key.startsWith(`${stepIndex}_`)) return null;
                    return (
                        <div key={key} style={{ marginTop: 8 }}>
                            <Progress percent={status.progress} size="small" />
                        </div>
                    );
                })}

                {/* Image count info */}
                {value.length > 0 && (
                    <div style={{
                        marginTop: 8,
                        fontSize: '12px',
                        color: '#666',
                        textAlign: 'center'
                    }}>
                        {value.length} / 10 hình ảnh
                    </div>
                )}
            </div>
        );
    };

    const handleFinish = (values) => {
        modal.confirm({
            title: 'Bạn có chắc muốn xác thực?',
            icon: <ExclamationCircleOutlined />,
            content: 'Dữ liệu sau khi xác thực sẽ được ghi lên blockchain và không thể thay đổi.',
            okText: 'Xác nhận ghi vào blockchain',
            cancelText: 'Huỷ',
            onOk: async () => {
                setLoading(true);
                try {
                    // Format data
                    const formatted = {
                        ...values,
                        productId: productData._id,
                        timestamp: values.timestamp?.toISOString(),
                        supplyChainSteps: values.supplyChainSteps.map(step => ({
                            ...step,
                            timestamp: step.timestamp?.toISOString(),
                            images: step.images?.map(img => img.url) || [] // Convert to array of URLs
                        }))
                    };

                    // Upload toàn bộ formatted object lên IPFS
                    const response = await traceProductService.addProductTrace(formatted);

                    if (response.isSuccess) {
                        showToast.success("Xác thực nguồn gốc sản phẩm thành công");
                        form.resetFields();
                        onClose();
                    }
                } catch (err) {
                    showToast.error(err.message || "Xác thực nguồn gốc sản phẩm thất bại");
                    console.error('Submit error:', err);
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    return (
        <>
            {contextHolder}
            <Modal
                title="Xác thực nguồn gốc xuất xứ"
                open={open}
                onCancel={loading ? undefined : onClose}
                onOk={() => form.submit()}
                okText="Xác nhận"
                confirmLoading={loading}
                width={900}
                destroyOnClose
                okButtonProps={{ disabled: loading }}
                cancelButtonProps={{ disabled: loading }}
                style={{ top: 20 }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFinish}
                    initialValues={{
                        supplyChainSteps: [],
                        timestamp: dayjs()
                    }}
                >
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Form.Item name="productName" label="Tên sản phẩm">
                            <Input
                                placeholder="VD: iPhone 14 Pro Max"
                                disabled
                                defaultValue={productData?.name}
                                style={{ backgroundColor: '#f5f5f5' }}
                            />
                        </Form.Item>

                        <Form.Item name="timestamp" label="Thời gian xác thực">
                            <DatePicker
                                style={{ width: '100%' }}
                                format="DD/MM/YYYY"
                                placeholder="Chọn ngày"
                            />
                        </Form.Item>
                    </Space>

                    <Divider>Chuỗi cung ứng</Divider>

                    <Form.List name="supplyChainSteps">
                        {(fields, { add, remove }) => (
                            <div>
                                {fields.map(({ key, name, ...rest }, index) => (
                                    <Card
                                        key={key}
                                        size="small"
                                        style={{ marginBottom: 16 }}
                                        title={
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span>Bước {index + 1}</span>
                                                <Button
                                                    danger
                                                    size="small"
                                                    onClick={() => remove(name)}
                                                    icon={<DeleteOutlined />}
                                                    disabled={loading}
                                                >
                                                    Xoá bước
                                                </Button>
                                            </div>
                                        }
                                    >
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                            <Form.Item
                                                {...rest}
                                                name={[name, 'step']}
                                                label="Tên giai đoạn"
                                                rules={[{ required: true, message: 'Vui lòng nhập tên giai đoạn' }]}
                                            >
                                                <Input placeholder="VD: Shipped to warehouse" />
                                            </Form.Item>

                                            <Form.Item
                                                {...rest}
                                                name={[name, 'location']}
                                                label="Địa điểm"
                                                rules={[{ required: true, message: 'Vui lòng nhập địa điểm' }]}
                                            >
                                                <Input placeholder="VD: Singapore" />
                                            </Form.Item>

                                            <Form.Item
                                                {...rest}
                                                name={[name, 'timestamp']}
                                                label="Thời gian"
                                                rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}
                                            >
                                                <DatePicker
                                                    style={{ width: '100%' }}
                                                    format="DD/MM/YYYY"
                                                    placeholder="Chọn ngày"
                                                />
                                            </Form.Item>

                                            <Form.Item
                                                {...rest}
                                                name={[name, 'verifiedBy']}
                                                label="Đơn vị xác minh"
                                                rules={[{ required: true, message: 'Vui lòng nhập đơn vị xác minh' }]}
                                            >
                                                <Input placeholder="VD: DHL Express" />
                                            </Form.Item>
                                        </div>

                                        <Form.Item
                                            {...rest}
                                            name={[name, 'description']}
                                            label="Mô tả"
                                            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
                                        >
                                            <TextArea
                                                rows={2}
                                                placeholder="VD: Giao đến kho phân phối..."
                                                showCount
                                                maxLength={500}
                                            />
                                        </Form.Item>

                                        <Form.Item
                                            {...rest}
                                            name={[name, 'images']}
                                            label={
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span>Hình ảnh bằng chứng</span>
                                                    <Tooltip title="Tối đa 10 hình ảnh, định dạng JPG, PNG. Kích thước tối đa 5MB/ảnh">
                                                        <Button type="link" size="small" icon={<ExclamationCircleOutlined />} />
                                                    </Tooltip>
                                                </div>
                                            }
                                            rules={[{
                                                required: true,
                                                message: 'Vui lòng upload ít nhất 1 hình ảnh',
                                                validator: (_, value) => {
                                                    if (!value || value.length === 0) {
                                                        return Promise.reject('Vui lòng upload ít nhất 1 hình ảnh');
                                                    }
                                                    return Promise.resolve();
                                                }
                                            }]}
                                        >
                                            <ImageUploadField stepIndex={name} />
                                        </Form.Item>
                                    </Card>
                                ))}

                                <Button
                                    type="dashed"
                                    onClick={() => add()}
                                    block
                                    icon={<PlusOutlined />}
                                    disabled={loading}
                                    size="large"
                                    style={{
                                        height: '48px',
                                        borderStyle: 'dashed',
                                        borderWidth: '2px'
                                    }}
                                >
                                    Thêm bước mới
                                </Button>
                            </div>
                        )}
                    </Form.List>
                </Form>
            </Modal>

            {/* Preview Modal */}
            <Modal
                open={previewVisible}
                title={previewTitle}
                footer={null}
                onCancel={() => setPreviewVisible(false)}
                width={800}
                centered
            >
                <img
                    alt="preview"
                    style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain' }}
                    src={previewImage}
                />
            </Modal>

            <style jsx>{`
                .step-image-uploader .ant-upload-select-picture-card i {
                    font-size: 32px;
                    color: #999;
                }

                .step-image-uploader .ant-upload-select-picture-card .ant-upload-text {
                    margin-top: 8px;
                    color: #666;
                }

                .step-image-uploader .ant-upload-list-picture-card-container {
                    width: 104px;
                    height: 104px;
                }

                .step-image-uploader .ant-upload-list-picture-card .ant-upload-list-item {
                    width: 104px;
                    height: 104px;
                }

                .image-upload-container {
                    border: 1px dashed #d9d9d9;
                    border-radius: 6px;
                    padding: 16px;
                    background-color: #fafafa;
                    transition: all 0.3s;
                }

                .image-upload-container:hover {
                    border-color: #1890ff;
                    background-color: #f0f8ff;
                }
            `}</style>
        </>
    );
}