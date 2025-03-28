import React, { useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const Products = () => {
    const [products, setProducts] = useState([
        {
            id: 1,
            name: 'Sản phẩm mẫu 1',
            price: 199000,
            stock: 50,
            status: 'active',
            image: 'https://via.placeholder.com/150',
        },
        // Thêm sản phẩm mẫu khác
    ]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Quản lý Sản phẩm</h1>
                <button className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Thêm sản phẩm
                </button>
            </div>

            {/* Product Table */}
            <div className="bg-white rounded-lg shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sản phẩm</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kho</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {products.map((product) => (
                            <tr key={product.id}>
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg mr-3" />
                                        <span>{product.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">{product.price.toLocaleString()}đ</td>
                                <td className="px-6 py-4">{product.stock}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs ${product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {product.status === 'active' ? 'Đang bán' : 'Tạm ngừng'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex space-x-2">
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
        </div>
    );
};

export default Products; 