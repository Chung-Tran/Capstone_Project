import React from 'react';
import { ChartBarIcon, CurrencyDollarIcon, ShoppingBagIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const StatCard = ({ icon: Icon, label, value, change }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <Icon className="w-8 h-8" />
            </div>
            <div className="ml-4">
                <h3 className="text-gray-500 text-sm">{label}</h3>
                <p className="text-2xl font-semibold">{value}</p>
                <p className={`text-sm ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {change >= 0 ? '+' : ''}{change}% so với tháng trước
                </p>
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    const stats = [
        { icon: CurrencyDollarIcon, label: 'Doanh thu', value: '12.5M', change: 8.4 },
        { icon: ShoppingBagIcon, label: 'Đơn hàng', value: '156', change: 12.5 },
        { icon: UserGroupIcon, label: 'Khách hàng mới', value: '64', change: -2.4 },
        { icon: ChartBarIcon, label: 'Tỷ lệ chuyển đổi', value: '3.2%', change: 4.1 },
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Tổng quan</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            {/* Recent Orders and Analytics sections can be added here */}
        </div>
    );
};

export default Dashboard; 