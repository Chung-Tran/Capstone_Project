import React, { useState, useEffect } from "react";
import {
  Modal,
  Col,
  Row,
  Form,
  Input,
  InputNumber,
  Select,
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
import axiosClient from "../../config/axios";
import { showToast } from "../../utils/toast";

const CKEditorWrapper = styled.div`
  .ck-editor__editable_inline {
    min-height: 300px !important;
  }
`;

const VariantManager = ({ form, initialData }) => {
  const [attributes, setAttributes] = useState(
    initialData?.variants?.attributes || [{ variants_name: "", values: [] }]
  );
  const [variants, setVariants] = useState(
    initialData?.variants || []
  );

  useEffect(() => {
    if (initialData?.variants) {
      setVariants(
        initialData.variants.map((variant, index) => ({
          ...variant,
          id: variant._id || index, // Giữ _id nếu có, hoặc dùng index tạm
        }))
      );
      form.setFieldsValue({ variants: initialData.variants });
    }
  }, [initialData, form]);

  const addAttribute = () => {
    setAttributes([...attributes, { variants_name: "", values: [] }]);
  };

  const updateAttributeName = (index, value) => {
    const newAttributes = [...attributes];
    newAttributes[index].variants_name = value;
    setAttributes(newAttributes);
    generateVariants(newAttributes);
  };

  const updateAttributeValues = (index, values) => {
    const newAttributes = [...attributes];
    newAttributes[index].values = values;
    setAttributes(newAttributes);
    generateVariants(newAttributes);
  };

  const removeAttribute = (index) => {
    const newAttributes = attributes.filter((_, i) => i !== index);
    setAttributes(newAttributes);
    generateVariants(newAttributes);
  };

  const generateVariants = (attrs) => {
    const validAttrs = attrs.filter(
      (attr) => attr.variants_name && attr.values.length > 0
    );
    if (validAttrs.length === 0) {
      setVariants(initialData?.variants || []);
      form.setFieldsValue({ variants: initialData?.variants || [] });
      return;
    }

    const combinations = validAttrs.reduce(
      (acc, attr) =>
        acc.flatMap((combo) =>
          attr.values.map((value) => ({
            ...combo,
            [attr.variants_name]: value,
          }))
        ),
      [{}]
    );

    const newVariants = combinations.map((combo, index) => {
      const existingVariant = variants.find(
        (v) =>
          Object.entries(combo).every(
            ([key, value]) => v.attributes?.[key] === value
          )
      );
      return {
        id: existingVariant?._id || index,
        _id: existingVariant?._id, // Giữ _id nếu có
        attributes: combo,
        variants_name: existingVariant?.variants_name || `SKU-${index + 1}`,
        variants_stock_quantity:
          existingVariant?.variants_stock_quantity || 0,
      };
    });

    setVariants(newVariants);
    form.setFieldsValue({ variants: newVariants });
  };

  const updateVariant = (id, field, value) => {
    if (
      field === "variants_name" &&
      variants.some((v) => v.variants_name === value && v.id !== id)
    ) {
      showToast.error("SKU đã tồn tại!");
      return;
    }
    const newVariants = variants.map((variant) =>
      variant.id === id ? { ...variant, [field]: value } : variant
    );
    setVariants(newVariants);
    form.setFieldsValue({ variants: newVariants });
  };

  const columns = [
    {
      title: "Biến thể",
      dataIndex: "attributes",
      render: (attributes) =>
        attributes
          ? Object.entries(attributes)
              .map(([key, value]) => `${key}: ${value}`)
              .join(", ")
          : "-",
    },
    {
      title: "SKU",
      dataIndex: "variants_name",
      render: (variants_name, record) => (
        <Input
          value={variants_name}
          onChange={(e) =>
            updateVariant(record.id, "variants_name", e.target.value)
          }
        />
      ),
    },
    {
      title: "Tồn kho",
      dataIndex: "variants_stock_quantity",
      render: (variants_stock_quantity, record) => (
        <InputNumber
          min={0}
          value={variants_stock_quantity}
          onChange={(value) =>
            updateVariant(record.id, "variants_stock_quantity", value)
          }
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
              value={attr.variants_name}
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

const EditProduct = ({ isOpen, onClose, refreshData, initialData = {} }) => {
  const [form] = Form.useForm();
  const [mainImageList, setMainImageList] = useState([]);
  const [additionalImageList, setAdditionalImageList] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [categories, setCategories] = useState([]);
  const { Option } = Select;

  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosClient.get('/categories');
        setCategories(response.data.data || []);
      } catch (error) {
        showToast.error("Không thể tải danh mục");
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      form.setFieldsValue({
        ...initialData,
        category_id: initialData.category_id?.map((cat) => cat._id) || [],
        variants: initialData.variants || [],
        tags: initialData.tags ? initialData.tags.join(', ') : '',
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

  const renderCategoryOptions = (categories, prefix = '') => {
    return categories.map(category => {
      const isLeaf = !category.children || category.children.length === 0;
      return [
        isLeaf && (
          <Option key={category._id} value={category._id}>
            {prefix + category.name}
          </Option>
        ),
        category.children && category.children.length > 0 && renderCategoryOptions(category.children, prefix + '— ')
      ].filter(Boolean);
    });
  };

  const handleOk = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();
      const mainImage = mainImageList[0]?.url || "";
      const additionalImages = additionalImageList.map((file) => file.url);
      const total_stock_quantity = values.variants?.reduce(
        (sum, v) => sum + (v.variants_stock_quantity || 0),
        0
      ) || 0;

      // Hợp nhất biến thể cũ và mới
      const updatedVariants = values.variants.map((variant) => ({
        ...variant,
        _id: variant._id, // Giữ _id nếu có
        attributes: variant.attributes || {},
        variants_name: variant.variants_name || `SKU-${Date.now()}`,
        variants_stock_quantity: variant.variants_stock_quantity || 0,
      }));

      const payload = {
        ...values,
        main_image: mainImage,
        additional_images: additionalImages,
        total_stock_quantity,
        category_id: values.category_id || [],
        tags: values.tags ? values.tags.split(',').map(tag => tag.trim()) : [],
        variants: updatedVariants,
      };

      console.log('Payload gửi API:', payload);

      const response = await productService.product_update(initialData._id, payload);
      if (response.isSuccess) {
        refreshData();
        showToast.success("Cập nhật sản phẩm thành công");
        form.resetFields();
        setMainImageList([]);
        setAdditionalImageList([]);
        onClose();
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật sản phẩm:', error);
      showToast.error(error.message || "Không thể cập nhật sản phẩm");
    }
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
          Cập nhật sản phẩm
        </span>
      }
      open={isOpen}
      onCancel={handleCancel}
      onOk={handleOk}
      okText="Cập nhật"
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
              <Col xs={24} md={12}>
                <Form.Item
                  name="name"
                  label="Tên sản phẩm"
                  rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm!" }]}
                >
                  <Input
                    placeholder="Nhập tên sản phẩm"
                    style={{ borderRadius: 6 }}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="category_id"
                  label="Thể Loại"
                  rules={[{ required: true, message: "Vui lòng chọn loại sản phẩm!" }]}
                >
                  <Select
                    mode="multiple"
                    placeholder="Chọn loại sản phẩm"
                    style={{ borderRadius: 6 }}
                  >
                    {renderCategoryOptions(categories)}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="price"
                  label="Giá bán"
                  rules={[{ required: true, message: "Vui lòng nhập giá bán!" }]}
                >
                  <InputNumber
                    min={0}
                    placeholder="VNĐ"
                    style={{ width: "100%", borderRadius: 6 }}
                    parser={(value) => value.replace(/[^0-9]/g, "")}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item name="original_price" label="Giá gốc">
                  <InputNumber
                    min={0}
                    placeholder="VNĐ"
                    style={{ width: "100%", borderRadius: 6 }}
                    parser={(value) => value.replace(/[^0-9]/g, "")}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item name="weight" label="Trọng lượng (kg)">
                  <InputNumber
                    min={0}
                    placeholder="Nhập trọng lượng"
                    style={{ width: "100%", borderRadius: 6 }}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item label="Kích thước (cm)">
                  <Space>
                    <Form.Item name={["dimensions", "length"]} noStyle>
                      <InputNumber
                        min={0}
                        placeholder="Dài"
                        style={{ width: "100px" }}
                      />
                    </Form.Item>
                    <Form.Item name={["dimensions", "width"]} noStyle>
                      <InputNumber
                        min={0}
                        placeholder="Rộng"
                        style={{ width: "100px" }}
                      />
                    </Form.Item>
                    <Form.Item name={["dimensions", "height"]} noStyle>
                      <InputNumber
                        min={0}
                        placeholder="Cao"
                        style={{ width: "100px" }}
                      />
                    </Form.Item>
                  </Space>
                </Form.Item>
              </Col>

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
                <Col xs={24} md={8}>
                  <Form.Item name="main_image" label="Ảnh chính">
                    <Upload {...mainImageProps}>
                      {mainImageList.length >= 1 ? null : uploadButton}
                    </Upload>
                  </Form.Item>
                </Col>

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
                    data={initialData?.description || ""}
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

export default EditProduct;