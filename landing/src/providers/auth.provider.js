import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { logout, restoreSession } from '../store/slices/authSlice';

const AuthProvider = ({ children }) => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(restoreSession());

        const handleStorageChange = (e) => {
            if (e.key === 'token' && !e.newValue) {
                dispatch(logout());
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [dispatch]);

    return children;
};
export default AuthProvider;