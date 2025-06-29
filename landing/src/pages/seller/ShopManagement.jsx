import React, { useEffect, useState } from 'react';
import { CameraIcon } from '@heroicons/react/24/outline';
import { useSelector, useDispatch } from 'react-redux';
import Select from 'react-select';
import authService from '../../services/auth.service';
import shopService from '../../services/shop.service';
import { saveShopData } from '../../store/slices/shopSlice';
import { showToast } from '../../utils/toast';

const ShopManagement = () => {
    const dispatch = useDispatch();
    const shopInfo = useSelector((state) => state.shop.shopInfo);
    const [categories, setCategories] = useState([]);
    const [dataUpdate, setDataUpdate] = useState({});
    const [previewBanner, setPreviewBanner] = useState(null);
    const [previewLogo, setPreviewLogo] = useState(null);
    const [bannerFile, setBannerFile] = useState(null);
    const [logoFile, setLogoFile] = useState(null);

    useEffect(() => {
        setDataUpdate(shopInfo || {});
        setPreviewBanner(shopInfo?.store_banner || null);
        setPreviewLogo(shopInfo?.store_logo || null);
    }, [shopInfo]);

    useEffect(() => {
        const fetchCategories = async () => {
            const res = await shopService.get_all_categories(); // API trả về danh sách category
            if (res.isSuccess) {
                setCategories(res.data);
            }
        };
        fetchCategories();
    }, []);

    const handleBannerChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBannerFile(file);
            setPreviewBanner(URL.createObjectURL(file));
        }
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            setPreviewLogo(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            dispatch({ type: 'shop/setLoading', payload: true });

            if (bannerFile) formData.append('store_banner', bannerFile);
            if (logoFile) formData.append('store_logo', logoFile);

            Object.keys(dataUpdate).forEach(key => {
                if (key !== 'store_banner' && key !== 'store_logo' && key !== 'business_field') {
                    formData.append(key, dataUpdate[key]);
                }
            });

            if (Array.isArray(dataUpdate.business_field)) {
                dataUpdate.business_field.forEach(cat => {
                    formData.append('business_field[]', cat); // ID
                });
            }

            const response = await shopService.update_shop_info(formData);
            if (response.isSuccess) {
                dispatch(saveShopData(response.data));
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
                    {/* Banner và Logo */}
                    <div className="mb-6">
                        <div className="relative h-48 bg-gray-100 rounded-lg mb-4">
                            <img
                                src={previewBanner || 'banner.jpg'}
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
                                src={previewLogo || '/user.png'}
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

                    {/* Form Fields */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tên shop</label>
                            <input
                                type="text"
                                value={dataUpdate.store_name || ''}
                                onChange={(e) => setDataUpdate({ ...dataUpdate, store_name: e.target.value })}
                                className="w-full border rounded-lg px-4 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input
                                type="email"
                                value={dataUpdate.contact_email || ''}
                                onChange={(e) => setDataUpdate({ ...dataUpdate, contact_email: e.target.value })}
                                className="w-full border rounded-lg px-4 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                            <input
                                type="tel"
                                value={dataUpdate.contact_phone || ''}
                                onChange={(e) => setDataUpdate({ ...dataUpdate, contact_phone: e.target.value })}
                                className="w-full border rounded-lg px-4 py-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ</label>
                            <input
                                type="text"
                                value={dataUpdate.address || ''}
                                onChange={(e) => setDataUpdate({ ...dataUpdate, address: e.target.value })}
                                className="w-full border rounded-lg px-4 py-2"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả shop</label>
                            <textarea
                                rows="4"
                                value={dataUpdate.store_description || ''}
                                onChange={(e) => setDataUpdate({ ...dataUpdate, store_description: e.target.value })}
                                className="w-full border rounded-lg px-4 py-2"
                            />
                        </div>

                        {/* Lĩnh vực kinh doanh */}
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Lĩnh vực kinh doanh</label>
                            <Select
                                isMulti
                                options={categories.map(cat => ({
                                    value: cat._id,
                                    label: cat.name
                                }))}
                                value={
                                    (dataUpdate.business_field || []).map(field => {
                                        const id = typeof field === 'string' ? field : field._id;
                                        const match = categories.find(cat => String(cat._id) === String(id));
                                        return match ? { value: match._id, label: match.name } : null;
                                    }).filter(Boolean)
                                }
                                onChange={(selected) => {
                                    setDataUpdate({
                                        ...dataUpdate,
                                        business_field: selected.map(item => item.value)
                                    });
                                }}
                                placeholder="Chọn lĩnh vực..."
                                className="basic-multi-select"
                                classNamePrefix="select"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
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
