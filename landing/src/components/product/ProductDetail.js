import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const ProductDetail = ({ product }) => {
    const { isAuthenticated } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    const handleBuyNow = () => {
        if (!isAuthenticated) {
            // Lưu URL hiện tại để sau khi đăng nhập quay lại
            navigate('/login', { state: { from: window.location.pathname } });
        } else {
            navigate('/checkout');
        }
    };

    return (
        <div>
            {/* Chi tiết sản phẩm */}
            <div className="mt-4">
                <button
                    onClick={handleBuyNow}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                    {isAuthenticated ? 'Mua ngay' : 'Đăng nhập để mua hàng'}
                </button>
            </div>
        </div>
    );
};

export default ProductDetail; 