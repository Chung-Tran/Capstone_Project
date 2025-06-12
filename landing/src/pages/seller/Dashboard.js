import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { TrendingUp, TrendingDown, Package, ShoppingCart, Star, DollarSign, Users, Eye, Calendar, Award, RefreshCw } from "lucide-react";
import dashboardService from "../../services/dashboard.service";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const SellerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [orders, setOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [orderStatus, setOrderStatus] = useState([]);
  const [customerStats, setCustomerStats] = useState([]);
  const [timeFilter, setTimeFilter] = useState('6months');
  const [chartType, setChartType] = useState('month');

  const fetchDashboardData = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true);

      const [summaryRes, revenueRes, ordersRes, topProductsRes, orderStatusRes, customerStatsRes] = await Promise.all([
        dashboardService.getSummary(timeFilter),
        dashboardService.getRevenueOverTime(chartType, timeFilter),
        dashboardService.getOrdersOverTime(chartType, timeFilter),
        dashboardService.getTopSellingProducts(10, timeFilter),
        dashboardService.getOrderStatus(timeFilter),
        dashboardService.getCustomerStats(timeFilter),
      ]);

      setSummary(summaryRes.data);
      setRevenue(revenueRes.data);
      setOrders(ordersRes.data);
      setTopProducts(topProductsRes.data);
      setOrderStatus(orderStatusRes.data);
      setCustomerStats(customerStatsRes.data);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu dashboard:", error);
    } finally {
      setLoading(false);
      if (showRefresh) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timeFilter, chartType]);

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color, suffix = "" }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 hover:shadow-xl transition-all duration-300" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}{suffix}</p>
          {trend && trendValue !== undefined && (
            <div className={`flex items-center mt-2 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              <span className="text-sm font-medium">{Math.abs(trendValue)}%</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full`} style={{ backgroundColor: `${color}20` }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải dữ liệu dashboard...</p>
        </div>
      </div>
    );
  }

  if (!summary) return <div>Không thể tải dữ liệu</div>;

  const revenueData = {
    labels: revenue.map((item) => {
      if (chartType === 'day') return item.label;
      if (chartType === 'week') return `Tuần ${item.week}`;
      return `Tháng ${item.month}`;
    }),
    datasets: [
      {
        label: "Doanh thu",
        data: revenue.map((item) => item.total),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#3b82f6",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 6,
      },
    ],
  };

  const orderData = {
    labels: orders.map((item) => {
      if (chartType === 'day') return item.label;
      if (chartType === 'week') return `Tuần ${item.week}`;
      return `Tháng ${item.month}`;
    }),
    datasets: [
      {
        label: "Tổng đơn hàng",
        data: orders.map((item) => item.count),
        backgroundColor: "rgba(16, 185, 129, 0.8)",
        borderColor: "#10b981",
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: "Hoàn thành",
        data: orders.map((item) => item.completed || 0),
        backgroundColor: "rgba(34, 197, 94, 0.8)",
        borderColor: "#22c55e",
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: "Đã hủy",
        data: orders.map((item) => item.cancelled || 0),
        backgroundColor: "rgba(239, 68, 68, 0.8)",
        borderColor: "#ef4444",
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const orderStatusData = {
    labels: orderStatus.map(item => item.status),
    datasets: [
      {
        data: orderStatus.map(item => item.count),
        backgroundColor: ["#10b981", "#f59e0b", "#ef4444", "#6b7280"],
        borderWidth: 0,
        hoverBackgroundColor: ["#059669", "#d97706", "#dc2626", "#4b5563"],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        cornerRadius: 8,
        callbacks: {
          label: function (context) {
            if (context.datasetIndex !== undefined) {
              const label = context.dataset.label;
              const value = context.parsed.y;
              if (label === 'Doanh thu') {
                return `${label}: ${value.toLocaleString()}đ`;
              }
              return `${label}: ${value.toLocaleString()}`;
            }
            return '';
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
        },
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: '#6b7280',
          callback: function (value) {
            if (this.chart.canvas.id && this.chart.canvas.id.includes('revenue')) {
              return value.toLocaleString() + 'đ';
            }
            return value.toLocaleString();
          }
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        cornerRadius: 8,
        callbacks: {
          label: function (context) {
            const label = context.label;
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      },
    },
    cutout: '70%',
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Người bán</h1>
              <p className="text-gray-600 mt-1">Tổng quan hiệu suất kinh doanh của bạn</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="day">Theo ngày</option>
                <option value="week">Theo tuần</option>
                <option value="month">Theo tháng</option>
              </select>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7days">7 ngày qua</option>
                <option value="1month">1 tháng qua</option>
                <option value="3months">3 tháng qua</option>
                <option value="6months">6 tháng qua</option>
                <option value="1year">1 năm qua</option>
              </select>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 inline mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Làm mới
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Tổng doanh thu"
            value={summary.totalRevenue?.toLocaleString() || '0'}
            suffix="đ"
            icon={DollarSign}
            trend={summary.revenueGrowth >= 0 ? 'up' : 'down'}
            trendValue={summary.revenueGrowth}
            color="#3b82f6"
          />
          <StatCard
            title="Tổng đơn hàng"
            value={summary.totalOrders?.toLocaleString() || '0'}
            icon={ShoppingCart}
            trend={summary.orderGrowth >= 0 ? 'up' : 'down'}
            trendValue={summary.orderGrowth}
            color="#10b981"
          />
          <StatCard
            title="Tỷ lệ chuyển đổi"
            value={summary.conversionRate || '0'}
            suffix="%"
            icon={Users}
            trend={summary.conversionGrowth >= 0 ? 'up' : 'down'}
            trendValue={summary.conversionGrowth}
            color="#f59e0b"
          />
          <StatCard
            title="Đánh giá trung bình"
            value={`${summary.averageRating || '0'}/5`}
            icon={Star}
            trend={summary.ratingGrowth >= 0 ? 'up' : 'down'}
            trendValue={summary.ratingGrowth}
            color="#ef4444"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Doanh thu theo thời gian</h2>
              <div className={`flex items-center ${summary.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {summary.revenueGrowth >= 0 ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                <span className="text-sm font-medium">{Math.abs(summary.revenueGrowth || 0)}%</span>
              </div>
            </div>
            <div className="h-80">
              <Line data={revenueData} options={chartOptions} />
            </div>
          </div>

          {/* Order Status Pie Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Trạng thái đơn hàng</h2>
            <div className="h-80">
              <Doughnut data={orderStatusData} options={doughnutOptions} />
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Orders Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Thống kê đơn hàng</h2>
              <div className={`flex items-center ${summary.orderGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {summary.orderGrowth >= 0 ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                <span className="text-sm font-medium">{Math.abs(summary.orderGrowth || 0)}%</span>
              </div>
            </div>
            <div className="h-64">
              <Bar data={orderData} options={chartOptions} />
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Sản phẩm bán chạy</h2>
              <Award className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {topProducts.map((product, index) => (
                <div key={product._id} className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-gray-300'
                    }`}>
                    {index + 1}
                  </div>
                  <div className="flex-shrink-0 mr-3">
                    <img
                      src={product.image || "/no-image.png"}
                      className="w-10 h-10 rounded-lg object-cover"
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = "/no-image.png";
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.totalSold} đã bán</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{(product.revenue || 0).toLocaleString()}đ</p>
                    <div className="flex items-center text-green-600 text-sm">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      <span>+{product.growth || 0}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Package className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <p className="text-2xl font-bold text-gray-900">{summary.totalProducts || 0}</p>
            <p className="text-gray-600">Sản phẩm đang bán</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Eye className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <p className="text-2xl font-bold text-gray-900">{(summary.totalViews || 0).toLocaleString()}</p>
            <p className="text-gray-600">Lượt xem sản phẩm</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Users className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <p className="text-2xl font-bold text-gray-900">{summary.totalCustomers || 0}</p>
            <p className="text-gray-600">Khách hàng</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <DollarSign className="w-8 h-8 text-orange-600 mx-auto mb-3" />
            <p className="text-2xl font-bold text-gray-900">{summary.completionRate || 0}%</p>
            <p className="text-gray-600">Tỷ lệ hoàn thành</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;