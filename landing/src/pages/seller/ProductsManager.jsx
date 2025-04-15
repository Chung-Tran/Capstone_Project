import React, { useState } from "react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { MoveLeftIcon, MoveRightIcon } from "lucide-react";
import AddProduct from "./AddProduct";
import EditProduct from "./EditProduct";
import { useDispatch, useSelector } from "react-redux";
import productService from "../../services/product.service";
import { saveProductData } from "../../store/slices/shopSlice";
import { Modal, Descriptions, Image, Badge, Table } from "antd";

const ProductsManager = () => {
  const productData = useSelector((state) => state.shop.productInfo);
  const dispatch = useDispatch();
  // State cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  // State cho modal chi tiết
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  // State cho modal chỉnh sửa
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const productsPerPage = 5;

  // Tính toán phân trang
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const totalPages = productData ? Math.ceil(productData.length / productsPerPage) : 1;

  // Hàm xử lý chuyển trang
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Lấy danh sách sản phẩm
  const handleRefreshData = async () => {
    try {
      const response = await productService.getAllProducts();
      if (response.isSuccess) {
        const newData = response.data;
        dispatch(saveProductData(newData));
      }
    } catch (error) {
      console.error("Lỗi khi làm mới dữ liệu:", error);
    }
  };

  // Xem chi tiết sản phẩm
  const handleViewDetails = async (productId) => {
    try {
      const response = await productService.getProductById(productId);
      if (response.isSuccess) {
        setSelectedProduct(response.data);
        setIsDetailModalOpen(true);
      }
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
      Modal.error({
        title: "Lỗi",
        content: "Không thể tải thông tin sản phẩm. Vui lòng thử lại.",
      });
    }
  };

  // Mở modal chỉnh sửa
  const handleEditProduct = async (product) => {
    try {
      const response = await productService.getProductById(product._id);
      if (response.isSuccess) {
        setProductToEdit(response.data);
        setIsEditModalOpen(true);
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu sản phẩm để chỉnh sửa:", error);
      Modal.error({
        title: "Lỗi",
        content: "Không thể tải thông tin sản phẩm. Vui lòng thử lại.",
      });
    }
  };

  // Cột cho bảng biến thể
  const variantColumns = [
    {
      title: "Tên biến thể",
      dataIndex: "variants_name",
      key: "variants_name",
    },
    {
      title: "Thuộc tính",
      dataIndex: "attributes",
      key: "attributes",
      render: (attributes) =>
        attributes
          ? Object.entries(attributes)
              .map(([key, value]) => `${key}: ${value}`)
              .join(", ")
          : "-",
    },
    {
      title: "Số lượng tồn",
      dataIndex: "variants_stock_quantity",
      key: "variants_stock_quantity",
    },
  ];

  // Danh sách sản phẩm hiện tại
  const currentProducts = productData
    ? productData.slice(indexOfFirstProduct, indexOfLastProduct)
    : [];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý Sản phẩm</h1>
      </div>
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Thêm sản phẩm
        </button>
        <div className="">
          <input
            type="text"
            placeholder="Tìm kiếm đơn hàng..."
            className="border rounded-lg px-4 py-2"
          />
          <button className="bg-blue-500 text-white rounded-lg px-4 py-2 ml-2">
            Lọc
          </button>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Sản phẩm
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Mã sản phẩm
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Giá
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Kho
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentProducts.map((product) => (
              <tr key={product._id}>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <img
                      src={
                        product.main_image ||
                        "https://th.bing.com/th/id/OIP.LZcUizeVzEz5bmubW1kPygHaHa?w=177&h=180&c=7&r=0&o=5&dpr=1.1&pid=1.7"
                      }
                      alt={product.name}
                      className="w-20 h-20 rounded-lg mr-3"
                    />
                    <span>{product.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">{product.product_code}</td>
                <td className="px-6 py-4">{product.price.toLocaleString()}đ</td>
                <td className="px-6 py-4">{product.total_stock_quantity}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      product.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {product.status === "active" ? "Đang bán" : "Tạm ngừng"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewDetails(product._id)}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                    >
                      <EyeIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded">
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-700">
            Hiển thị {indexOfFirstProduct + 1} đến{" "}
            {Math.min(indexOfLastProduct, productData?.length || 0)} trong tổng số{" "}
            {productData?.length || 0} sản phẩm
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
          >
            <MoveLeftIcon className="w-5 h-5" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <span
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-4 py-1 border rounded-lg cursor-pointer ${
                currentPage === page ? "bg-blue-500 text-white" : "bg-white text-gray-700"
              }`}
            >
              {page}
            </span>
          ))}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
          >
            <MoveRightIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Modal Thêm Sản phẩm */}
      <AddProduct
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        refreshData={handleRefreshData}
      />

      {/* Modal Chỉnh sửa Sản phẩm */}
      {productToEdit && (
        <EditProduct
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setProductToEdit(null);
          }}
          refreshData={handleRefreshData}
          initialData={productToEdit}
        />
      )}

      {/* Modal Chi tiết Sản phẩm */}
      {selectedProduct && (
        <Modal
          title={<span className="text-xl font-bold">Chi tiết Sản phẩm</span>}
          open={isDetailModalOpen}
          onCancel={() => setIsDetailModalOpen(false)}
          footer={null}
          width={1000}
        >
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Tên sản phẩm">
              {selectedProduct.name}
            </Descriptions.Item>
            <Descriptions.Item label="Mã sản phẩm">
              {selectedProduct.product_code}
            </Descriptions.Item>
            <Descriptions.Item label="Giá bán">
              {selectedProduct.price.toLocaleString()}đ
            </Descriptions.Item>
            <Descriptions.Item label="Giá gốc">
              {selectedProduct.original_price
                ? selectedProduct.original_price.toLocaleString() + "đ"
                : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Tổng số lượng tồn">
              {selectedProduct.total_stock_quantity}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Badge
                status={selectedProduct.status === "active" ? "success" : "default"}
                text={selectedProduct.status === "active" ? "Đang bán" : "Tạm ngừng"}
              />
            </Descriptions.Item>
            <Descriptions.Item label="Danh mục">
              {selectedProduct.category_id && selectedProduct.category_id.length > 0
                ? selectedProduct.category_id.map((cat) => cat.name).join(", ")
                : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Tags">
              {selectedProduct.tags && selectedProduct.tags.length > 0
                ? selectedProduct.tags.join(", ")
                : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Trọng lượng">
              {selectedProduct.weight ? selectedProduct.weight + " kg" : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Kích thước">
              {selectedProduct.dimensions &&
              selectedProduct.dimensions.length &&
              selectedProduct.dimensions.width &&
              selectedProduct.dimensions.height
                ? `${selectedProduct.dimensions.length} x ${selectedProduct.dimensions.width} x ${selectedProduct.dimensions.height} cm`
                : "-"}
            </Descriptions.Item>
            
            <Descriptions.Item label="Mô tả">
              <div
                dangerouslySetInnerHTML={{ __html: selectedProduct.description || "-" }}
              />
            </Descriptions.Item>
          </Descriptions>

          {selectedProduct.variants && selectedProduct.variants.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold">Biến thể</h3>
              <Table
                columns={variantColumns}
                dataSource={selectedProduct.variants}
                rowKey={(record) => record.variants_name}
                pagination={false}
                bordered
              />
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};

export default ProductsManager;