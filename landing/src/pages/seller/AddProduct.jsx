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
  Table,
} from "antd";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import styled from "styled-components";
import productService from "../../services/product.service";
import { showToast } from "../../utils/toast";

const CKEditorWrapper = styled.div`
  .ck-editor__editable_inline {
    min-height: 300px !important;
  }
`;

const VariantManager = ({ form, initialData }) => {
  const [attributes, setAttributes] = useState(
    initialData.variants?.attributes || [{ name: "", values: [] }]
  );
  const [variants, setVariants] = useState(initialData.variants?.list || []);

  // Thêm thuộc tính mới (ví dụ: Size, Màu sắc)
  const addAttribute = () => {
    setAttributes([...attributes, { name: "", values: [] }]);
  };

  // Cập nhật tên thuộc tính
  const updateAttributeName = (index, value) => {
    const newAttributes = [...attributes];
    newAttributes[index].name = value;
    setAttributes(newAttributes);
    generateVariants(newAttributes);
  };

  // Cập nhật giá trị thuộc tính (ví dụ: S, M, L)
  const updateAttributeValues = (index, values) => {
    const newAttributes = [...attributes];
    newAttributes[index].values = values;
    setAttributes(newAttributes);
    generateVariants(newAttributes);
  };

  // Tạo các biến thể từ thuộc tính
  const generateVariants = (attrs) => {
    const validAttrs = attrs.filter((attr) => attr.name && attr.values.length > 0);
    if (validAttrs.length === 0) {
      setVariants([]);
      form.setFieldsValue({ variants: [] });
      return;
    }

    const combinations = validAttrs.reduce(
      (acc, attr) =>
        acc.flatMap((combo) =>
          attr.values.map((value) => ({ ...combo, [attr.name]: value }))
        ),
      [{}]
    );

    const newVariants = combinations.map((combo, index) => ({
      id: index,
      attributes: combo,
      sku: combo.sku || `SKU-${index + 1}`,
      price: combo.price || 0,
      stock: combo.stock || 0,
    }));

    setVariants(newVariants);
    form.setFieldsValue({ variants: newVariants });
  };

  // Cập nhật thông tin biến thể
  const updateVariant = (id, field, value) => {
    const newVariants = variants.map((variant) =>
      variant.id === id ? { ...variant, [field]: value } : variant
    );
    setVariants(newVariants);
    form.setFieldsValue({ variants: newVariants });
  };

  // Xóa thuộc tính
  const removeAttribute = (index) => {
    const newAttributes = attributes.filter((_, i) => i !== index);
    setAttributes(newAttributes);
    generateVariants(newAttributes);
  };

  // Cột cho bảng biến thể
  const columns = [
    {
      title: "Biến thể",
      dataIndex: "attributes",
      render: (attributes) =>
        Object.entries(attributes)
          .map(([key, value]) => `${key}: ${value}`)
          .join(", "),
    },
    {
      title: "SKU",
      dataIndex: "sku",
      render: (sku, record) => (
        <Input
          value={sku}
          onChange={(e) => updateVariant(record.id, "sku", e.target.value)}
        />
      ),
    },
    {
      title: "Giá",
      dataIndex: "price",
      render: (price, record) => (
        <InputNumber
          min={0}
          value={price}
          onChange={(value) => updateVariant(record.id, "price", value)}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          parser={(value) => value.replace(/[^0-9]/g, "")}
        />
      ),
    },
    {
      title: "Tồn kho",
      dataIndex: "stock",
      render: (stock, record) => (
        <InputNumber
          min={0}
          value={stock}
          onChange={(value) => updateVariant(record.id, "stock", value)}
        />
      ),
    },
  ];

  return (
    <div>
      <h4>Thuộc tính</h4>
      {attributes.map((attr, index) => (
        <Row gutter={16} key={index} style={{ marginBottom: 16 }}>
          <Col xs={8}>
            <Input
              placeholder="Tên thuộc tính (VD: Size, Màu sắc)"
              value={attr.name}
              onChange={(e) => updateAttributeName(index, e.target.value)}
            />
          </Col>
          <Col xs={12}>
            <Select
              mode="tags"
              placeholder="Giá trị (VD: S, M, L)"
              value={attr.values}
              onChange={(values) => updateAttributeValues(index, values)}
              style={{ width: "100%" }}
            />
          </Col>
          <Col xs={4}>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => removeAttribute(index)}
            />
          </Col>
        </Row>
      ))}
      <Button
        type="dashed"
        onClick={addAttribute}
        icon={<PlusOutlined />}
        style={{ width: "100%", marginBottom: 16 }}
      >
        Thêm thuộc tính
      </Button>

      <h4>Danh sách biến thể</h4>
      <Table
        dataSource={variants}
        columns={columns}
        rowKey="id"
        pagination={false}
      />
      <Form.Item name="variants" noStyle>
        <Input type="hidden" />
      </Form.Item>
    </div>
  );
};

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

  useEffect(() => {
    if (initialData) {
      form.setFieldsValue({
        ...initialData,
        variants: initialData.variants?.list || [],
      });
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
      if (Array.isArray(initialData.additional_images)) {
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
        const mainImage = mainImageList[0]?.url || "";
        const additionalImages = additionalImageList.map((file) => file.url);

        const payload = {
          ...values,
          main_image: mainImage,
          additional_images: additionalImages,
          variants: values.variants || [],
        };

        const response = await productService.product_create(payload);
        if (response.isSuccess) {
          refreshData();
          showToast.success("Thêm sản phẩm thành công");
        }
        form.resetFields();
        setMainImageList([]);
        setAdditionalImageList([]);
        onClose();
      } catch (error) {
        showToast.error(error.message);
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
        initialValues={{ status: "active", is_featured: false, variants: [] }}
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

              <Col xs={24} md={12}>
                <Form.Item name="stock_quantity" label="Tồn kho">
                  <InputNumber
                    min={0}
                    placeholder="Nhập tồn kho"
                    style={{ width: "100%", borderRadius: 6 }}
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    parser={(value) => value.replace(/[^0-9]/g, "")}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
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
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    parser={(value) => value.replace(/[^0-9]/g, "")}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
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
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    parser={(value) => value.replace(/[^0-9]/g, "")}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
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

          <Tabs.TabPane tab="Biến thể" key="2">
            <Row gutter={16}>
              <Col xs={24}>
                <Form.Item label="Quản lý biến thể">
                  <VariantManager form={form} initialData={initialData} />
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