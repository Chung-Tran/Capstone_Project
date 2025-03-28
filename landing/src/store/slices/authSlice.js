import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: null,
    isAuthenticated: false,
    userRole: null, // 'customer' hoặc 'seller'
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        loginSuccess: (state, action) => {
            state.loading = false;
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.userRole = action.payload.role;

            try {
                localStorage.setItem('user', JSON.stringify(action.payload.user));
                localStorage.setItem('roleSession', action.payload.role);
            } catch (error) {
                console.error('Error setting localStorage:', error);
            }

        },
        loginFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.userRole = null;
            state.error = null;
            try {
                localStorage.removeItem('user');
                localStorage.removeItem('roleSession');
            } catch (error) {
                console.error('Error setting localStorage:', error);
            }
        },
    },
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;

// Mock login thunk action
export const mockLogin = (username, password) => async (dispatch) => {
    dispatch(loginStart());
    try {
        // Giả lập API call
        await new Promise(resolve => setTimeout(resolve, 1000)); // Delay 1s

        if (password !== '123456') {
            throw new Error('Mật khẩu không đúng');
        }

        if (username === 'seller') {
            dispatch(loginSuccess({
                user: {
                    id: '1',
                    username: 'seller',
                    shopName: 'Shop Demo',
                },
                role: 'seller'
            }));
        } else if (username === 'customer') {
            dispatch(loginSuccess({
                user: {
                    id: '2',
                    username: 'customer',
                },
                role: 'customer'
            }));
        } else {
            throw new Error('Tài khoản không tồn tại');
        }
    } catch (error) {
        dispatch(loginFailure(error.message));
    }
};

export default authSlice.reducer; 