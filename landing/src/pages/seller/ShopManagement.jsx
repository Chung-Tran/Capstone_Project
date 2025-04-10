import React, { useEffect, useState } from 'react';
import { CameraIcon } from '@heroicons/react/24/outline';
import authService from '../../services/auth.service';
import { useSelector, useDispatch } from 'react-redux';
import { saveShopData } from '../../store/slices/shopSlice';
import shopService from '../../services/shop.service';
import { showToast } from '../../utils/toast';

const ShopManagement = () => {
    const dispatch = useDispatch();
    const shopInfo = useSelector((state) => state.shop.shopInfo);
    const [dataUpdate, setDataUpdate] = useState(shopInfo);
    useEffect(() => {
        setDataUpdate(shopInfo);
    }, [shopInfo]);
    const [previewBanner, setPreviewBanner] = useState(shopInfo?.store_banner);
    const [previewLogo, setPreviewLogo] = useState(shopInfo?.store_logo);
    const [bannerFile, setBannerFile] = useState(null);
    const [logoFile, setLogoFile] = useState(null);

    // Xử lý upload ảnh bìa
    const handleBannerChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBannerFile(file);
            setPreviewBanner(URL.createObjectURL(file));
        }
    };

    // Xử lý upload logo
    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            setPreviewLogo(URL.createObjectURL(file));
        }
    };

    // Xử lý submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            dispatch({ type: 'shop/setLoading', payload: true });
            // Thêm các file ảnh nếu có
            if (bannerFile) {
                formData.append('store_banner', bannerFile);
            }
            if (logoFile) {
                formData.append('store_logo', logoFile);
            }

            // Thêm các thông tin khác
            Object.keys(dataUpdate).forEach(key => {
                if (key !== 'store_banner' && key !== 'store_logo') {
                    formData.append(key, dataUpdate[key]);
                }
            });

            const response = await shopService.update_shop_info(formData);
            if (response.isSuccess) {
                dispatch(saveShopData(response.data));
                // Reset file states
                setBannerFile(null);
                setLogoFile(null);
                showToast.success('Cập nhật thông tin shop thành công');
            }
        } catch (error) {
            console.error('Failed to update shop info:', error);
        } finally {
            dispatch({ type: 'shop/setLoading', payload: false });
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Quản lý Shop</h1>

            <div className="bg-white rounded-lg shadow p-6">
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <div className="relative h-48 bg-gray-100 rounded-lg mb-4">
                            <img
                                src={previewBanner || shopInfo?.store_banner}
                                alt="Shop banner"
                                className="w-full h-full object-cover rounded-lg"
                            />
                            <label className="absolute bottom-4 right-4 bg-white p-2 rounded-full shadow cursor-pointer">
                                <CameraIcon className="w-5 h-5" />
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleBannerChange}
                                />
                            </label>
                        </div>
                        <div className="relative w-32 h-32 mx-auto -mt-16 mb-4">
                            <img
                                src={previewLogo || shopInfo?.store_logo}
                                alt="Shop logo"
                                className="w-full h-full object-cover rounded-full border-4 border-white shadow"
                            />
                            <label className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow cursor-pointer">
                                <CameraIcon className="w-5 h-5" />
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                />
                            </label>
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
                                value={shopInfo?.store_name}
                                onChange={(e) => setDataUpdate({ ...shopInfo, store_name: e.target.value })}
                                className="w-full border rounded-lg px-4 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={shopInfo?.contact_email}
                                onChange={(e) => setDataUpdate({ ...shopInfo, contact_email: e.target.value })}
                                className="w-full border rounded-lg px-4 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Số điện thoại
                            </label>
                            <input
                                type="tel"
                                value={shopInfo?.contact_phone}
                                onChange={(e) => setDataUpdate({ ...shopInfo, contact_phone: e.target.value })}
                                className="w-full border rounded-lg px-4 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Địa chỉ
                            </label>
                            <input
                                type="text"
                                value={shopInfo?.address}
                                onChange={(e) => setDataUpdate({ ...shopInfo, address: e.target.value })}
                                className="w-full border rounded-lg px-4 py-2"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mô tả shop
                            </label>
                            <textarea
                                value={shopInfo?.store_description}
                                onChange={(e) => setDataUpdate({ ...shopInfo, store_description: e.target.value })}
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