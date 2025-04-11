import React, { useState, useEffect } from "react";
import {
  Modal,
  Col,
  Row,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Space,
  Tabs,
  Upload,
  Image,
  Button,
} from "antd";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { PlusOutlined } from "@ant-design/icons";
import styled from "styled-components";
import productService from "../../services/product.service";
import { showToast } from "../../utils/toast";

const AddProduct = ({ isOpen, onClose, refreshData, initialData = {} }) => {
  const [form] = Form.useForm();
  const [mainImageList, setMainImageList] = useState([]);
  const [additionalImageList, setAdditionalImageList] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const { Option } = Select;

  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const CKEditorWrapper = styled.div`
    .ck-editor__editable_inline {
      min-height: 300px !important;
    }
  `;

  useEffect(() => {
    if (initialData) {
      form.setFieldsValue(initialData);
      if (initialData.main_image) {
        setMainImageList([
          {
            uid: "-1",
            name: "main_image",
            status: "done",
            url: initialData.main_image,
          },
        ]);
      }
      if (
        initialData.additional_images &&
        initialData.additional_images.length > 0
      ) {
        setAdditionalImageList(
          initialData.additional_images.map((url, index) => ({
            uid: `-${index + 1}`,
            name: `additional_image_${index + 1}`,
            status: "done",
            url,
          }))
        );
      }
    }
  }, [initialData, form]);

  const handleOk = () => {
    form.validateFields().then(async (values) => {
      try {
        const response = await productService.product_create(values)
        if (response.isSuccess) {
          refreshData()
          showToast.success('Thêm sản phẩm thành công')
        }
        form.resetFields();
        setMainImageList([]);
        setAdditionalImageList([]);
        onClose();
      } catch (error) {
        showToast.error(error.message)
      }
    });
  };

  const handleCancel = () => {
    form.resetFields();
    setMainImageList([]);
    setAdditionalImageList([]);
    onClose();
  };

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };

  const handleMainImageChange = ({ fileList: newFileList }) =>
    setMainImageList(newFileList);
  const handleAdditionalImageChange = ({ fileList: newFileList }) =>
    setAdditionalImageList(newFileList);

  const uploadButton = (
    <div style={{ padding: 10 }}>
      <PlusOutlined style={{ fontSize: 24, color: "#1890ff" }} />
      <div style={{ marginTop: 8, color: "#1890ff", fontWeight: 500 }}>
        Upload
      </div>
    </div>
  );

  const categories = [
    { id: "cat1", name: "Electronics" },
    { id: "cat2", name: "Clothing" },
    { id: "cat3", name: "Books" },
  ];

  const mainImageProps = {
    listType: "picture-card",
    fileList: mainImageList,
    onPreview: handlePreview,
    onChange: handleMainImageChange,
    beforeUpload: (file) => {
      const url = URL.createObjectURL(file);
      setMainImageList([
        { uid: file.uid, name: file.name, status: "done", url },
      ]);
      return false;
    },
    maxCount: 1,
  };

  const additionalImageProps = {
    listType: "picture-card",
    fileList: additionalImageList,
    onPreview: handlePreview,
    onChange: handleAdditionalImageChange,
    beforeUpload: (file) => {
      const url = URL.createObjectURL(file);
      setAdditionalImageList((prev) => [
        ...prev,
        { uid: file.uid, name: file.name, status: "done", url },
      ]);
      return false;
    },
    multiple: true,
  };

  return (
    <Modal
      title={
        <span style={{ fontSize: 20, fontWeight: 600, color: "#1d39c4" }}>
          Thêm sản phẩm
        </span>
      }
      open={isOpen}
      onCancel={handleCancel}
      onOk={handleOk}
      okText="Thêm"
      cancelText="Hủy"
      width={1200}
      style={{ top: 20 }}
      okButtonProps={{
        style: { background: "#1d39c4", borderColor: "#1d39c4" },
      }}
      cancelButtonProps={{ style: { borderColor: "#d9d9d9" } }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ status: "active", is_featured: false, }}
      >
        <Tabs
          defaultActiveKey="1"
          tabBarStyle={{ marginBottom: 24, fontWeight: 500, color: "#1d39c4" }}
        >
          <Tabs.TabPane tab="Thông tin cơ bản" key="1">
            <Row gutter={16}>
              {/* Mã sản phẩm */}
              <Col xs={24} md={12}>
                <Form.Item
                  name="product_code"
                  label="Mã sản phẩm"
                  rules={[{ required: true }]}
                >
                  <Input
                    placeholder="Nhập mã sản phẩm"
                    style={{ borderRadius: 6 }}
                  />
                </Form.Item>
              </Col>

              {/* Thể loại (multi-select) */}
              <Col xs={24} md={12}>
                <Form.Item
                  name="category"
                  label="Thể Loại"
                  rules={[
                    { required: true, message: "Vui lòng chọn loại sản phẩm!" },
                  ]}
                >
                  <Select
                    mode="multiple"
                    placeholder="Chọn loại sản phẩm"
                    style={{ borderRadius: 6 }}
                  >
                    {categories.map((category) => (
                      <Option key={category.id} value={category.id}>
                        {category.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              {/* Tên sản phẩm */}
              <Col xs={24} md={12}>
                <Form.Item
                  name="name"
                  label="Tên sản phẩm"
                  rules={[{ required: true }]}
                >
                  <Input
                    placeholder="Nhập tên sản phẩm"
                    style={{ borderRadius: 6 }}
                  />
                </Form.Item>
              </Col>

              {/* Tồn kho */}
              <Col xs={24} md={12}>
                <Form.Item name="stock_quantity" label="Số lượng">
                  <InputNumber
                    min={0}
                    placeholder="Nhập số lượng"
                    style={{ width: "100%", borderRadius: 6 }}
                  />
                </Form.Item>
              </Col>

              {/* Giá */}
              <Col xs={24} md={12}>
                <Form.Item
                  name="price"
                  label="Giá bán"
                  rules={[{ required: true }]}
                >
                  <InputNumber
                    min={0}
                    placeholder="VNĐ"
                    style={{ width: "100%", borderRadius: 6 }}
                  />
                </Form.Item>
              </Col>

              {/* Giá gốc */}
              <Col xs={24} md={12}>
                <Form.Item name="original_price" label="Giá gốc">
                  <InputNumber
                    min={0}
                    placeholder="VNĐ"
                    style={{ width: "100%", borderRadius: 6 }}
                  />
                </Form.Item>
              </Col>

              {/* Trạng thái */}
              <Col xs={24} md={12}>
                <Form.Item name="status" label="Trạng thái">
                  <Select
                    placeholder="Chọn trạng thái"
                    style={{ borderRadius: 6 }}
                  >
                    <Option value="active">Đang bán</Option>
                    <Option value="inactive">Tạm ngừng</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="tags" label="Tags (phân cách bởi dấu phẩy)">
                  <Input
                    style={{ borderRadius: 6 }}
                    placeholder="tag1, tag2, tag3"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Tabs.TabPane>

          <Tabs.TabPane tab="Hình ảnh & mô tả" key="3">
            <div
              style={{
                background: "#fff",
                padding: 2,
                borderRadius: 8,
              }}
            >
              <Row gutter={16}>
                {/* Ảnh chính */}
                <Col xs={24} md={8}>
                  <Form.Item name="main_image" label="Ảnh chính">
                    <Upload {...mainImageProps}>
                      {mainImageList.length >= 1 ? null : uploadButton}
                    </Upload>
                  </Form.Item>
                </Col>

                {/* Ảnh phụ */}
                <Col xs={24} md={8}>
                  <Form.Item name="additional_images" label="Ảnh phụ">
                    <Upload {...additionalImageProps}>
                      {additionalImageList.length >= 8 ? null : uploadButton}
                    </Upload>
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="description" label="Mô tả">
                <CKEditorWrapper>
                  <CKEditor
                    editor={ClassicEditor}
                    data={initialData.description || ""}
                    onChange={(_event, editor) => {
                      const data = editor.getData();
                      form.setFieldsValue({ description: data });
                    }}
                  />
                </CKEditorWrapper>
              </Form.Item>


            </div>
          </Tabs.TabPane>
        </Tabs>
      </Form>

      {previewImage && (
        <Image
          wrapperStyle={{ display: "none" }}
          preview={{
            visible: previewOpen,
            onVisibleChange: (visible) => setPreviewOpen(visible),
            afterOpenChange: (visible) => !visible && setPreviewImage(""),
          }}
          src={previewImage}
        />
      )}
    </Modal>
  );
};

export default AddProduct;
