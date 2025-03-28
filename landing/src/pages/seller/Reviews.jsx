import React, { useState } from 'react';
import { StarIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/solid';

const Reviews = () => {
    const [reviews] = useState([
        {
            id: 1,
            customer: 'Nguyễn Văn A',
            product: 'Sản phẩm 1',
            rating: 5,
            comment: 'Sản phẩm rất tốt, đóng gói cẩn thận',
            date: '2024-03-20',
            replied: false
        },
        {
            id: 2,
            customer: 'Trần Thị B',
            product: 'Sản phẩm 2',
            rating: 4,
            comment: 'Hàng đẹp, giao hàng nhanh',
            date: '2024-03-19',
            replied: true
        },
        // Thêm đánh giá mẫu khác
    ]);

    const renderStars = (rating) => {
        return [...Array(5)].map((_, index) => (
            <StarIcon
                key={index}
                className={`w-5 h-5 ${index < rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
            />
        ));
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Đánh giá & Phản hồi</h1>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="grid grid-cols-4 gap-4">
                    <input
                        type="text"
                        placeholder="Tìm kiếm đánh giá..."
                        className="border rounded-lg px-4 py-2"
                    />
                    <select className="border rounded-lg px-4 py-2">
                        <option value="">Tất cả sao</option>
                        <option value="5">5 sao</option>
                        <option value="4">4 sao</option>
                        <option value="3">3 sao</option>
                        <option value="2">2 sao</option>
                        <option value="1">1 sao</option>
                    </select>
                    <select className="border rounded-lg px-4 py-2">
                        <option value="">Tất cả trạng thái</option>
                        <option value="replied">Đã phản hồi</option>
                        <option value="not_replied">Chưa phản hồi</option>
                    </select>
                    <button className="bg-blue-500 text-white rounded-lg px-4 py-2">
                        Lọc
                    </button>
                </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                {reviews.map((review) => (
                    <div key={review.id} className="bg-white rounded-lg shadow p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-medium">{review.customer}</h3>
                                <p className="text-sm text-gray-500">{review.date}</p>
                            </div>
                            <div className="flex">
                                {renderStars(review.rating)}
                            </div>
                        </div>
                        <p className="text-gray-600 mb-2">{review.product}</p>
                        <p className="mb-4">{review.comment}</p>
                        {!review.replied && (
                            <div className="mt-4">
                                <button className="flex items-center text-blue-500 hover:text-blue-600">
                                    <ChatBubbleLeftIcon className="w-5 h-5 mr-2" />
                                    Phản hồi
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Reviews; 