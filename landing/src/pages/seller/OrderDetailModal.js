import React, { useEffect, useState } from 'react';
import { XCircleIcon } from '@heroicons/react/24/outline';
import orderService from '../../services/order.service';

const OrderDetailModal = ({ isOpen, onClose, orderId }) => {
  const [orderDetail, setOrderDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetail();
    }
  }, [isOpen, orderId]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await orderService.get_order_by_id(orderId);
      setOrderDetail(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching order details:', error.message);
      setError('Không thể tải thông tin chi tiết đơn hàng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getStatusBadge = (status) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-green-100 text-green-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };

    const statusLabels = {
      pending: 'Chờ xử lý',
      processing: 'Đang xử lý',
      shipped: 'Đã giao',
      delivered: 'Đã giao hàng',
      cancelled: 'Đã hủy'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm ${statusStyles[status]}`}>
        {statusLabels[status]}
      </span>
    );
  };

  const getPaymentStatusBadge = (status) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800',
      success: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };

    const statusLabels = {
      pending: 'Chờ thanh toán',
      success: 'Đã thanh toán',
      failed: 'Thanh toán thất bại'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm ${statusStyles[status]}`}>
        {statusLabels[status]}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Chi tiết đơn hàng</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>

        {loading && (
          <div className="p-6 text-center">
            <p>Đang tải thông tin đơn hàng...</p>
          </div>
        )}

        {error && (
          <div className="p-6 text-center">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {!loading && !error && orderDetail && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Thông tin đơn hàng</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="mb-2">
                    <span className="font-medium">Mã đơn hàng:</span> {orderDetail.order_code}
                  </div>
                  <div className="mb-2">
                    <span className="font-medium">Ngày đặt:</span> {new Date(orderDetail.created_at).toLocaleDateString('vi-VN')}
                  </div>
                  <div className="mb-2">
                    <span className="font-medium">Trạng thái đơn hàng:</span> {getStatusBadge(orderDetail.status)}
                  </div>
                  <div className="mb-2">
                    <span className="font-medium">Trạng thái thanh toán:</span> {getPaymentStatusBadge(orderDetail.payment_status)}
                  </div>
                  <div className="mb-2">
                    <span className="font-medium">Phương thức thanh toán:</span> {orderDetail.payment_method}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Thông tin người nhận</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="mb-2">
                    <span className="font-medium">Họ tên:</span> {orderDetail.receiverName}
                  </div>
                  <div className="mb-2">
                    <span className="font-medium">Số điện thoại:</span> {orderDetail.receiverPhone}
                  </div>
                  <div className="mb-2">
                    <span className="font-medium">Địa chỉ giao hàng:</span> {orderDetail.address}
                  </div>
                  <div>
                    <span className="font-medium">Ghi chú:</span> {orderDetail.notes || 'Không có'}
                  </div>
                </div>
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-4">Chi tiết sản phẩm</h3>
            {orderDetail.items && orderDetail.items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sản phẩm</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đơn giá</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số lượng</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orderDetail.items.map((item) => (
                      <tr key={item._id}>
                        <td className="px-6 py-4">{item.product_id.name}</td>
                        <td className="px-6 py-4">{item.unit_price.toLocaleString()}đ</td>
                        <td className="px-6 py-4">{item.quantity}</td>
                        <td className="px-6 py-4">{item.total_price.toLocaleString()}đ</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center py-4">Không có thông tin sản phẩm.</p>
            )}

            <div className="mt-6 border-t pt-4">
              <div className="flex justify-between mb-2">
                <span>Tổng tiền hàng:</span>
                <span>{orderDetail.subtotal?.toLocaleString()}đ</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Phí vận chuyển:</span>
                <span>{orderDetail.shipping_fee?.toLocaleString()}đ</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Thuế:</span>
                <span>{orderDetail.tax_amount?.toLocaleString()}đ</span>
              </div>
              {orderDetail.discount_amount > 0 && (
                <div className="flex justify-between mb-2">
                  <span>Giảm giá:</span>
                  <span>-{orderDetail.discount_amount?.toLocaleString()}đ</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
                <span>Tổng thanh toán:</span>
                <span>{orderDetail.total_amount?.toLocaleString()}đ</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailModal;