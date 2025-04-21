import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Button,
  Row,
  Col,
} from "antd";
import moment from "moment";
import voucherService from "../../services/voucher.service";
import { showToast } from "../../utils/toast";

const { Option } = Select;
const { RangePicker } = DatePicker;

const VoucherForm = ({ isOpen, onClose, refreshData, initialData, mode }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData && (mode === "edit" || mode === "view")) {
      form.setFieldsValue({
        promotion_code: initialData.promotion_code,
        name: initialData.name,
        description: initialData.description,
        discount_type: initialData.discount_type,
        discount_value: initialData.discount_value,
        date_range: initialData.start_date
          ? [
              moment(initialData.start_date),
              initialData.end_date ? moment(initialData.end_date) : null,
            ]
          : null,
        minimum_purchase_amount: initialData.minimum_purchase_amount,
        maximum_discount: initialData.maximum_discount,
        usage_limit: initialData.usage_limit,
        status: initialData.status,
      });
    } else {
      form.resetFields();
    }
  }, [initialData, mode, form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = {
        ...values,
        start_date: values.date_range
          ? values.date_range[0].toISOString()
          : null,
        end_date: values.date_range
          ? values.date_range[1]?.toISOString()
          : null,
      };
      delete payload.date_range;

      let response;
      if (mode === "add") {
        response = await voucherService.createVoucher(payload);
      } else if (mode === "edit") {
        response = await voucherService.updateVoucher(initialData._id, payload);
      }

      if (response.isSuccess) {
        showToast.success(
          mode === "add"
            ? "Thêm voucher thành công"
            : "Cập nhật voucher thành công"
        );
        refreshData();
        onClose();
      }
    } catch (error) {
      showToast.error(
        error.message ||
          (mode === "add"
            ? "Thêm voucher thất bại"
            : "Cập nhật voucher thất bại")
      );
    } finally {
      setLoading(false);
    }
  };
  console.log(isOpen);
  return (
    <Modal
      title={
        mode === "add"
          ? "Thêm Voucher"
          : mode === "edit"
          ? "Chỉnh sửa Voucher"
          : "Xem Voucher"
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={1000}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        disabled={mode === "view"}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="promotion_code"
              label="Mã Voucher"
              rules={[{ required: true, message: "Vui lòng nhập mã voucher" }]}
            >
              <Input placeholder="Nhập mã voucher" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Tên Voucher"
              rules={[{ required: true, message: "Vui lòng nhập tên voucher" }]}
            >
              <Input placeholder="Nhập tên voucher" />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="description" label="Mô tả">
          <Input.TextArea placeholder="Nhập mô tả" rows={4} />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="discount_type"
              label="Loại giảm giá"
              rules={[
                { required: true, message: "Vui lòng chọn loại giảm giá" },
              ]}
            >
              <Select placeholder="Chọn loại giảm giá">
                <Option value="percentage">Phần trăm</Option>
                <Option value="fixed">Cố định</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="discount_value"
              label="Giá trị giảm giá"
              rules={[
                { required: true, message: "Vui lòng nhập giá trị giảm giá" },
              ]}
            >
              <InputNumber
                min={0}
                placeholder="Nhập giá trị"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="date_range" label="Thời hạn hiệu lực">
          <RangePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="minimum_purchase_amount"
              label="Đơn hàng tối thiểu"
            >
              <InputNumber
                min={0}
                placeholder="Nhập số tiền tối thiểu"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="maximum_discount" label="Giảm giá tối đa">
              <InputNumber
                min={0}
                placeholder="Nhập số tiền giảm tối đa"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="usage_limit" label="Giới hạn sử dụng">
              <InputNumber
                min={0}
                placeholder="Nhập số lần sử dụng tối đa"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="status"
              label="Trạng thái"
              rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
            >
              <Select placeholder="Chọn trạng thái">
                <Option value="active">Hoạt động</Option>
                <Option value="inactive">Không hoạt động</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        {mode !== "view" && (
          <Form.Item>
            <div className="flex justify-end space-x-2">
              <Button onClick={onClose}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {mode === "add" ? "Thêm" : "Cập nhật"}
              </Button>
            </div>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default VoucherForm;
