import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import authService from '../../services/auth.service';
import { showToast } from '../../utils/toast';
import { loginSuccess } from '../../store/slices/authSlice';
const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, userRole, error, loading } = useSelector((state) => state.auth);
  const from = location.state?.from || '/';


  useEffect(() => {
    if (isAuthenticated) {
      if (userRole === 'seller') {
        navigate('/seller/dashboard');
      } else {
        navigate(from);
      }
    }
  }, [isAuthenticated, userRole, navigate, from]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = 'Vui lòng nhập tên đăng nhập';
    }
    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await authService.customer_login(formData);
        if (response.isSuccess) {
          dispatch(loginSuccess(response.data));
          showToast.success('Đăng nhập thành công!');
          navigate(from);
        }
      } catch (error) {
        console.log(error);
        showToast.error(error.response?.message || 'Đăng nhập thất bại. Vui lòng thử lại');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto max-w-4xl">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Đăng nhập
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto max-w-4xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
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

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                  ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                {loading ? 'Đang xử lý...' : 'Đăng nhập'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Chưa có tài khoản?
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Link
                to="/register?role=customer"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Đăng ký mua hàng
              </Link>
              <Link
                to="/register?role=seller"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Đăng ký bán hàng
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 