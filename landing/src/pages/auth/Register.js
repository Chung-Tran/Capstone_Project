import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import CustomerRegisterForm from '../../components/auth/CustomerRegisterForm';
import SellerRegisterForm from '../../components/auth/SellerRegisterForm';
import authService from '../../services/auth.service';
import { showToast } from '../../utils/toast';

const Register = () => {
    const [searchParams] = useSearchParams();
    const role = searchParams.get('role') || 'customer';
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        // Thông tin chung
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleFileChange = (file) => {
        setFormData({
            ...formData,
            shopLogo: file
        });
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto w-full">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    {role === 'seller' ? 'Đăng ký Tài khoản Người Bán' : 'Đăng ký Tài khoản Người Mua'}
                </h2>

            </div>

            <div className="mt-8 sm:mx-auto w-full max-w-4xl">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {role === 'customer' ? (
                        <CustomerRegisterForm
                            formData={formData}
                            onInputChange={handleInputChange}
                        />
                    ) : (
                        <SellerRegisterForm
                            formData={formData}
                            onInputChange={handleInputChange}
                            onFileChange={handleFileChange}
                        />
                    )}

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">
                                    Đã có tài khoản?
                                </span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <Link
                                to="/login"
                                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Đăng nhập
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;