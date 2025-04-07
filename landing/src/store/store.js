import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import productReducer from './slices/productSlice';
import shopReducer from './slices/shopSlice';
export const store = configureStore({
    reducer: {
        auth: authReducer,
        products: productReducer,
        shop: shopReducer,
    },
}); 