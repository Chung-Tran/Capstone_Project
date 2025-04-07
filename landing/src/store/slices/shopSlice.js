import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    loading: false,
    error: null,
    shopInfo: null,

};
const shopSlice = createSlice({
    name: 'shop',
    initialState,
    reducers: {
        saveShopData: (state, action) => {
            state.shopInfo = action.payload;
        },
        updateShopData: (state, action) => {
            state.shopInfo = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
    },
});

export const { saveShopData } = shopSlice.actions;

export default shopSlice.reducer; 