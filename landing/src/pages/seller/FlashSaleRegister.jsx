import React, { useState, useEffect } from "react";
import { Clock, Plus, Trash, ChevronLeft, ChevronRight, Calendar, Tag, Percent } from "lucide-react";
import FlashSaleForm from "./FlashSaleForm";
import { useDispatch, useSelector } from "react-redux";
import flashSaleService from "../../services/flashSale.service";
import {
  fetchRegistrationsStart,
  fetchRegistrationsSuccess,
  fetchRegistrationsFailure,
} from "../../store/slices/flashSaleSlice";
import { Modal, message } from "antd";
import { useParams } from "react-router-dom";

const FlashSaleRegister = () => {
  const { flashSaleId } = useParams();
  const [modal, contextHolder] = Modal.useModal();
  const registrations = useSelector((state) => state.flashSales?.registrations || []);
  const loading = useSelector((state) => state.flashSales?.loading);
  const dispatch = useDispatch();

  const [currentPage, setCurrentPage] = useState(1);
  const registrationsPerPage = 6;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);

  useEffect(() => {
    fetchRegistrations();
  }, [dispatch, flashSaleId]);

  const fetchRegistrations = async () => {
    try {
      dispatch(fetchRegistrationsStart());
      const response = await flashSaleService.getFlashSaleRegistrations(flashSaleId);
      dispatch(fetchRegistrationsSuccess(response.data));
    } catch (error) {
      dispatch(fetchRegistrationsFailure(error.message));
      message.error("Không thể tải danh sách flash sale");
    }
  };

  const handleOpenModal = (sale = null) => {
    setSelectedSale(sale);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSale(null);
    fetchRegistrations();
  };

  const handleDeleteRegistration = async (id) => {
    modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa đăng ký flash sale này?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await flashSaleService.deleteFlashSaleRegistration(id);
          message.success("Xóa đăng ký flash sale thành công");
          fetchRegistrations();
        } catch (error) {
          message.error("Không thể xóa đăng ký flash sale");
        }
      }
    });
  };

  // Phân trang
  const indexOfLastRegistration = currentPage * registrationsPerPage;
  const indexOfFirstRegistration = indexOfLastRegistration - registrationsPerPage;
  const currentRegistrations = registrations.slice(indexOfFirstRegistration, indexOfLastRegistration);

  const totalPages = Math.ceil(registrations.length / registrationsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Định dạng ngày giờ
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Tính thời gian còn lại
  const getTimeRemaining = (startDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const diff = start - now;
    
    if (diff <= 0) return "Đang diễn ra";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} ngày ${hours} giờ`;
    return `${hours} giờ`;
  };

  // Status badge
  const StatusBadge = ({ startDate, endDate }) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    let status, bgColor;
    
    if (now < start) {
      status = "Sắp diễn ra";
      bgColor = "bg-blue-100 text-blue-800";
    } else if (now >= start && now <= end) {
      status = "Đang diễn ra";
      bgColor = "bg-green-100 text-green-800";
    } else {
      status = "Đã kết thúc";
      bgColor = "bg-gray-100 text-gray-800";
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
        {status}
      </span>
    );
  };

  // Dữ liệu mẫu
  const mockFlashSales = [
    {
      id: 1,
      name: "Flash Sale Tết 2025",
      startDate: "2025-01-20T08:00:00",
      endDate: "2025-01-20T23:59:59",
      discountPercent: 50,
      productCount: 120
    },
    {
      id: 2,
      name: "Sale Cuối Tuần",
      startDate: "2025-04-26T00:00:00",
      endDate: "2025-04-27T23:59:59",
      discountPercent: 30,
      productCount: 75
    },
    {
      id: 3,
      name: "Flash Sale Hè 2025",
      startDate: "2025-05-15T09:00:00",
      endDate: "2025-05-15T21:00:00",
      discountPercent: 40,
      productCount: 200
    },
    {
      id: 4,
      name: "Sale Nửa Đêm",
      startDate: "2025-05-01T00:00:00",
      endDate: "2025-05-01T06:00:00",
      discountPercent: 60,
      productCount: 50
    },
    {
      id: 5,
      name: "Flash Sale Kỷ Niệm",
      startDate: "2025-06-01T10:00:00",
      endDate: "2025-06-01T22:00:00",
      discountPercent: 45,
      productCount: 150
    },
    {
      id: 6,
      name: "Sale Ngày Lễ",
      startDate: "2025-04-30T08:00:00",
      endDate: "2025-05-01T23:59:59",
      discountPercent: 35,
      productCount: 100
    },
    {
      id: 7,
      name: "Flash Sale Giữa Tuần",
      startDate: "2025-04-23T12:00:00",
      endDate: "2025-04-23T18:00:00",
      discountPercent: 25,
      productCount: 85
    }
  ];

  // Sử dụng dữ liệu mẫu thay vì registrations
  const displayData = mockFlashSales.slice(indexOfFirstRegistration, indexOfLastRegistration);
  const totalMockPages = Math.ceil(mockFlashSales.length / registrationsPerPage);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {contextHolder}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Danh Sách Flash Sale</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg"
        >
          <Plus size={20} className="mr-2" />
          Thêm Flash Sale
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayData.map((sale) => (
              <div 
                key={sale.id} 
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 overflow-hidden cursor-pointer"
                onClick={() => handleOpenModal(sale)}
              >
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">{sale.name}</h3>
                    <StatusBadge startDate={sale.startDate} endDate={sale.endDate} />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <Calendar size={16} className="mr-2 text-blue-500" />
                      <span>Bắt đầu: {formatDateTime(sale.startDate)}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar size={16} className="mr-2 text-red-500" />
                      <span>Kết thúc: {formatDateTime(sale.endDate)}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Clock size={18} className="mr-2 text-orange-500" />
                      <span className="font-medium">{getTimeRemaining(sale.startDate)}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center">
                      <Percent size={16} className="mr-1 text-green-600" />
                      <span className="font-medium text-green-600">{sale.discountPercent}%</span>
                    </div>
                    <div className="flex items-center">
                      <Tag size={16} className="mr-1 text-purple-600" />
                      <span className="font-medium text-purple-600">{sale.productCount} sản phẩm</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-5 py-3 flex justify-end">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteRegistration(sale.id);
                    }}
                    className="text-red-600 hover:text-red-800 flex items-center text-sm"
                  >
                    <Trash size={16} className="mr-1" />
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Phân trang */}
          {totalMockPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex items-center space-x-2">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-md border ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="px-4 py-2 text-gray-700">
                  Trang {currentPage}/{totalMockPages}
                </div>
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalMockPages}
                  className={`p-2 rounded-md border ${
                    currentPage === totalMockPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <FlashSaleForm
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        flashSaleId={flashSaleId}
        selectedSale={selectedSale}
      />
    </div>
  );
};

export default FlashSaleRegister;