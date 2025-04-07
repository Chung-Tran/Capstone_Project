import React, { useState } from 'react';
import authService from '../../services/auth.service';
import { showToast } from '../../utils/toast';

const SellerRegisterForm = ({ formData, onInputChange, onFileChange }) => {
    const [errors, setErrors] = useState({});
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState([]);

    // Business categories options
    const businessCategories = [
        { id: 'fashion', name: 'Thời trang' },
        { id: 'electronics', name: 'Thiết bị điện tử' },
        { id: 'home', name: 'Nhà cửa & Đời sống' },
        { id: 'beauty', name: 'Làm đẹp' },
        { id: 'food', name: 'Thực phẩm' },
        { id: 'sports', name: 'Thể thao' },
        { id: 'books', name: 'Sách & Văn phòng phẩm' },
        { id: 'toys', name: 'Đồ chơi' },
        { id: 'health', name: 'Sức khỏe' },
        { id: 'other', name: 'Khác' }
    ];

    const validate = () => {
        const newErrors = {};

        // User information validation
        if (!formData.username.trim()) {
            newErrors.username = 'Vui lòng nhập tên đăng nhập';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Vui lòng nhập email';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }

        if (!formData.password) {
            newErrors.password = 'Vui lòng nhập mật khẩu';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        }

        if (showOtpInput && !formData.otp?.trim()) {
            newErrors.otp = 'Vui lòng nhập mã OTP';
        }

        // Shop information validation
        if (!formData.shopName.trim()) {
            newErrors.shopName = 'Vui lòng nhập tên cửa hàng';
        }

        if (!formData.shopAddress.trim()) {
            newErrors.shopAddress = 'Vui lòng nhập địa chỉ cửa hàng';
        }

        if (!formData.shopPhone.trim()) {
            newErrors.shopPhone = 'Vui lòng nhập số điện thoại';
        } else if (!/^[0-9]{10,11}$/.test(formData.shopPhone.replace(/\s/g, ''))) {
            newErrors.shopPhone = 'Số điện thoại không hợp lệ (cần 10-11 số)';
        }

        if (selectedCategories.length === 0) {
            newErrors.businessCategories = 'Vui lòng chọn ít nhất một lĩnh vực kinh doanh';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (!validate()) return;

            if (!showOtpInput) {
                showToast.error('Vui lòng xác thực OTP trước khi đăng ký');
                return;
            }

            // Prepare data for API
            const apiData = {
                // User account data
                username: formData.username,
                email: formData.email,
                password: formData.password,

                // Store data
                store_name: formData.shopName,
                business_field: selectedCategories,
                store_description: formData.shopDescription || '',
                store_logo: formData.shopLogo,
                tax_code: formData.taxCode || '',
                contact_email: formData.email,
                contact_phone: formData.shopPhone,
                address: formData.shopAddress,
                role: 'seller'
            };

            const response = await authService.customer_register(apiData);
            showToast.success('Đăng ký thành công!');
        } catch (error) {
            showToast.error(error?.message || 'Đăng ký thất bại. Vui lòng thử lại');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileInputChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            onFileChange(e.target.files[0]);
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

    const handleVerifyOtp = async () => {
        if (!formData.otp?.trim()) {
            setErrors({ ...errors, otp: 'Vui lòng nhập mã OTP' });
            return;
        }

        try {
            setIsLoading(true);
            await authService.verify_otp(formData.email, formData.otp);
            setIsOtpVerified(true);
            setErrors({ ...errors, otp: '' });
            showToast.success('Xác thực OTP thành công');
        } catch (error) {
            setErrors({ ...errors, otp: 'Mã OTP không đúng hoặc đã hết hạn' });
            showToast.error('Mã OTP không đúng hoặc đã hết hạn');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCategoryChange = (categoryId) => {
        setSelectedCategories(prev => {
            if (prev.includes(categoryId)) {
                return prev.filter(id => id !== categoryId);
            } else {
                return [...prev, categoryId];
            }
        });
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-gray-900">Đăng ký tài khoản người bán</h1>
                <p className="mt-2 text-gray-600">Vui lòng điền đầy đủ thông tin để tạo tài khoản người bán</p>
            </div>

            <form className="space-y-8" onSubmit={handleSubmit}>
                {/* User Information Section */}
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <div className="flex items-center mb-6">
                        <div className="flex-shrink-0 bg-blue-100 rounded-full p-2">
                            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                        </div>
                        <h2 className="ml-3 text-xl font-semibold text-gray-900">Thông tin người dùng</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                Tên đăng nhập <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-1">
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    autoComplete="username"
                                    required
                                    value={formData.username}
                                    onChange={onInputChange}
                                    className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 
                                    focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                                    ${errors.username ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Nhập tên chủ cửa hàng"
                                />
                                {errors.username && (
                                    <p className="mt-2 text-sm text-red-600">{errors.username}</p>
                                )}
                            </div>
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
                                    value={formData.email}
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
                                    className="inline-flex items-center px-3 whitespace-nowrap py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    {isLoading ? 'Đang gửi...' : 'Gửi OTP'}
                                </button>
                            </div>
                            {errors.email && (
                                <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>

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
                                    value={formData.password}
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
                            <p className="mt-1 text-xs text-gray-500">Mật khẩu phải có ít nhất 6 ký tự</p>
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
                                    value={formData.confirmPassword}
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
                    </div>

                    {showOtpInput && (
                        <div className="mt-6">
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
                                <button
                                    type="button"
                                    onClick={handleVerifyOtp}
                                    disabled={isLoading || isOtpVerified}
                                    className="inline-flex items-center px-3 whitespace-nowrap py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    {isLoading ? 'Đang xác thực...' : isOtpVerified ? 'Đã xác thực' : 'Xác thực OTP'}
                                </button>
                            </div>
                            {errors.otp && (
                                <p className="mt-2 text-sm text-red-600">{errors.otp}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Shop Information Section */}
                <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                    <div className="flex items-center mb-6">
                        <div className="flex-shrink-0 bg-green-100 rounded-full p-2">
                            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                            </svg>
                        </div>
                        <h2 className="ml-3 text-xl font-semibold text-gray-900">Thông tin cửa hàng</h2>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-md mb-6">
                        <h3 className="text-blue-800 font-medium">Thông tin cửa hàng của bạn</h3>
                        <p className="text-blue-700 text-sm mt-1">
                            Các thông tin này sẽ được hiển thị cho người mua khi họ ghé thăm cửa hàng của bạn
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="shopName" className="block text-sm font-medium text-gray-700">
                                Tên cửa hàng <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-1">
                                <input
                                    id="shopName"
                                    name="shopName"
                                    type="text"
                                    required
                                    value={formData.shopName}
                                    onChange={onInputChange}
                                    className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 
                                    focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                                    ${errors.shopName ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Nhập tên cửa hàng của bạn"
                                />
                                {errors.shopName && (
                                    <p className="mt-2 text-sm text-red-600">{errors.shopName}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="shopPhone" className="block text-sm font-medium text-gray-700">
                                Số điện thoại liên hệ <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-1">
                                <input
                                    id="shopPhone"
                                    name="shopPhone"
                                    type="tel"
                                    required
                                    value={formData.shopPhone}
                                    onChange={onInputChange}
                                    className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 
                                    focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                                    ${errors.shopPhone ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Nhập số điện thoại cửa hàng"
                                />
                                {errors.shopPhone && (
                                    <p className="mt-2 text-sm text-red-600">{errors.shopPhone}</p>
                                )}
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label htmlFor="shopAddress" className="block text-sm font-medium text-gray-700">
                                Địa chỉ cửa hàng <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-1">
                                <input
                                    id="shopAddress"
                                    name="shopAddress"
                                    type="text"
                                    required
                                    value={formData.shopAddress}
                                    onChange={onInputChange}
                                    className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 
                                    focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                                    ${errors.shopAddress ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Nhập địa chỉ đầy đủ của cửa hàng"
                                />
                                {errors.shopAddress && (
                                    <p className="mt-2 text-sm text-red-600">{errors.shopAddress}</p>
                                )}
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Lĩnh vực kinh doanh <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-1">
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                                    {businessCategories.map(category => (
                                        <div key={category.id} className="flex items-center">
                                            <input
                                                id={`category-${category.id}`}
                                                name="businessCategories"
                                                type="checkbox"
                                                checked={selectedCategories.includes(category.id)}
                                                onChange={() => handleCategoryChange(category.id)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor={`category-${category.id}`} className="ml-2 block text-sm text-gray-700">
                                                {category.name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                {errors.businessCategories && (
                                    <p className="mt-2 text-sm text-red-600">{errors.businessCategories}</p>
                                )}
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label htmlFor="taxCode" className="block text-sm font-medium text-gray-700">
                                Mã số thuế
                            </label>
                            <div className="mt-1">
                                <input
                                    id="taxCode"
                                    name="taxCode"
                                    type="text"
                                    value={formData.taxCode || ''}
                                    onChange={onInputChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Nhập mã số thuế (không bắt buộc)"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label htmlFor="shopDescription" className="block text-sm font-medium text-gray-700">
                                Mô tả cửa hàng
                            </label>
                            <div className="mt-1">
                                <textarea
                                    id="shopDescription"
                                    name="shopDescription"
                                    rows="3"
                                    value={formData.shopDescription}
                                    onChange={onInputChange}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Mô tả ngắn gọn về cửa hàng và sản phẩm của bạn"
                                />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Mô tả sẽ giúp khách hàng hiểu rõ hơn về cửa hàng của bạn</p>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Logo cửa hàng
                            </label>
                            <div className="mt-1 flex items-center">
                                <span className="inline-block h-16 w-16 rounded-full overflow-hidden bg-gray-100 border border-gray-300">
                                    {formData.shopLogo ? (
                                        <img
                                            src={URL.createObjectURL(formData.shopLogo)}
                                            alt="Shop logo preview"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 12a3 3 0 100-6 3 3 0 000 6z" />
                                            <path
                                                fillRule="evenodd"
                                                d="M3 12a9 9 0 1118 0 9 9 0 01-18 0zm9-10a10 10 0 100 20 10 10 0 000-20z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    )}
                                </span>
                                <button
                                    type="button"
                                    className="ml-5 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    onClick={() => document.getElementById('file-upload').click()}
                                >
                                    Chọn ảnh
                                </button>
                                <input
                                    id="file-upload"
                                    name="file-upload"
                                    type="file"
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={handleFileInputChange}
                                />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Định dạng JPG, PNG hoặc GIF (tối đa 2MB)</p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center">
                    <button
                        type="submit"
                        className="inline-flex justify-center py-3 px-8 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Đăng ký tài khoản
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SellerRegisterForm;