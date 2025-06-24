import React, { useState, useEffect } from 'react';
import { Modal, Timeline, Badge, Tooltip, Spin, message, Image } from 'antd';
import {
    Shield,
    CheckCircle,
    MapPin,
    Clock,
    Users,
    Package,
    Link,
    Award,
    Truck,
    Factory,
    Globe,
    Eye,
    Copy,
    ExternalLink
} from 'lucide-react';
import traceProductService from '../../services/traceProduct.service';
import dayjs from 'dayjs';
import { formatDateTime } from '../../common/methodsCommon';

const BlockchainAuthModal = ({ productId, isAuthenticated = false }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [copied, setCopied] = useState(false);
    const [traceData, setTraceData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedStepImages, setSelectedStepImages] = useState([]);

    // Fetch trace data when modal opens
    useEffect(() => {
        if (!isVisible || !productId) return;

        const fetchTraceData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await traceProductService.getProductTrace(productId);
                if (response.isSuccess) {
                    setTraceData(response.data);
                } else {
                    setError('Không thể tải thông tin xác thực sản phẩm');
                }
            } catch (err) {
                console.error('Lỗi khi fetch traceData:', err);
                setError('Có lỗi xảy ra khi tải dữ liệu');
            } finally {
                setLoading(false);
            }
        };

        fetchTraceData();
    }, [isVisible, productId]);

    const formatDate = (timestamp) => {
        return dayjs(timestamp).format('DD/MM/YYYY');
    };

    const handleCopyCID = () => {
        if (traceData?.cid) {
            navigator.clipboard.writeText(traceData.cid);
            setCopied(true);
            message.success('Đã sao chép CID!');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleViewImages = (step) => {
        let images = [];
        if (step.images && Array.isArray(step.images)) {
            images = step.images;
        } else if (step.image) {
            images = [step.image];
        }
        setSelectedStepImages(images);
        setShowImageModal(true);
    };

    const getStepIcon = (step) => {
        const stepLower = step.toLowerCase();
        if (stepLower.includes('manufactured') || stepLower.includes('sản xuất')) {
            return <Factory className="w-4 h-4" />;
        } else if (stepLower.includes('shipped') || stepLower.includes('vận chuyển') || stepLower.includes('giao')) {
            return <Truck className="w-4 h-4" />;
        } else {
            return <Package className="w-4 h-4" />;
        }
    };


    const timelineItems = traceData?.traceData?.supplyChainSteps?.map((step, index) => ({
        children: (
            <div className="ml-4 pb-6">
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            <span>{step.step}</span>
                            <Badge color="green" text={<CheckCircle className="w-3 h-3" />} />
                        </h4>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {formatDate(step.timestamp)}
                        </span>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 text-blue-500" />
                            <span>{step.location}</span>
                        </div>

                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                            {step.description}
                        </p>

                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-2">
                                <Award className="w-4 h-4 text-green-500" />
                                <span className="text-xs text-gray-600">Xác thực bởi: </span>
                                <Badge color="blue" text={step.verifiedBy} />
                            </div>

                            {(step.image || (step.images && step.images.length > 0)) && (
                                <Tooltip title="Xem ảnh minh chứng">
                                    <button className="text-blue-500 hover:text-blue-600 text-xs flex items-center gap-1" onClick={() => handleViewImages(step)}>
                                        <Eye className="w-3 h-3" />
                                        Xem ảnh ({step.images ? step.images.length : 1})
                                    </button>
                                </Tooltip>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )
    })) || [];

    // Don't show the authentication badge if product is not authenticated
    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="">
            <div className="max-w-4xl mx-auto text-base">
                <span
                    onClick={() => setIsVisible(true)}
                    className="cursor-pointer group inline-flex items-center gap-2 bg-green-100 text-green-800 border border-green-500 px-2 py-2 rounded-lg font-semibold shadow hover:bg-green-200 transition mb-2"
                >
                    <Shield className="w-5 h-5 text-green-600 group-hover:animate-pulse" />
                    Sản phẩm đã được xác thực nguồn gốc xuất xứ.
                    <span className="underline ml-1">Nhấn để xem</span>
                </span>

                <Modal
                    open={isVisible}
                    onCancel={() => setIsVisible(false)}
                    footer={null}
                    width={1200}
                    centered
                    bodyStyle={{ padding: 0 }}
                    className="blockchain-auth-modal"
                    destroyOnClose
                >
                    <div className="relative">
                        {/* Header with blockchain gradient */}
                        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white p-6 rounded-t-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                            <Shield className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold">Chứng thực Blockchain</h2>
                                            <p className="text-blue-100 text-sm">Được bảo mật bằng công nghệ Blockchain</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-2 text-green-300 mb-1">
                                        <CheckCircle className="w-5 h-5" />
                                        <span className="font-medium">Đã xác thực</span>
                                    </div>
                                    {traceData?.traceData?.version && (
                                        <div className="text-xs text-blue-100">
                                            Version {traceData.traceData.version}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Blockchain animation effect */}
                            <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                                <div className="w-full h-full bg-white rounded-full animate-pulse"></div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 bg-white">
                            {loading ? (
                                <div className="text-center py-8">
                                    <Spin size="large" />
                                    <p className="mt-4 text-gray-600">Đang tải thông tin xác thực...</p>
                                </div>
                            ) : error ? (
                                <div className="text-center py-8">
                                    <div className="text-red-500 mb-2">⚠️</div>
                                    <p className="text-red-600">{error}</p>
                                </div>
                            ) : traceData ? (
                                <>
                                    {/* Product info */}
                                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6 border border-blue-200">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900 mb-2">
                                                    {traceData.traceData.productName}
                                                </h3>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Factory className="w-4 h-4 text-gray-500" />
                                                        <span className="text-gray-600">Nhà sản xuất: </span>
                                                        <span className="font-medium">{traceData.traceData.manufacturerName}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Globe className="w-4 h-4 text-gray-500" />
                                                        <span className="text-gray-600">Xuất xứ: </span>
                                                        <span className="font-medium">{traceData.traceData.manufacturingCountry || 'Việt Nam'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-4 h-4 text-gray-500" />
                                                        <span className="text-gray-600">Thời gian: </span>
                                                        <span className="font-medium">{formatDateTime(traceData.traceData.timestamp)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <div className="mb-3">
                                                    <span className="text-sm text-gray-600 mb-2 block">Tổ chức xác thực:</span>
                                                    <div className="flex flex-wrap gap-2">
                                                        {traceData.traceData.verifiedBy?.map((org, index) => (
                                                            <Badge key={index} color="green" text={org} />
                                                        )) || (
                                                                <>
                                                                    <Badge color="green" text="Đơn vị nội bộ" />
                                                                    <Badge color="green" text="Đơn vị bên ngoài" />
                                                                    <Badge color="green" text="Đơn vị có ủy quyền" />
                                                                </>
                                                            )}
                                                    </div>
                                                </div>

                                                {traceData.cid && (
                                                    <div>
                                                        <span className="text-sm text-gray-600 mb-2 block">Blockchain CID:</span>
                                                        <div className="flex items-center gap-2 bg-gray-100 p-2 rounded text-xs font-mono">
                                                            <Link className="w-3 h-3 text-blue-500" />
                                                            <span className="flex-1 truncate">{traceData.cid}</span>
                                                            <Tooltip title={copied ? "Đã sao chép!" : "Sao chép CID"}>
                                                                <button
                                                                    onClick={handleCopyCID}
                                                                    className="text-blue-500 hover:text-blue-600"
                                                                >
                                                                    <Copy className="w-3 h-3" />
                                                                </button>
                                                            </Tooltip>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Supply chain timeline */}
                                    {timelineItems.length > 0 && (
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-6 flex items-center gap-2 text-base">
                                                <Users className="w-5 h-5 text-blue-500" />
                                                Chuỗi cung ứng sản phẩm
                                            </h4>

                                            <Timeline
                                                items={timelineItems}
                                                className="blockchain-timeline"
                                            />
                                        </div>
                                    )}

                                    {/* Footer */}
                                    <div className="mt-6 pt-4 border-t border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Shield className="w-4 h-4 text-green-500" />
                                                <span>Thông tin được bảo mật trên blockchain, không thể thay đổi</span>
                                            </div>
                                            {/* <button className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1">
                                                <ExternalLink className="w-4 h-4" />
                                                Xem trên blockchain explorer
                                            </button> */}
                                        </div>
                                    </div>
                                </>
                            ) : null}
                        </div>
                    </div>
                </Modal>

                <Modal
                    open={showImageModal}
                    onCancel={() => setShowImageModal(false)}
                    footer={null}
                    width={800}
                    centered
                    title="Hình ảnh minh chứng"
                >
                    <div className="grid grid-cols-2 gap-4">
                        {selectedStepImages.map((img, index) => (
                            <div key={index} className="text-center">
                                <Image
                                    src={img}
                                    alt={`Minh chứng ${index + 1}`}
                                    style={{
                                        width: '100%',
                                        borderRadius: 8,
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                    }}
                                    placeholder
                                />
                            </div>
                        ))}
                    </div>
                </Modal>
            </div>

            <style jsx>{`
                .blockchain-auth-modal .ant-modal-content {
                    border-radius: 12px !important;
                    overflow: hidden;
                }
                
                .blockchain-timeline .ant-timeline-item-tail {
                    border-left: 2px dashed #e5e7eb;
                }
                
                .blockchain-timeline .ant-timeline-item:last-child .ant-timeline-item-tail {
                    display: none;
                }
            `}</style>
        </div>
    );
};

export default BlockchainAuthModal;