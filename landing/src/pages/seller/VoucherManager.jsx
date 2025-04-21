import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { MoveLeftIcon, MoveRightIcon } from "lucide-react";
import VoucherForm from "./VoucherForm";
import { useDispatch, useSelector } from "react-redux";
import voucherService from "../../services/voucher.service";
import {
  fetchVouchersStart,
  fetchVouchersSuccess,
  fetchVouchersFailure,
  setSelectedVoucher,
} from "../../store/slices/voucherSlice";
import { Modal, message } from "antd";
import { showToast } from "../../utils/toast";

const VoucherManager = () => {
  const [modal, contextHolder] = Modal.useModal();
  const voucherData = useSelector((state) => state.vouchers?.vouchers || []); // Thêm kiểm tra an toàn
  const dispatch = useDispatch();

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const vouchersPerPage = 5;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add', 'edit', 'view'
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchVouchers();
  }, []);

  // Pagination calculations
  const indexOfLastVoucher = currentPage * vouchersPerPage;
  const indexOfFirstVoucher = indexOfLastVoucher - vouchersPerPage;
  const totalPages = voucherData
    ? Math.ceil(voucherData.length / vouchersPerPage)
    : 1;

  // Filtered vouchers based on search
  const filteredVouchers = voucherData
    ? voucherData.filter(
        (voucher) =>
          voucher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          voucher.promotion_code
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      )
    : [];

  // Current page vouchers
  const currentVouchers = filteredVouchers.slice(
    indexOfFirstVoucher,
    indexOfLastVoucher
  );

  const fetchVouchers = async () => {
    try {
      dispatch(fetchVouchersStart());
      const response = await voucherService.getAllVouchers();
      if (response.isSuccess) {
        dispatch(fetchVouchersSuccess(response.data));
      }
    } catch (error) {
      dispatch(fetchVouchersFailure(error.message));
      message.error("Không thể tải danh sách voucher");
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleVoucherAction = async (voucherId, action) => {
    try {
      const response = await voucherService.getVoucherById(voucherId);
      console.log(response)
      if (response.isSuccess) {
        // dispatch(setSelectedVoucher(response.data));
        setSelectedVoucher(response.data);
        setModalMode(action);
        setIsModalOpen(true);
      }
    } catch (error) {
      message.error("Không thể tải thông tin voucher. Vui lòng thử lại.");
    }
  };

  const handleDeleteVoucher = async (voucherId) => {
    modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa voucher này?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          const response = await voucherService.voucher_delete(voucherId);
          if (response.isSuccess) {
            showToast.success("Xóa voucher thành công");
            fetchVouchers();
          }
        } catch (error) {
          showToast.error(error.message || "Xóa voucher thất bại");
        }
      },
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVoucher(null);
    // dispatch(setSelectedVoucher(null));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  return (
    <div className="p-4">
      {contextHolder}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý Voucher</h1>
      </div>

      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => {
            setModalMode("add");
            setIsModalOpen(true);
          }}
          className="flex px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Thêm voucher
        </button>

        <form onSubmit={handleSearch} className="flex">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm voucher..."
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

      {/* Voucher Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mã voucher
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên voucher
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Giảm giá
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thời hạn
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
            {currentVouchers.length > 0 ? (
              currentVouchers.map((voucher) => (
                <tr key={voucher._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {voucher.promotion_code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {voucher.name || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {voucher.discount_type === "percentage"
                      ? `${voucher.discount_value}%`
                      : `${voucher.discount_value.toLocaleString()}đ`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {voucher.start_date
                      ? new Date(voucher.start_date).toLocaleDateString()
                      : "-"}
                    {" - "}
                    {voucher.end_date
                      ? new Date(voucher.end_date).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        voucher.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {voucher.status === "active" ? "Hoạt động" : "Không hoạt động"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleVoucherAction(voucher._id, "view")}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded transition"
                        title="Xem chi tiết"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleVoucherAction(voucher._id, "edit")}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded transition"
                        title="Chỉnh sửa"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteVoucher(voucher._id)}
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
                  {searchTerm
                    ? "Không tìm thấy voucher nào phù hợp"
                    : "Chưa có voucher nào"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredVouchers.length > 0 && (
        <div className="mt-4 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-700">
              Hiển thị {indexOfFirstVoucher + 1} đến{" "}
              {Math.min(indexOfLastVoucher, filteredVouchers.length)} trong tổng số{" "}
              {filteredVouchers.length} voucher
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded ${
                currentPage === 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-blue-600 hover:bg-blue-50"
              }`}
            >
              <MoveLeftIcon className="w-5 h-5" />
            </button>

            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
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
                  className={`px-4 py-1 border rounded-lg cursor-pointer ${
                    currentPage === pageNum
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded ${
                currentPage === totalPages
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-blue-600 hover:bg-blue-50"
              }`}
            >
              <MoveRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Shared Voucher Form Modal */}
      <VoucherForm
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        refreshData={fetchVouchers}
        initialData={selectedVoucher}
        mode={modalMode}
      />
    </div>
  );
};

export default VoucherManager;