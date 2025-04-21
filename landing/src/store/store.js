import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import productReducer from './slices/productSlice';
import voucherReducer from './slices/voucherSlice';
import shopReducer from './slices/shopSlice';
import loadingReducer from './slices/loadingSlice';
import flashSaleReducer from './slices/flashSaleSlice';
export const store = configureStore({
    reducer: {
        auth: authReducer,
        products: productReducer,
        shop: shopReducer,
        loading: loadingReducer,
        vouchers: voucherReducer,
        flashSales: flashSaleReducer,
    },
}); 