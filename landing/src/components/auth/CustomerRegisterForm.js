import React, { useState } from 'react';
import authService from '../../services/auth.service';
import { toast } from 'react-toastify';
import { showToast } from '../../utils/toast';
const CustomerRegisterForm = ({ formData, onInputChange, onSubmit }) => {
    const [errors, setErrors] = useState({});
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const validate = () => {
        const newErrors = {};

        if (!formData.fullName?.trim()) {
            newErrors.fullName = 'Vui lòng nhập họ tên';
        }

        if (!formData.birthDate) {
            newErrors.birthDate = 'Vui lòng chọn ngày sinh';
        }

        if (!formData.phone?.trim()) {
            newErrors.phone = 'Vui lòng nhập số điện thoại';
        } else if (!/^[0-9]{10}$/.test(formData.phone)) {
            newErrors.phone = 'Số điện thoại không hợp lệ';
        }

        if (!formData.gender) {
            newErrors.gender = 'Vui lòng chọn giới tính';
        }

        if (!formData.email?.trim()) {
            newErrors.email = 'Vui lòng nhập email';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }

        if (showOtpInput && !formData.otp?.trim()) {
            newErrors.otp = 'Vui lòng nhập mã OTP';
        }

        if (!formData.password) {
            newErrors.password = 'Vui lòng nhập mật khẩu';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        }

        if (!formData.acceptTerms) {
            newErrors.acceptTerms = 'Vui lòng chấp nhận điều khoản sử dụng';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            setIsLoading(true);
            const registrationData = {
                fullName: formData.fullName,
                username: formData.username,
                address: formData.address,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                birthDate: formData.birthDate,
                gender: formData.gender,
                otp: formData.otp,
                role: 'customer',
            };

            const response = await authService.customer_register(registrationData);
            showToast.success('Đăng ký thành công!');
            onSubmit(response);
        } catch (error) {
            showToast.error(error?.message || 'Đăng ký thất bại. Vui lòng thử lại');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendOtp = async () => {
        if (!formData.email?.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
            setErrors({ ...errors, email: 'Vui lòng nhập email hợp lệ trước khi gửi mã OTP' });
            return;
        }

        try {
            setIsLoading(true);
            await authService.customer_register_sent_otp(formData.email);
            setShowOtpInput(true);
            setErrors({ ...errors, email: '' });
            showToast.success('Mã OTP đã được gửi đến email của bạn');
        } catch (error) {
            setErrors({ ...errors, email: error?.message || 'Không thể gửi mã OTP. Vui lòng thử lại' });
            showToast.error(error?.message || 'Không thể gửi mã OTP. Vui lòng thử lại');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form className=" grid grid-cols-2 gap-4 items-center" onSubmit={handleSubmit}>
            <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                    Tên đăng nhập <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                    <input
                        id="username"
                        name="username"
                        type="text"
                        autoComplete="name"
                        required
                        value={formData.username || ''}
                        onChange={onInputChange}
                        className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 
                        focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                        ${errors.username ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Nhập tên đăng nhập"
                    />
                    {errors.username && (
                        <p className="mt-2 text-sm text-red-600">{errors.username}</p>
                    )}
                </div>
            </div>
            <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                    Họ tên <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                    <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        autoComplete="name"
                        required
                        value={formData.fullName || ''}
                        onChange={onInputChange}
                        className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 
                        focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                        ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Nhập họ tên"
                    />
                    {errors.fullName && (
                        <p className="mt-2 text-sm text-red-600">{errors.fullName}</p>
                    )}
                </div>
            </div>

            <div>
                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">
                    Ngày sinh <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                    <input
                        id="birthDate"
                        name="birthDate"
                        type="date"
                        required
                        value={formData.birthDate || ''}
                        onChange={onInputChange}
                        className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 
                        focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                        ${errors.birthDate ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.birthDate && (
                        <p className="mt-2 text-sm text-red-600">{errors.birthDate}</p>
                    )}
                </div>
            </div>

            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Số điện thoại <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                    <input
                        id="phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        required
                        value={formData.phone || ''}
                        onChange={onInputChange}
                        className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 
                        focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                        ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Nhập số điện thoại"
                    />
                    {errors.phone && (
                        <p className="mt-2 text-sm text-red-600">{errors.phone}</p>
                    )}
                </div>
            </div>

            <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Địa chỉ <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                    <input
                        id="address"
                        name="address"
                        type="text"
                        autoComplete="name"
                        required
                        value={formData.address || ''}
                        onChange={onInputChange}
                        className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 
                        focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                        ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Nhập họ tên"
                    />
                    {errors.address && (
                        <p className="mt-2 text-sm text-red-600">{errors.address}</p>
                    )}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Giới tính <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 flex space-x-6">
                    <div className="flex items-center">
                        <input
                            id="gender-male"
                            name="gender"
                            type="radio"
                            value="male"
                            checked={formData.gender === 'male'}
                            onChange={onInputChange}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                        />
                        <label htmlFor="gender-male" className="ml-2 block text-sm text-gray-700">
                            Nam
                        </label>
                    </div>
                    <div className="flex items-center">
                        <input
                            id="gender-female"
                            name="gender"
                            type="radio"
                            value="female"
                            checked={formData.gender === 'female'}
                            onChange={onInputChange}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                        />
                        <label htmlFor="gender-female" className="ml-2 block text-sm text-gray-700">
                            Nữ
                        </label>
                    </div>
                    <div className="flex items-center">
                        <input
                            id="gender-other"
                            name="gender"
                            type="radio"
                            value="other"
                            checked={formData.gender === 'other'}
                            onChange={onInputChange}
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                        />
                        <label htmlFor="gender-other" className="ml-2 block text-sm text-gray-700">
                            Khác
                        </label>
                    </div>
                </div>
                {errors.gender && (
                    <p className="mt-2 text-sm text-red-600">{errors.gender}</p>
                )}
            </div>

            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 flex">
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={formData.email || ''}
                        onChange={onInputChange}
                        className={`appearance-none block w-full px-3 py-2 border rounded-l-md shadow-sm placeholder-gray-400 
                        focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                        ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="example@domain.com"
                    />
                    <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={isLoading}
                        className="inline-flex items-center px-3 whitespace-nowrap py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-blue-600 hover:bg-blue-700 "
                    >
                        {isLoading ? 'Đang gửi...' : 'Gửi OTP'}
                    </button>
                </div>
                {errors.email && (
                    <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                )}
            </div>

            {showOtpInput && (
                <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                        Mã OTP <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1 flex">
                        <input
                            id="otp"
                            name="otp"
                            type="text"
                            required
                            value={formData.otp || ''}
                            onChange={onInputChange}
                            className={`appearance-none block w-full px-3 py-2 border rounded-l-md shadow-sm placeholder-gray-400 
                            focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                            ${errors.otp ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Nhập mã OTP được gửi đến email của bạn"
                        />
                    </div>
                    {errors.otp && (
                        <p className="mt-2 text-sm text-red-600">{errors.otp}</p>
                    )}
                </div>
            )}

            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={formData.password || ''}
                        onChange={onInputChange}
                        className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 
                        focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                        ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="••••••"
                    />
                    {errors.password && (
                        <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                    )}
                </div>
            </div>

            <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Xác nhận mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={formData.confirmPassword || ''}
                        onChange={onInputChange}
                        className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 
                        focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                        ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="••••••"
                    />
                    {errors.confirmPassword && (
                        <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                </div>
            </div>

            <div className="col-span-2 flex items-center">
                <input
                    id="acceptTerms"
                    name="acceptTerms"
                    type="checkbox"
                    checked={formData.acceptTerms || false}
                    onChange={(e) => onInputChange({
                        target: {
                            name: 'acceptTerms',
                            value: e.target.checked
                        }
                    })}
                    className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded 
                    ${errors.acceptTerms ? 'border-red-500' : ''}`}
                />
                <label htmlFor="acceptTerms" className="ml-2 block text-sm text-gray-700">
                    Tôi đồng ý với <a href="#" className="text-blue-600 hover:underline">điều khoản sử dụng</a>
                </label>
            </div>
            {errors.acceptTerms && (
                <p className="mt-1 text-sm text-red-600">{errors.acceptTerms}</p>
            )}

            <div className='col-span-2'>
                <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 "
                >
                    Đăng ký
                </button>
            </div>
        </form>
    );
};

export default CustomerRegisterForm;