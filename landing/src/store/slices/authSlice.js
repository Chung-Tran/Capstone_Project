import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { jwtDecode } from "jwt-decode";
import authService from '../../services/auth.service';
import { isNumber, max } from 'lodash';
import productService from '../../services/product.service';

// Tạo async thunk để xử lý logic bất đồng bộ
export const restoreSession = createAsyncThunk(
    'auth/restoreSession',
    async (_, { rejectWithValue }) => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');

        if (!token || !role) {
            return rejectWithValue('No valid session found');
        }

        try {
            const response = await authService.get_account_info();
            const decodedToken = jwtDecode(token);

            return {
                accountInfo: response.data,
                decodedToken,
                role,
            };
        } catch (error) {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            return rejectWithValue(error.message || 'Failed to restore session');
        }
    }
);

const initialState = {
    user: null,
    isAuthenticated: false,
    userRole: null, // 'customer' hoặc 'seller'
    loading: false,
    error: null,
    notifications: [],
    wishlistCount: [],
    cartCount: 0,
    categories: [],
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
            const token = action.payload.token;
            const role = action.payload.role;
            const _id = action.payload._id;

            try {
                localStorage.setItem('token', token);
                localStorage.setItem('role', role);
                localStorage.setItem('customer_id', _id);

                const decodedToken = jwtDecode(token);

                state.loading = false;
                state.isAuthenticated = true;
                state.userInfo = decodedToken;
                state.userRole = role;
            } catch (error) {
                console.error('Error processing token:', error);
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
            // Chỉ xóa token và role
            localStorage.removeItem('token');
            localStorage.removeItem('role');
        },
        incrementCartCount: (state) => {
            state.cartCount += 1;
        },
        decrementCartCount: (state, action) => {
            state.cartCount = Math.max(0, (state.cartCount || 0) - (isNumber(action.payload) ? Number.parseInt(action.payload) : 1));
        },
        incrementWishlistCount: (state, action) => {
            if (!state.wishlistCount.includes(action.payload))
                state.wishlistCount.push(action.payload)
        },
        decrementWishlistCount: (state, action) => {
            // state.wishlistCount = Math.max(0, (state.wishlistCount || 0) - 1);
            state.wishlistCount = state.wishlistCount.filter(item => item != action.payload)
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(restoreSession.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(restoreSession.fulfilled, (state, action) => {
                state.isAuthenticated = true;
                state.userRole = action.payload.role;
                state.user = action.payload.accountInfo.customer;
                state.cartCount = action.payload.accountInfo.cartCount;
                state.wishlistCount = action.payload.accountInfo.wishlistCount?.map(item => item.product_id);
                state.loading = false;
            })
            .addCase(restoreSession.rejected, (state, action) => {
                state.isAuthenticated = false;
                state.userRole = null;
                state.user = null;
                state.error = action.payload;
                state.loading = false;
            });
    }
});

export const { loginStart, loginSuccess, loginFailure, logout, incrementCartCount, incrementWishlistCount, decrementCartCount, decrementWishlistCount } = authSlice.actions;

export default authSlice.reducer;