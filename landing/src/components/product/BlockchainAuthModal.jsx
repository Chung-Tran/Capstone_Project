import React, { useState } from 'react';
import { Modal, Timeline, Badge, Tooltip } from 'antd';
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

const BlockchainAuthModal = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [copied, setCopied] = useState(false);

    // Mock data based on your API response
    const mockData = {
        success: true,
        productId: "68020898b679ab59636c5ef3",
        cid: "bafkreiekbq4cdrhh54cajvyhlx4f2lhkd53rdhuexk3xhrrfdtcd7ygvke",
        traceData: {
            productId: "68020898b679ab59636c5ef3",
            productName: "iPhone 14 Pro Max",
            sellerId: "67f3931a601f14d815f28574",
            manufacturerName: "Apple Inc.",
            manufacturingCountry: "USA",
            timestamp: "2025-06-03T09:45:00Z",
            version: 1,
            verifiedBy: ["VietCert", "SGS"],
            supplyChainSteps: [
                {
                    step: "Manufactured",
                    location: "California, USA",
                    timestamp: "2025-05-01T08:00:00Z",
                    description: "Sản phẩm được sản xuất tại nhà máy chính của Apple.",
                    image: "https://gateway.pinata.cloud/ipfs/QmABC123.../factory.jpg",
                    verifiedBy: "Apple Inc."
                },
                {
                    step: "Shipped to warehouse",
                    location: "Singapore",
                    timestamp: "2025-05-03T13:30:00Z",
                    description: "Giao đến kho phân phối khu vực Đông Nam Á.",
                    image: "https://gateway.pinata.cloud/ipfs/QmXYZ456.../warehouse.jpg",
                    verifiedBy: "DHL Express"
                }
            ]
        }
    };

    const formatDate = (timestamp) => {
        return new Date(timestamp).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleCopyCID = () => {
        navigator.clipboard.writeText(mockData.cid);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getStepIcon = (step) => {
        switch (step.toLowerCase()) {
            case 'manufactured':
                return <Factory className="w-4 h-4" />;
            case 'shipped to warehouse':
                return <Truck className="w-4 h-4" />;
            default:
                return <Package className="w-4 h-4" />;
        }
    };

    const timelineItems = mockData.traceData.supplyChainSteps.map((step, index) => ({
        // dot: (
        //     <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white">
        //         {getStepIcon(step.step)}
        //     </div>
        // ),
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

                            {step.image && (
                                <Tooltip title="Xem ảnh minh chứng">
                                    <button className="text-blue-500 hover:text-blue-600 text-xs flex items-center gap-1">
                                        <Eye className="w-3 h-3" />
                                        Xem ảnh
                                    </button>
                                </Tooltip>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )
    }));

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
                                    <div className="text-xs text-blue-100">
                                        Version {mockData.traceData.version}
                                    </div>
                                </div>
                            </div>

                            {/* Blockchain animation effect */}
                            <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                                <div className="w-full h-full bg-white rounded-full animate-pulse"></div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 bg-white">
                            {/* Product info */}
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6 border border-blue-200">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900 mb-2">
                                            {mockData.traceData.productName}
                                        </h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Factory className="w-4 h-4 text-gray-500" />
                                                <span className="text-gray-600">Nhà sản xuất: </span>
                                                <span className="font-medium">{mockData.traceData.manufacturerName}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Globe className="w-4 h-4 text-gray-500" />
                                                <span className="text-gray-600">Xuất xứ: </span>
                                                <span className="font-medium">{mockData.traceData.manufacturingCountry}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-gray-500" />
                                                <span className="text-gray-600">Thời gian: </span>
                                                <span className="font-medium">{formatDate(mockData.traceData.timestamp)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="mb-3">
                                            <span className="text-sm text-gray-600 mb-2 block">Tổ chức xác thực:</span>
                                            <div className="flex flex-wrap gap-2">
                                                {mockData.traceData.verifiedBy.map((org, index) => (
                                                    <Badge key={index} color="green" text={org} />
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <span className="text-sm text-gray-600 mb-2 block">Blockchain CID:</span>
                                            <div className="flex items-center gap-2 bg-gray-100 p-2 rounded text-xs font-mono">
                                                <Link className="w-3 h-3 text-blue-500" />
                                                <span className="flex-1 truncate">{mockData.cid}</span>
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
                                    </div>
                                </div>
                            </div>

                            {/* Supply chain timeline */}
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

                            {/* Footer */}
                            <div className="mt-6 pt-4 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Shield className="w-4 h-4 text-green-500" />
                                        <span>Thông tin được bảo mật trên blockchain, không thể thay đổi</span>
                                    </div>
                                    <button className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1">
                                        <ExternalLink className="w-4 h-4" />
                                        Xem trên blockchain explorer
                                    </button>
                                </div>
                            </div>
                        </div>
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