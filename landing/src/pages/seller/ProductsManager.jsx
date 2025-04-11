import React, { useState } from "react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { MoveLeftIcon, MoveRightIcon } from "lucide-react";
import AddProduct from "./AddProduct";
import { useDispatch, useSelector } from "react-redux";
import productService from "../../services/product.service";
import { saveProductData } from "../../store/slices/shopSlice";

const ProductsManager = () => {
  const productData = useSelector((state) => state.shop.productInfo);
  const dispatch = useDispatch()
  // Thêm state cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const productsPerPage = 5; // Số sản phẩm mỗi trang

  // Tính toán các giá trị phân trang
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const totalPages = 10;

  // Hàm xử lý chuyển trang
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  const handleRefreshData = async () => {
    const response = await productService.getAllProducts();
    if (response.isSuccess) {
      const newData = response.data;
      dispatch(saveProductData(newData))
    }

  }
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý Sản phẩm</h1>
      </div>
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex  px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
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
          <button className="bg-blue-500 text-white rounded-lg px-4 py-2">
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
                Nổi Bật
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {productData?.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <img
                      src="https://th.bing.com/th/id/OIP.LZcUizeVzEz5bmubW1kPygHaHa?w=177&h=180&c=7&r=0&o=5&dpr=1.1&pid=1.7"
                      alt={product.name}
                      className="w-20 h-20 rounded-lg mr-3"
                    />
                    <span>{product.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">{product.product_code}</td>
                <td className="px-6 py-4">{product.price.toLocaleString()}đ</td>
                <td className="px-6 py-4">{product.stock_quantity}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${product.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                      }`}
                  >
                    {product.status === "active" ? "Đang bán" : "Tạm ngừng"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={product.featured}

                    className="w-5 h-5 accent-blue-500"
                  />
                </td>

                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-600 hover:bg-gray-50 rounded">
                      <EyeIcon className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
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
          {/* <p className="text-sm text-gray-700">
            Hiển thị {indexOfFirstProduct + 1} đến{" "}
            {Math.min(indexOfLastProduct, products.length)} trong tổng số{" "}
            {products.length} sản phẩm
          </p> */}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
          >
            <MoveLeftIcon className=" w-5 h-5" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <span
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-4 py-1 border rounded-lg ${currentPage === page ? " text-black" : "bg-white text-gray-700"
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
      <AddProduct
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        refreshData={handleRefreshData}
      />
    </div>
  );
};

export default ProductsManager;
