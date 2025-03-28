import React, { useState } from 'react';
import { CameraIcon } from '@heroicons/react/24/outline';

const ShopManagement = () => {
    const [shopInfo, setShopInfo] = useState({
        name: 'Shop Demo',
        description: 'Mô tả về shop của bạn',
        address: '123 Đường ABC, Quận XYZ, TP.HCM',
        phone: '0123456789',
        email: 'shop@example.com',
        logo: 'https://via.placeholder.com/150',
        banner: 'https://via.placeholder.com/1200x300'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        // Xử lý cập nhật thông tin shop
        console.log('Updated shop info:', shopInfo);
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Quản lý Shop</h1>

            <div className="bg-white rounded-lg shadow p-6">
                <form onSubmit={handleSubmit}>
                    {/* Banner và Logo */}
                    <div className="mb-6">
                        <div className="relative h-48 bg-gray-100 rounded-lg mb-4">
                            <img
                                src={shopInfo.banner}
                                alt="Shop banner"
                                className="w-full h-full object-cover rounded-lg"
                            />
                            <button className="absolute bottom-4 right-4 bg-white p-2 rounded-full shadow">
                                <CameraIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="relative w-32 h-32 mx-auto -mt-16 mb-4">
                            <img
                                src={shopInfo.logo}
                                alt="Shop logo"
                                className="w-full h-full object-cover rounded-full border-4 border-white shadow"
                            />
                            <button className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow">
                                <CameraIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Thông tin cơ bản */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tên shop
                            </label>
                            <input
                                type="text"
                                value={shopInfo.name}
                                onChange={(e) => setShopInfo({ ...shopInfo, name: e.target.value })}
                                className="w-full border rounded-lg px-4 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={shopInfo.email}
                                onChange={(e) => setShopInfo({ ...shopInfo, email: e.target.value })}
                                className="w-full border rounded-lg px-4 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Số điện thoại
                            </label>
                            <input
                                type="tel"
                                value={shopInfo.phone}
                                onChange={(e) => setShopInfo({ ...shopInfo, phone: e.target.value })}
                                className="w-full border rounded-lg px-4 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Địa chỉ
                            </label>
                            <input
                                type="text"
                                value={shopInfo.address}
                                onChange={(e) => setShopInfo({ ...shopInfo, address: e.target.value })}
                                className="w-full border rounded-lg px-4 py-2"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mô tả shop
                            </label>
                            <textarea
                                value={shopInfo.description}
                                onChange={(e) => setShopInfo({ ...shopInfo, description: e.target.value })}
                                rows="4"
                                className="w-full border rounded-lg px-4 py-2"
                            />
                        </div>
                    </div>

                    {/* Nút lưu */}
                    <div className="mt-6 flex justify-end">
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            Lưu thay đổi
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ShopManagement; 