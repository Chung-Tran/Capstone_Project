// ReviewModal.tsx
import { Modal, Upload, Input, Button } from "antd";
import { useState } from "react";
import { Rating } from "react-simple-star-rating";
import { UploadOutlined } from "@ant-design/icons";

export default function ReviewModal({ visible, onClose, onSubmit }) {
    const [rating, setRating] = useState(0);
    const [content, setContent] = useState("");
    const [fileList, setFileList] = useState([]);

    const handleUploadChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    };

    const handleOk = () => {
        if (!rating || !content.trim()) return;

        const formData = new FormData();
        formData.append("content", content);
        formData.append("rating", rating);

        fileList.forEach(file => {
            formData.append("images", file.originFileObj); // Gửi nhiều ảnh (field images[])
        });

        onSubmit(formData);
        onClose();

        // Reset form
        setRating(0);
        setContent("");
        setFileList([]);
    };

    return (
        <Modal
            title="Đánh giá sản phẩm"
            open={visible}
            onCancel={onClose}
            onOk={handleOk}
            okText="Gửi đánh giá"
            cancelText="Hủy"
        >
            <div className="mb-4 w-full">
                <Rating
                    initialValue={rating}
                    onClick={setRating}
                    // allowFraction
                    size={30}
                    fillColor="#facc15"
                    emptyColor="#e5e7eb"
                    SVGstyle={{ display: 'inline-block' }}
                />
            </div>

            <div className="mb-4">
                <div className="text-sm font-medium text-gray-700 mb-1">Nội dung đánh giá:</div>
                <Input.TextArea
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Viết đánh giá của bạn..."
                />
            </div>

            <div>
                <div className="text-sm font-medium text-gray-700 mb-1">Hình ảnh:</div>
                <Upload
                    listType="picture-card"
                    fileList={fileList}
                    onChange={handleUploadChange}
                    beforeUpload={() => false} // Ngăn upload tự động
                >
                    {fileList.length < 3 && (
                        <div>
                            <UploadOutlined />
                            <div style={{ marginTop: 8 }}>Tải lên</div>
                        </div>
                    )}
                </Upload>
            </div>
        </Modal>
    );
}
