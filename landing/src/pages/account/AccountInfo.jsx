import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { UserCircleIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import authService from '../../services/auth.service';
import { Upload, message } from 'antd';
import { showToast } from '../../utils/toast';
import { CameraIcon } from 'lucide-react';
import { useLoading } from '../../utils/useLoading';

function AccountInfo() {
    const [isEditing, setIsEditing] = useState(false);
    const userData = useSelector((state) => state.auth.user) || {};
    const [formData, setFormData] = useState({});
    const [previewLogo, setPreviewLogo] = useState(userData?.avatar);
    const dispatch = useDispatch();
    const [logoFile, setLogoFile] = useState(null);
    const { isLoading, setLoading } = useLoading();

    useEffect(() => {
        setFormData(userData);
    }, [userData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            _id: userData._id,
            [name]: value
        });
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            setPreviewLogo(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            const submitFormData = new FormData();

            Object.keys(formData).forEach(key => {
                if (key !== 'avatar' && key !== 'avatarPreview' && formData[key] !== undefined) {
                    submitFormData.append(key, formData[key]);
                }
            });

            if (logoFile) {
                submitFormData.append('avatar', logoFile);
            }

            const response = await authService.update_customer_info(userData._id, submitFormData);

            if (response.isSuccess) {
                setLoading(false);
                dispatch({ type: 'auth/user', payload: response.data });
                setIsEditing(false);
                showToast.success('Cập nhật thông tin thành công!');
            } else {
                throw new Error('Update failed');
            }
        } catch (error) {
            setLoading(false);
            showToast.error('Không thể cập nhật thông tin. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData(userData);
        setIsEditing(false);
    };
    console.log(formData.birthDate)
    return (
        <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-none">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Thông tin tài khoản</h1>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    <PencilSquareIcon className="w-5 h-5" />
                    {isEditing ? 'Hủy chỉnh sửa' : 'Chỉnh sửa thông tin'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Phần avatar */}
                <div className="md:col-span-1 flex flex-col items-center">
                    <div className="relative mb-4">
                        <div className="relative w-32 h-32 mx-auto mb-4">
                            <img
                                src={previewLogo || userData?.avatar}
                                alt="Shop logo"
                                className="w-full h-full object-cover rounded-full border-4 border-white shadow"
                            />
                            <label className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow cursor-pointer">
                                <CameraIcon className="w-5 h-5" />
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    disabled={!isEditing}
                                />
                            </label>
                        </div>

                    </div>
                    <h2 className="text-xl font-semibold text-center">{userData.username}</h2>
                    <p className="text-gray-500 text-center">Thành viên từ: 01/2023</p>

                    {isEditing && (
                        <button
                            onClick={handleSubmit}
                            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                        >
                            Lưu thông tin
                        </button>
                    )}
                </div>

                {/* Phần thông tin cá nhân */}
                <div className="md:col-span-2">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Tên đăng nhập */}
                            <div className="space-y-2">
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                    Tên đăng nhập
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username || ''}
                                    onChange={handleChange}
                                    disabled={true}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                />
                            </div>


                            {/* Email */}
                            <div className="space-y-2">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email || ''}
                                    onChange={handleChange}
                                    disabled={true}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                                    Họ tên
                                </label>
                                <input
                                    type="text"
                                    id="fullName"
                                    name="fullName"
                                    value={formData.fullName || ''}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                />
                            </div>

                            {/* Số điện thoại */}
                            <div className="space-y-2">
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                    Số điện thoại
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone || ''}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                />
                            </div>

                            {/* Giới tính */}
                            <div className="space-y-2">
                                <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                                    Giới tính
                                </label>
                                <select
                                    id="gender"
                                    name="gender"
                                    value={formData.gender || ''}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                >
                                    <option value="Nam">Nam</option>
                                    <option value="Nữ">Nữ</option>
                                    <option value="Khác">Khác</option>
                                </select>
                            </div>

                            {/* Ngày sinh */}
                            <div className="space-y-2">
                                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">
                                    Ngày sinh
                                </label>
                                <input
                                    type="date"
                                    id="birthDate"
                                    name="birthDate"
                                    value={
                                        formData.birthDate
                                            ? new Date(formData.birthDate).toISOString().slice(0, 10)
                                            : ''
                                    }
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                />
                            </div>

                            {/* Địa chỉ */}
                            <div className="space-y-2 md:col-span-2">
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                                    Địa chỉ
                                </label>
                                <textarea
                                    id="address"
                                    name="address"
                                    value={formData.address || ''}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                ></textarea>
                            </div>
                        </div>

                        {isEditing && (
                            <div className="mt-8 flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                >
                                    Lưu thay đổi
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AccountInfo;