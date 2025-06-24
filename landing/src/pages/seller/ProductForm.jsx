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
  Descriptions,
  Badge,
  Checkbox,
  Tooltip,
} from "antd";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { PlusOutlined, DeleteOutlined, SearchOutlined, CheckCircleOutlined } from "@ant-design/icons";
import styled from "styled-components";
import productService from "../../services/product.service";
import axiosClient from "../../config/axios";
import { showToast } from "../../utils/toast";
import { useLoading } from "../../utils/useLoading";
import { useDispatch, useSelector } from "react-redux";
import TraceProductAddModal from "../../components/product/TraceProductAddModal";
import TraceProductDetailModal from "../../components/product/TraceProductDetailModal";
import { COLOR_OPTIONS } from "../../common/Constant";

const CKEditorWrapper = styled.div`
  .ck-editor__editable_inline {
    min-height: 300px !important;
  }
`;

const ProductForm = ({
  isOpen,
  onClose,
  refreshData,
  initialData = {},
  mode = "add",
}) => {
  const [form] = Form.useForm();
  const [mainImageList, setMainImageList] = useState([]);
  const [additionalImageList, setAdditionalImageList] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [categories, setCategories] = useState([]);
  const [showTraceDetailModal, setShowTraceDetailModal] = useState(false);
  const [showTraceProductModal, setShowTraceProductModal] = useState(false);
  const [mainImageFile, setMainImageFile] = useState(null);
  const [additionalImageFiles, setAdditionalImageFiles] = useState([]);
  const { Option } = Select;
  const { TabPane } = Tabs;
  const dispatch = useDispatch();
  const isReadOnly = mode === "view";
  const isEditing = mode === "edit";

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
        const response = await axiosClient.get("/categories");
        setCategories(response.data.data || []);
      } catch (error) {
        showToast.error("Không thể tải danh mục");
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (isOpen && initialData && Object.keys(initialData).length > 0) {
      form.setFieldsValue({
        ...initialData,
        category_id:
          initialData.category_id?.map((cat) => cat._id || cat) || [],
        tags: initialData.tags ? initialData.tags.join(", ") : "",
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
      } else {
        setMainImageList([]);
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
      } else {
        setAdditionalImageList([]);
      }

      // Reset file states when editing
      setMainImageFile(null);
      setAdditionalImageFiles([]);
    } else if (isOpen && mode === "add") {
      form.resetFields();
      setMainImageList([]);
      setAdditionalImageList([]);
      setMainImageFile(null);
      setAdditionalImageFiles([]);
    }
  }, [initialData, form, isOpen, mode]);

  const renderCategoryOptions = (categories, prefix = "") => {
    return categories.flatMap((category) => {
      const isLeaf = !category.children || category.children.length === 0;

      if (isLeaf) {
        return [
          <Option key={category._id} value={category._id}>
            {prefix + category.name}
          </Option>,
        ];
      }

      return [
        <Option key={category._id} value={category._id}>
          {prefix + category.name}
        </Option>,
        ...renderCategoryOptions(category.children, prefix + "— "),
      ];
    });
  };

  const handleSubmit = async () => {
    try {
      dispatch({ type: "shop/setLoading", payload: true });
      await form.validateFields();
      const values = form.getFieldsValue();

      // Create FormData object for sending multipart/form-data
      const formData = new FormData();

      // Add all form fields to FormData
      Object.keys(values).forEach((key) => {
        // Handle nested objects like dimensions
        if (key === "dimensions" && values[key]) {
          Object.keys(values[key]).forEach((dimKey) => {
            if (
              values[key][dimKey] !== undefined &&
              values[key][dimKey] !== null
            ) {
              formData.append(`dimensions[${dimKey}]`, values[key][dimKey]);
            }
          });
        }
        // Handle arrays like category_id and tags
        else if (key === "category_id" && Array.isArray(values[key])) {
          values[key].forEach((catId, index) => {
            formData.append(`category_id[${index}]`, catId);
          });
        } else if (key === "tags" && values[key]) {
          const tagsArray = values[key].split(",").map((tag) => tag.trim());
          tagsArray.forEach((tag, index) => {
            formData.append(`tags[${index}]`, tag);
          });
        } else if (key === "colors" && Array.isArray(values[key])) {
          values[key].forEach((catId, index) => {
            formData.append(`colors[${index}]`, catId);
          });
        }
        // Handle other regular fields
        else if (
          values[key] !== undefined &&
          values[key] !== null &&
          key !== "main_image" &&
          key !== "additional_images"
        ) {
          formData.append(key, values[key]);
        }
      });

      // Xử lý hình ảnh chính
      if (isEditing) {
        if (mainImageFile) {
          formData.append("main_image", mainImageFile); // Có file mới
        } else if (mainImageList.length > 0 && mainImageList[0].url) {
          formData.append("main_image_url", mainImageList[0].url); // Giữ ảnh cũ
        } else {
          formData.append("main_image_removed", "true"); // Ảnh chính bị xóa
        }
      } else {
        if (mainImageFile) {
          formData.append("main_image", mainImageFile);
        }
      }

      // Xử lý hình ảnh phụ
      if (isEditing) {
        // Ảnh phụ mới (có file)
        additionalImageFiles.forEach((file) => {
          formData.append("new_additional_images", file);
        });

        // URL ảnh phụ đang còn giữ lại
        const keptImageUrls = additionalImageList
          .filter((img) => img.url && !img.originFileObj)
          .map((img) => img.url);
        keptImageUrls.forEach((url, index) => {
          formData.append(`kept_additional_image_urls[${index}]`, url);
        });

        // (Tuỳ back-end) nếu cần: gửi danh sách ảnh bị xóa (tính bằng diff từ `initialData.additional_images`)
        const removedImageUrls =
          initialData.additional_images?.filter(
            (initialUrl) => !keptImageUrls.includes(initialUrl)
          ) || [];
        removedImageUrls.forEach((url, index) => {
          formData.append(`removed_additional_image_urls[${index}]`, url);
        });
      } else {
        // Thêm mới: gửi toàn bộ file ảnh phụ
        additionalImageFiles.forEach((file) => {
          formData.append("additional_images", file);
        });
      }

      let response;
      if (isEditing) {
        response = await productService.product_update(
          initialData._id,
          formData
        );
        if (response.isSuccess) {
          showToast.success("Cập nhật sản phẩm thành công");
        }
      } else {
        response = await productService.product_create(formData);
        if (response.isSuccess) {
          showToast.success("Thêm sản phẩm thành công");
          resetForm();
        }
      }

      if (response.isSuccess) {
        refreshData();
        onClose();
      }
    } catch (error) {
      console.error("Lỗi khi xử lý sản phẩm:", error);
      showToast.error(error.message || "Không thể xử lý sản phẩm");
    } finally {
      dispatch({ type: "shop/setLoading", payload: false });
    }
  };

  const resetForm = () => {
    form.resetFields();
    setMainImageList([]);
    setAdditionalImageList([]);
    setMainImageFile(null);
    setAdditionalImageFiles([]);
  };

  const handleCancel = () => {
    if (mode === "add") {
      resetForm();
    }
    onClose();
  };

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };

  const handleMainImageChange = ({ fileList }) => {
    setMainImageList(fileList);

    const uploadedFile = fileList.find((file) => file.originFileObj);
    if (uploadedFile) {
      setMainImageFile(uploadedFile.originFileObj);
    } else {
      setMainImageFile(null); // hoặc giữ nguyên nếu không muốn reset
    }
  };

  const handleAdditionalImageChange = ({ fileList, file }) => {
    setAdditionalImageList(fileList);

    // Update our additionalImageFiles array
    const newFiles = fileList
      .filter((file) => file.originFileObj)
      .map((file) => file.originFileObj);

    setAdditionalImageFiles(newFiles);
  };

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
      return false;
    },
    maxCount: 1,
    disabled: isReadOnly,
  };

  const additionalImageProps = {
    listType: "picture-card",
    fileList: additionalImageList,
    onPreview: handlePreview,
    onChange: handleAdditionalImageChange,
    beforeUpload: (file) => {
      // Don't actually upload the file to the server here
      return false;
    },
    multiple: true,
    disabled: isReadOnly,
  };

  // For view mode - render detailed product information
  if (isReadOnly && initialData) {
    return (
      <><Modal
        title={<span className="text-xl font-bold">Chi tiết sản phẩm</span>}
        open={isOpen}
        onCancel={onClose}
        footer={null}
        width={1000}
      >
        <Tabs defaultActiveKey="1">
          <TabPane tab="Thông tin cơ bản" key="1">
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Tên sản phẩm">
                {initialData.name}
              </Descriptions.Item>
              <Descriptions.Item label="Mã sản phẩm">
                {initialData.product_code || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Giá bán">
                {initialData.price?.toLocaleString() || 0}đ
              </Descriptions.Item>
              <Descriptions.Item label="Giá gốc">
                {initialData.original_price
                  ? initialData.original_price.toLocaleString() + "đ"
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng số lượng tồn">
                {initialData.stock || 0}
              </Descriptions.Item>

              <Descriptions.Item label="Màu sắc">
                {Array.isArray(initialData.colors) && initialData.colors.length > 0 ? (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {initialData.colors.map((colorValue) => {
                      const colorObj = COLOR_OPTIONS.find((c) => c.value === colorValue);
                      return (
                        <span key={colorValue} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <span
                            style={{
                              display: "inline-block",
                              width: 16,
                              height: 16,
                              borderRadius: "50%",
                              border: "1px solid #ccc",
                              backgroundColor: colorValue,
                              marginRight: 4,
                            }}
                          />
                          <span>{colorObj ? colorObj.label : colorValue}</span>
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  "-"
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Trạng thái">
                <Badge
                  status={
                    initialData.status === "active" ? "success" : "default"
                  }
                  text={
                    initialData.status === "active" ? "Đang bán" : "Tạm ngừng"
                  }
                />
              </Descriptions.Item>
              <Descriptions.Item label="Danh mục">
                {initialData.category_id && initialData.category_id.length > 0
                  ? initialData.category_id
                    .map((cat) => cat.name || "Không xác định")
                    .join(", ")
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Tags">
                {initialData.tags && initialData.tags.length > 0
                  ? initialData.tags.join(", ")
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Trọng lượng">
                {initialData.weight ? initialData.weight + " kg" : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Kích thước">
                {initialData.dimensions &&
                  initialData.dimensions.length &&
                  initialData.dimensions.width &&
                  initialData.dimensions.height
                  ? `${initialData.dimensions.length} x ${initialData.dimensions.width} x ${initialData.dimensions.height} cm`
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Xác thực nguồn gốc xuất xứ">
                {initialData.isTraceVerified ? (
                  <Tooltip title="Xem thông tin xác thực đã lưu trên blockchain">
                    <Button type="primary" onClick={() => setShowTraceDetailModal(true)}>
                      ✅ Đã xác thực - Xem chi tiết
                    </Button>
                    {
                      initialData.isTraceVerified ?
                        <Button className="ml-3" onClick={() => setShowTraceProductModal(true)}>
                          Bổ sung thông tin
                        </Button>
                        :
                        null
                    }
                  </Tooltip>
                ) : (
                  <Tooltip title="Bắt đầu xác thực sản phẩm trên blockchain">
                    <Button
                      type="default"
                      icon={<SearchOutlined />}
                      onClick={() => setShowTraceProductModal(true)}
                    >
                      Xác thực ngay
                    </Button>
                  </Tooltip>
                )}
              </Descriptions.Item>
            </Descriptions>
          </TabPane>

          <TabPane tab="Hình ảnh và mô tả" key="2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Ảnh chính</h4>
                {initialData.main_image ? (
                  <Image
                    width={200}
                    src={initialData.main_image}
                    alt="Ảnh chính"
                  />
                ) : (
                  <div className="text-gray-400">Không có ảnh chính</div>
                )}
              </div>
              <div>
                <h4 className="font-medium mb-2">Ảnh phụ</h4>
                {initialData.additional_images &&
                  initialData.additional_images.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {initialData.additional_images.map((img, index) => (
                      <Image
                        key={index}
                        width={100}
                        src={img}
                        alt={`Ảnh phụ ${index + 1}`}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400">Không có ảnh phụ</div>
                )}
              </div>
            </div>
            <div>
              <span className="mt-4 text-base font-bold"> Mô tả sản phẩm</span>
              <div
                className="prose max-w-full"
                dangerouslySetInnerHTML={{
                  __html: initialData.description || "Không có mô tả",
                }}
              ></div>
            </div>
          </TabPane>

          <TabPane tab="Thông số sản phẩm" key="3">
            <div>
              <span className="mt-2 text-base font-bold">Thông số sản phẩm</span>
              <div
                className="prose max-w-full"
                dangerouslySetInnerHTML={{
                  __html: initialData.specifications || "Không có mô tả",
                }}
              ></div>
            </div>
          </TabPane>
        </Tabs>
      </Modal>
        <TraceProductAddModal
          open={showTraceProductModal}
          onClose={() => setShowTraceProductModal(false)}
          productData={initialData}
          isEditing={initialData.isTraceVerified}
        />
        <TraceProductDetailModal
          open={showTraceDetailModal}
          onClose={() => setShowTraceDetailModal(false)}
          productData={initialData}
        />
      </>

    );
  }

  return (

    <Modal
      title={
        <span className="text-xl font-bold">
          {isEditing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
        </span>
      }
      open={isOpen}
      onCancel={handleCancel}
      footer={[
        <Button key="back" onClick={handleCancel}>
          Hủy
        </Button>,
        !isReadOnly && (
          <Button key="submit" type="primary" onClick={handleSubmit}>
            {isEditing ? "Cập nhật" : "Thêm mới"}
          </Button>
        ),
      ]}
      width={1000}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: "active",
          price: 0,
          original_price: 0,
        }}
        disabled={isReadOnly}
      >
        <Tabs defaultActiveKey="1">
          <TabPane tab="Thông tin chung" key="1">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="Tên sản phẩm"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập tên sản phẩm",
                    },
                  ]}
                >
                  <Input placeholder="Nhập tên sản phẩm" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="product_code" label="Mã sản phẩm">
                  <Input placeholder="Nhập mã sản phẩm (SKU)" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="price"
                  label="Giá bán"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập giá bán",
                    },
                  ]}
                >
                  <InputNumber
                    min={0}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                    style={{ width: "100%" }}
                    addonAfter="đ"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="original_price" label="Giá gốc">
                  <InputNumber
                    min={0}
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                    parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                    style={{ width: "100%" }}
                    addonAfter="đ"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="category_id" label="Danh mục sản phẩm">
                  <Select
                    mode="multiple"
                    placeholder="Chọn danh mục"
                    allowClear
                    style={{ width: "100%" }}
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    {renderCategoryOptions(categories)}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="tags" label="Tags">
                  <Input placeholder="Nhập tags, phân cách bằng dấu phẩy" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="status" label="Trạng thái">
                  <Select placeholder="Chọn trạng thái">
                    <Option value="active">Đang bán</Option>
                    <Option value="inactive">Tạm ngừng</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="weight" label="Trọng lượng (kg)">
                  <InputNumber
                    min={0}
                    step={0.1}
                    style={{ width: "100%" }}
                    addonAfter="kg"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="stock" label="Tồn kho">
                  <InputNumber
                    placeholder="Nhập tồn kho"
                    min={0}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="colors" label="Màu">
                  <Select
                    mode="multiple"
                    placeholder="Chọn màu sắc">
                    {COLOR_OPTIONS.map((color) => (
                      <Option key={color.value} value={color.value}>
                        <span className="flex items-center gap-2">
                          <span
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: color.value }}
                          />
                          {color.label}
                        </span>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item label="Kích thước (cm)">
                  <Input.Group compact>
                    <Form.Item name={["dimensions", "length"]} noStyle>
                      <InputNumber
                        min={0}
                        style={{ width: "33%" }}
                        placeholder="Dài"
                      />
                    </Form.Item>
                    <Form.Item name={["dimensions", "width"]} noStyle>
                      <InputNumber
                        min={0}
                        style={{ width: "33%" }}
                        placeholder="Rộng"
                      />
                    </Form.Item>
                    <Form.Item name={["dimensions", "height"]} noStyle>
                      <InputNumber
                        min={0}
                        style={{ width: "34%" }}
                        placeholder="Cao"
                      />
                    </Form.Item>
                  </Input.Group>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="is_featured" valuePropName="checked" label=" ">
                  <Checkbox>Sản phẩm nổi bật</Checkbox>
                </Form.Item>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="Hình ảnh và mô tả" key="2">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="main_image"
                  label="Ảnh chính"
                  rules={[
                    {
                      required: !isEditing,
                      message: "Vui lòng tải lên ảnh chính",
                    },
                  ]}
                >
                  <Upload {...mainImageProps}>
                    {mainImageList.length >= 1 ? null : uploadButton}
                  </Upload>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="additional_images" label="Ảnh phụ">
                  <Upload {...additionalImageProps}>
                    {additionalImageList.length >= 5 ? null : uploadButton}
                  </Upload>
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item name="description" label="Mô tả sản phẩm">
                  <CKEditorWrapper>
                    <CKEditor
                      editor={ClassicEditor}
                      data={initialData?.description || ""}
                      onChange={(event, editor) => {
                        form.setFieldsValue({
                          description: editor.getData(),
                        });
                      }}
                      disabled={isReadOnly}
                    />
                  </CKEditorWrapper>
                </Form.Item>
              </Col>
            </Row>

            <Modal
              open={previewOpen}
              title="Xem trước hình ảnh"
              footer={null}
              onCancel={() => setPreviewOpen(false)}
            >
              <img
                alt="Xem trước"
                style={{ width: "100%" }}
                src={previewImage}
              />
            </Modal>
          </TabPane>

          <TabPane tab="Thông số sản phẩm" key="3">
            <Row>
              <Col span={24}>
                <Form.Item
                  name="specifications"
                  label="Mô tả thông số sản phẩm"
                >
                  <CKEditorWrapper>
                    <CKEditor
                      editor={ClassicEditor}
                      data={initialData?.specifications || ""}
                      onChange={(event, editor) => {
                        form.setFieldsValue({
                          specifications: editor.getData(),
                        });
                      }}
                      disabled={isReadOnly}
                    />
                  </CKEditorWrapper>
                </Form.Item>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Form>
    </Modal>
  );
};

export default ProductForm;
