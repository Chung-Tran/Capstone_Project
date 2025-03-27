import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Register = () => {
    const [searchParams] = useSearchParams();
    const role = searchParams.get('role') || 'customer';
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        // Thông tin shop (chỉ cho seller)
        shopName: '',
        shopAddress: '',
        shopPhone: '',
        shopDescription: '',
        shopLogo: null,
    });
    const [errors, setErrors] = useState({});

    const validateStep1 = () => {
        const newErrors = {};
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
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors = {};
        if (!formData.shopName.trim()) {
            newErrors.shopName = 'Vui lòng nhập tên shop';
        }
        if (!formData.shopAddress.trim()) {
            newErrors.shopAddress = 'Vui lòng nhập địa chỉ shop';
        }
        if (!formData.shopPhone.trim()) {
            newErrors.shopPhone = 'Vui lòng nhập số điện thoại';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (step === 1 && validateStep1()) {
            if (role === 'seller') {
                setStep(2);
            } else {
                // Submit form for customer
                console.log('Register customer:', formData);
                navigate('/login');
            }
        } else if (step === 2 && validateStep2()) {
            // Submit form for seller
            console.log('Register seller:', formData);
            navigate('/login');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Đăng ký {role === 'seller' ? 'bán hàng' : 'tài khoản'}
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {step === 1 ? (
                            <>
                                <div>
                                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                        Tên đăng nhập
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            id="username"
                                            name="username"
                                            type="text"
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 
                        focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                        ${errors.username ? 'border-red-500' : 'border-gray-300'}`}
                                        />
                                        {errors.username && (
                                            <p className="mt-2 text-sm text-red-600">{errors.username}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                        Email
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 
                        focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                        ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                                        />
                                        {errors.email && (
                                            <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                        Mật khẩu
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 
                        focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                        ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                                        />
                                        {errors.password && (
                                            <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                        Xác nhận mật khẩu
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type="password"
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 
                        focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                        ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                                        />
                                        {errors.confirmPassword && (
                                            <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label htmlFor="shopName" className="block text-sm font-medium text-gray-700">
                                        Tên shop
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            id="shopName"
                                            name="shopName"
                                            type="text"
                                            value={formData.shopName}
                                            onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                                            className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 
                        focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                        ${errors.shopName ? 'border-red-500' : 'border-gray-300'}`}
                                        />
                                        {errors.shopName && (
                                            <p className="mt-2 text-sm text-red-600">{errors.shopName}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="shopAddress" className="block text-sm font-medium text-gray-700">
                                        Địa chỉ shop
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            id="shopAddress"
                                            name="shopAddress"
                                            type="text"
                                            value={formData.shopAddress}
                                            onChange={(e) => setFormData({ ...formData, shopAddress: e.target.value })}
                                            className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 
                        focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                        ${errors.shopAddress ? 'border-red-500' : 'border-gray-300'}`}
                                        />
                                        {errors.shopAddress && (
                                            <p className="mt-2 text-sm text-red-600">{errors.shopAddress}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="shopPhone" className="block text-sm font-medium text-gray-700">
                                        Số điện thoại
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            id="shopPhone"
                                            name="shopPhone"
                                            type="tel"
                                            value={formData.shopPhone}
                                            onChange={(e) => setFormData({ ...formData, shopPhone: e.target.value })}
                                            className={`appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 
                        focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm
                        ${errors.shopPhone ? 'border-red-500' : 'border-gray-300'}`}
                                        />
                                        {errors.shopPhone && (
                                            <p className="mt-2 text-sm text-red-600">{errors.shopPhone}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="shopDescription" className="block text-sm font-medium text-gray-700">
                                        Mô tả shop
                                    </label>
                                    <div className="mt-1">
                                        <textarea
                                            id="shopDescription"
                                            name="shopDescription"
                                            rows="3"
                                            value={formData.shopDescription}
                                            onChange={(e) => setFormData({ ...formData, shopDescription: e.target.value })}
                                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Logo shop
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setFormData({ ...formData, shopLogo: e.target.files[0] })}
                                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="flex justify-between">
                            {step === 2 && (
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                >
                                    Quay lại
                                </button>
                            )}
                            <button
                                type="submit"
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                {step === 1 && role === 'seller' ? 'Tiếp tục' : 'Đăng ký'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register; 