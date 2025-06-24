import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import Layout from './layouts/Layout';
import SellerLayout from './layouts/SellerLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Checkout from './pages/Checkout';
import { useSelector } from 'react-redux';
import Dashboard from './pages/seller/Dashboard';
import ShopManagement from './pages/seller/ShopManagement';
import ProductsManager from './pages/seller/ProductsManager';
import Orders from './pages/seller/Orders';
import Reviews from './pages/seller/Reviews';
import MessengerSeller from './pages/seller/MessengerSeller';
import HomePage from './pages/HomePage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthProvider from './providers/auth.provider';
import ForYouPage from './pages/ForyouPage';
import NewProductsPage from './pages/NewProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import SearchProductPage from './pages/SearchProductPage';
import AccountLayout from './layouts/AccountLayout';
import AccountInfo from './pages/account/AccountInfo';
import OrderHistory from './pages/account/OrderHistory';
import ChangePassword from './pages/account/ChangePassword';
import Notifications from './pages/account/Notifications';
import TransactionHistory from './pages/account/TransactionHistory';
import ShoppingCart from './pages/CartPage';
import Wishlist from './pages/Wishlist';
import StorePage from './pages/StorePage';
import CategoryPage from './pages/CategoryPage';
import { SocketProvider } from './contexts/SocketContext';
import MessengerCustomer from './pages/MessengerCustomer';

// Kiểm tra và chuyển hướng seller
const CheckSellerAccess = ({ children }) => {
  const roleSession = localStorage.getItem('role');

  if (roleSession === 'seller') {
    return <Navigate to="/seller/dashboard" replace />;
  }

  return children;
};

// Bảo vệ routes của seller
const SellerRoute = ({ children }) => {
  const roleSession = localStorage.getItem('role');

  if (roleSession !== 'seller') {
    return <Navigate to="/login" replace />;
  }

  return <SellerLayout>{children}</SellerLayout>;
};
const AccountRoute = ({ children }) => {

  return <AccountLayout>{children}</AccountLayout>;
};


// Protected Route cho các trang yêu cầu đăng nhập (như checkout)
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, userRole } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: window.location.pathname }} />;
  }

  if (userRole === 'seller') {
    return <Navigate to="/seller/dashboard" />;
  }

  return children;
};

const MessengerWrapper = () => {
  const { messageId } = useParams();
  return <MessengerCustomer messageId={messageId} />;
};

const AppRoutes = () => {
  return (
    <Routes>

      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Seller Routes */}
      <Route path="/seller/*" element={
        <SellerRoute>
          <Routes>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="shop" element={<ShopManagement />} />
            <Route path="products" element={<ProductsManager />} />
            <Route path="orders" element={<Orders />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="messages" element={<MessengerSeller />} />


            {/* <Route path="analytics" element={<Analytics />} /> */}
          </Routes>
        </SellerRoute>
      } />

      {/* Public/Customer Routes với Layout cũ */}
      <Route path="/*" element={
        <CheckSellerAccess>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/danh-muc/:cat_id" element={<CategoryPage />} />
              <Route path="/danh-cho-ban" element={<ForYouPage />} />
              <Route path="/san-pham-moi" element={<NewProductsPage />} />
              <Route path="/san-pham/:id" element={<ProductDetailPage />} />
              <Route path="/tim-kiem" element={<SearchProductPage />} />
              <Route path="/gio-hang" element={<ShoppingCart />} />
              <Route path="/san-pham-yeu-thich" element={<Wishlist />} />
              <Route path="/san-pham-yeu-thich" element={<Wishlist />} />
              <Route path="/store/:id" element={<StorePage />} />
              <Route path="/tin-nhan/:messageId?" element={<MessengerWrapper />} />


              <Route path="tai-khoan" element={<AccountLayout />}>
                <Route path="thong-tin-tai-khoan" element={<AccountInfo />} />
                <Route path="lich-su-don-hang" element={<OrderHistory />} />
                <Route path="doi-mat-khau" element={<ChangePassword />} />
                <Route path="thong-bao" element={<Notifications />} />
                <Route path="lich-su-giao-dich" element={<TransactionHistory />} />
              </Route>
            </Route>
          </Routes>
        </CheckSellerAccess>
      } />

      {/* Protected Routes - Yêu cầu đăng nhập và không phải seller */}
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

function App() {
  const token = localStorage.getItem("token")
  return (
    <Provider store={store}>
      <AuthProvider>
        <SocketProvider token={token}>
          <Router>
            <AppRoutes />
            <ToastContainer />
          </Router>
        </SocketProvider>

      </AuthProvider>
    </Provider>
  );
}

export default App;
