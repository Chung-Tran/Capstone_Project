import React, { useState } from 'react';
import { EyeIcon, TruckIcon } from '@heroicons/react/24/outline';

const Orders = () => {
    const [orders] = useState([
        {
            id: '#ORD001',
            customer: 'Nguyễn Văn A',
            date: '2024-03-20',
            total: 1250000,
            status: 'pending',
            items: 3
        },
        {
            id: '#ORD002',
            customer: 'Trần Thị B',
            date: '2024-03-19',
            total: 850000,
            status: 'processing',
            items: 2
        },
        // Thêm đơn hàng mẫu khác
    ]);

    const getStatusBadge = (status) => {
        const statusStyles = {
            pending: 'bg-yellow-100 text-yellow-800',
            processing: 'bg-blue-100 text-blue-800',
            shipped: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };

        const statusLabels = {
            pending: 'Chờ xử lý',
            processing: 'Đang xử lý',
            shipped: 'Đã giao',
            cancelled: 'Đã hủy'
        };

        return (
            <span className={`px-3 py-1 rounded-full text-sm ${statusStyles[status]}`}>
                {statusLabels[status]}
            </span>
        );
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Quản lý Đơn hàng</h1>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="grid grid-cols-4 gap-4">
                    <input
                        type="text"
                        placeholder="Tìm kiếm đơn hàng..."
                        className="border rounded-lg px-4 py-2"
                    />
                    <select className="border rounded-lg px-4 py-2">
                        <option value="">Tất cả trạng thái</option>
                        <option value="pending">Chờ xử lý</option>
                        <option value="processing">Đang xử lý</option>
                        <option value="shipped">Đã giao</option>
                        <option value="cancelled">Đã hủy</option>
                    </select>
                    <input
                        type="date"
                        className="border rounded-lg px-4 py-2"
                    />
                    <button className="bg-blue-500 text-white rounded-lg px-4 py-2">
                        Lọc
                    </button>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã đơn</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách hàng</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày đặt</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng tiền</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                            <tr key={order.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{order.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{order.customer}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{order.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {order.total.toLocaleString()}đ
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getStatusBadge(order.status)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex space-x-2">
                                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                                            <EyeIcon className="w-5 h-5" />
                                        </button>
                                        <button className="p-2 text-green-600 hover:bg-green-50 rounded">
                                            <TruckIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Orders; 