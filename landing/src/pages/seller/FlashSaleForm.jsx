import React, { useState, useEffect } from "react";
import { Modal, Form, Select, InputNumber, Button, message } from "antd";
import flashSaleService from "../../services/flashSale.service"; // Sửa tên file

const { Option } = Select;

const FlashSaleForm = ({ isOpen, onClose, refreshData, flashSaleId }) => {
  const [form] = Form.useForm();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSellerProducts();
  }, []);

  const fetchSellerProducts = async () => {
    try {
      const response = await flashSaleService.getSellerProducts();
      setProducts(response.data || []);
    } catch (error) {
      message.error(error.message);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const registrationData = {
        product_id: values.product_id,
        quantity: values.quantity,
        discount: values.discount,
      };
      await flashSaleService.registerFlashSale(flashSaleId, registrationData);
      message.success("Đăng ký flash sale thành công");
      refreshData();
      onClose();
      form.resetFields();
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Đăng ký Flash Sale"
      open={isOpen}
      onCancel={onClose}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="product_id"
          label="Sản phẩm"
          rules={[{ required: true, message: "Vui lòng chọn sản phẩm" }]}
        >
          <Select placeholder="Chọn sản phẩm">
            {products.map((product) => (
              <Option key={product._id} value={product._id}>
                {product.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="quantity"
          label="Số lượng"
          rules={[{ required: true, message: "Vui lòng nhập số lượng" }]}
        >
          <InputNumber min={1} placeholder="Số lượng" style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          name="discount"
          label="Mức giảm giá (%)"
          rules={[{ required: true, message: "Vui lòng nhập mức giảm giá" }]}
        >
          <InputNumber min={0} max={100} placeholder="Mức giảm giá" style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item>
          <div className="flex justify-end space-x-2">
            <Button onClick={onClose}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Đăng ký
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default FlashSaleForm;