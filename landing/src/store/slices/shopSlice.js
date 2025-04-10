import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    loading: false,
    error: null,
    shopInfo: null,
    productInfo:null,
};
const shopSlice = createSlice({
    name: 'shop',
    initialState,
    reducers: {
        saveShopData: (state, action) => {
            state.shopInfo = action.payload;
        },
        saveProductData: (state, action) => {
            state.productInfo = action.payload;
        },
        updateShopData: (state, action) => {
            state.shopInfo = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
    },
});

export const { saveShopData,saveProductData } = shopSlice.actions;

export default shopSlice.reducer; 