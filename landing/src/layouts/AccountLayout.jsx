// layouts/AccountLayout.jsx
import { Outlet, useLocation } from 'react-router-dom';
import { User, Lock, ShoppingCart, Bell, HistoryIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
const links = [
    { to: '/tai-khoan/thong-tin-tai-khoan', label: 'Thông tin', icon: User },
    { to: '/tai-khoan/lich-su-don-hang', label: 'Lịch sử đơn hàng', icon: ShoppingCart },
    { to: '/tai-khoan/doi-mat-khau', label: 'Đổi mật khẩu', icon: Lock },
    { to: '/tai-khoan/thong-bao', label: 'Thông báo', icon: Bell },
    // { to: '/tai-khoan/lich-su-giao-dich', label: 'Lịch sử giao dịch', icon: Bell },
    // { to: '/tai-khoan/lich-su-hoat-dong', label: 'Lịch sử hoạt động', icon: HistoryIcon },
];
const SidebarLink = ({ to, icon: Icon, label, isActive }) => {
    return (
        <Link
            to={to}
            className={`flex items-center gap-3 px-4 py-2 rounded-md font-medium transition-colors ${isActive ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
        >
            <Icon className="w-5 h-5" />
            {label}
        </Link>
    );
}
export default function AccountLayout() {
    const { pathname } = useLocation();

    return (
        <div className="max-w-none flex min-h-screen bg-gray-50 w-[80rem]">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r p-4">
                <h2 className="text-xl font-semibold mb-6">Tài khoản</h2>
                <nav className="space-y-2">
                    {links.map((link) => (
                        <SidebarLink
                            key={link.to}
                            to={link.to}
                            label={link.label}
                            icon={link.icon}
                            isActive={pathname === link.to}
                        />
                    ))}
                </nav>
            </aside>

            {/* Nội dung */}
            <main className="flex-1 overflow-x-hidden px-6 py-6">
                <Outlet />
            </main>
        </div>
    );
}
