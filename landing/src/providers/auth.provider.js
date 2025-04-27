import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { logout, restoreSession } from '../store/slices/authSlice';
import { initStateCommon } from '../store/slices/commonSlice';

const AuthProvider = ({ children }) => {
    const dispatch = useDispatch();

    useEffect(() => {
        // Tạo hàm async để gọi dispatch
        const initAuth = async () => {
            try {
                await dispatch(initStateCommon()).unwrap();
                // Gọi sau khi đã khởi tạo state chung
                await dispatch(restoreSession()).unwrap();
            } catch (error) {
                console.error('Failed to restore session or common state', error);
            }
        };

        initAuth(); // Khởi tạo auth và gọi thunk

        const handleStorageChange = (e) => {
            if (e.key === 'token' && !e.newValue) {
                dispatch(logout()); // Nếu không còn token, logout
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [dispatch]);  // Không quên thêm dispatch vào dependency array

    return children;
};

export default AuthProvider;
