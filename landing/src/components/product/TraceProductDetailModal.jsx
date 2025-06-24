import { Modal, Typography, Divider, Card, Spin, Row, Col, Tag, Image } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import traceProductService from '../../services/traceProduct.service';
import { CheckCircleOutlined, EnvironmentOutlined, ClockCircleOutlined, EyeOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function TraceProductDetailModal({ open, onClose, productData }) {
    const [traceData, setTraceData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open || !productData?._id) return;

        const fetchTraceData = async () => {
            setLoading(true);
            try {
                const response = await traceProductService.getProductTrace(productData._id);
                if (response.isSuccess) {
                    setTraceData(response.data.traceData);
                }
            } catch (err) {
                console.error('Lỗi khi fetch traceData:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchTraceData();
    }, [open, productData]);

    return (
        <Modal
            open={open}
            onCancel={onClose}
            title="🔍 Chi tiết xác thực nguồn gốc sản phẩm"
            footer={null}
            width={800}
            destroyOnClose
        >
            {loading || !traceData ? (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                    <Spin size="large" />
                </div>
            ) : (
                <>
                    <Card bordered style={{ marginBottom: 24 }}>
                        <Title level={4} style={{ marginBottom: 8 }}>{traceData.productName}</Title>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Text strong>🏭 Nhà sản xuất:</Text> <br />{traceData.manufacturerName}<br />
                                <Text strong>🌎 Quốc gia:</Text> <br />Việt Nam<br />
                            </Col>
                            <Col span={12}>
                                <Text strong><ClockCircleOutlined /> Thời gian xác thực:</Text><br />
                                {dayjs(traceData.timestamp).format('DD/MM/YYYY HH:mm')}<br />
                                <Text strong><CheckCircleOutlined /> Đơn vị xác minh:</Text><br />
                                {["Đơn vị nội bộ", "Đơn vị bên ngoài", "Đơn vị có ủy quyền"]?.map(unit => <Tag color="green" key={unit}>{unit}</Tag>)}
                            </Col>
                        </Row>
                    </Card>

                    <Divider />
                    <Title level={4}>🔗 Chuỗi cung ứng</Title>

                    {traceData.supplyChainSteps?.map((step, index) => (
                        <Card
                            key={index}
                            title={`🔁 Bước ${index + 1}: ${step.step}`}
                            style={{ marginBottom: 16 }}
                            size="small"
                            bordered
                        >
                            <Row gutter={16}>
                                <Col span={14}>
                                    <p><EnvironmentOutlined /> <Text strong>Vị trí:</Text> {step.location}</p>
                                    <p><ClockCircleOutlined /> <Text strong>Thời gian:</Text> {dayjs(step.timestamp).format('DD/MM/YYYY HH:mm')}</p>
                                    <p><CheckCircleOutlined /> <Text strong>Đơn vị xác minh:</Text> {step.verifiedBy}</p>
                                    <p><Text strong>Mô tả:</Text><br />{step.description}</p>
                                </Col>
                                <Col span={10}>
                                    {Array.isArray(step.images) && step.images.length > 0 ? (
                                        <Image.PreviewGroup>
                                            <Row gutter={[8, 8]}>
                                                {step.images.map((img, imgIdx) => (
                                                    <Col span={24} key={img.uid || imgIdx}>
                                                        <Image
                                                            src={img}
                                                            width="100%"
                                                            style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                                                            alt={img.name || `Step ${index + 1} - ${imgIdx + 1}`}
                                                            placeholder
                                                        />
                                                    </Col>
                                                ))}
                                            </Row>
                                        </Image.PreviewGroup>
                                    ) : step.image ? (
                                        <Image
                                            src={step.image}
                                            width="100%"
                                            style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                                            alt={`Step ${index + 1}`}
                                            placeholder
                                        />
                                    ) : (
                                        <span style={{ color: '#aaa' }}>Không có hình ảnh</span>
                                    )}
                                </Col>
                            </Row>
                        </Card>
                    ))}
                </>
            )}
        </Modal>
    );
}
