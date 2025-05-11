import React from 'react';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PaymentResult = ({ paymentData }) => {
    const navigate = useNavigate();

    if (!paymentData) return null;

    const isSuccess = paymentData.status === 'success' || paymentData.status === 'completed';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                <div className="text-center">
                    {isSuccess ? (
                        <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
                    ) : (
                        <XCircle className="mx-auto text-red-500 mb-4" size={64} />
                    )}

                    <h2 className="text-2xl font-bold mb-2">
                        {isSuccess ? 'Thanh toán thành công' : 'Thanh toán thất bại'}
                    </h2>

                    <p className="text-gray-600 mb-6">
                        {isSuccess
                            ? 'Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đã được xác nhận.'
                            : 'Đã xảy ra lỗi trong quá trình thanh toán. Vui lòng thử lại sau.'}
                    </p>

                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <div className="flex justify-between mb-2">
                            <span className="text-gray-600">Mã đơn hàng:</span>
                            <span className="font-medium">{paymentData.orderId}</span>
                        </div>
                        {paymentData.transactionId && (
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-600">Mã giao dịch:</span>
                                <span className="font-medium">{paymentData.transactionId}</span>
                            </div>
                        )}
                        <div className="flex justify-between mb-2">
                            <span className="text-gray-600">Phương thức:</span>
                            <span className="font-medium">{paymentData.payment_method === 'online' ? 'Thanh toán trực tuyến' : 'COD'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Số tiền:</span>
                            <span className="font-bold text-indigo-600">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(paymentData.amount)}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => navigate('/')}
                            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center"
                        >
                            Quay về trang chủ
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentResult;