import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { MoveLeftIcon, MoveRightIcon } from "lucide-react";
import ProductForm from "./ProductForm"; // Renamed from AddProduct to a more generic name
import { useDispatch, useSelector } from "react-redux";
import productService from "../../services/product.service";
import { saveProductData } from "../../store/slices/shopSlice";
import { Modal, Table, message } from "antd";
import { showToast } from "../../utils/toast";
const ProductsManager = () => {
  const [modal, contextHolder] = Modal.useModal();
  const productData = useSelector((state) => state.shop.productInfo);
  const dispatch = useDispatch();

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 5;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'view'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  // Pagination calculations
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const totalPages = productData ? Math.ceil(productData.length / productsPerPage) : 1;

  // Filtered products based on search
  const filteredProducts = productData ?
    productData.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.product_code && product.product_code.toLowerCase().includes(searchTerm.toLowerCase()))
    ) : [];

  // Current page products
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const fetchProducts = async () => {
    try {
      const response = await productService.getAllProducts();
      if (response.isSuccess) {
        dispatch(saveProductData(response.data));
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      message.error("Không thể tải danh sách sản phẩm");
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleProductAction = async (productId, action) => {
    try {
      const response = await productService.getProductById(productId);
      if (response.isSuccess) {
        setSelectedProduct(response.data);
        setModalMode(action);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error(`Error fetching product details for ${action}:`, error);
      message.error("Không thể tải thông tin sản phẩm. Vui lòng thử lại.");
    }
  };

  const handleDeleteProduct = async (productId) => {
    modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa sản phẩm này?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          const response = await productService.product_delete(productId);
          if (response.isSuccess) {
            showToast.success("Xóa sản phẩm thành công");
            fetchProducts();
          }
        } catch (error) {
          showToast.error(error.message || "Xóa sản phẩm thất bại");
          console.error("Error deleting product:", error);
        }
      }
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Reset to first page when searching
    setCurrentPage(1);
  };

  return (
    <div className="p-4">
      {contextHolder} {/*context để hiển thị modal confirm */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý Sản phẩm</h1>
      </div>

      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => {
            setModalMode('add');
            setIsModalOpen(true);
          }}
          className="flex px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Thêm sản phẩm
        </button>

        <form onSubmit={handleSearch} className="flex">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm sản phẩm..."
            className="border rounded-lg px-4 py-2"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white rounded-lg px-4 py-2 ml-2 hover:bg-blue-600 transition"
          >
            Lọc
          </button>
        </form>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sản phẩm
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên sản phẩm
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Giá
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kho
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentProducts.length > 0 ? (
              currentProducts.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={product.main_image || "/placeholder-product.png"}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg mr-3"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/placeholder-product.png";
                        }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.name || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.price?.toLocaleString() || 0}đ
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.stock || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${product.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                        }`}
                    >
                      {product.status === "active" ? "Đang bán" : "Tạm ngừng"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleProductAction(product._id, 'view')}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded transition"
                        title="Xem chi tiết"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleProductAction(product._id, 'edit')}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded transition"
                        title="Chỉnh sửa"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded transition"
                        title="Xóa"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  {searchTerm ? "Không tìm thấy sản phẩm nào phù hợp" : "Chưa có sản phẩm nào"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredProducts.length > 0 && (
        <div className="mt-4 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-700">
              Hiển thị {indexOfFirstProduct + 1} đến{" "}
              {Math.min(indexOfLastProduct, filteredProducts.length)} trong tổng số{" "}
              {filteredProducts.length} sản phẩm
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded ${currentPage === 1
                ? "text-gray-400 cursor-not-allowed"
                : "text-blue-600 hover:bg-blue-50"
                }`}
            >
              <MoveLeftIcon className="w-5 h-5" />
            </button>

            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              // Show pages around current page
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-4 py-1 border rounded-lg cursor-pointer ${currentPage === pageNum ? "bg-blue-500 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded ${currentPage === totalPages
                ? "text-gray-400 cursor-not-allowed"
                : "text-blue-600 hover:bg-blue-50"
                }`}
            >
              <MoveRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Shared Product Form Modal - handles Add, Edit, View modes */}
      <ProductForm
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        refreshData={fetchProducts}
        initialData={selectedProduct}
        mode={modalMode}
      />
    </div>
  );
};

export default ProductsManager;