import { createSlice } from '@reduxjs/toolkit';

const loadingSlice = createSlice({
    name: 'loading',
    initialState: {
        isLoading: false,
        loadingCount: 0 // Đếm số lượng request đang chạy
    },
    reducers: {
        showLoading: (state) => {
            state.loadingCount += 1;
            state.isLoading = true;
        },
        hideLoading: (state) => {
            state.loadingCount = Math.max(0, state.loadingCount - 1);
            state.isLoading = state.loadingCount > 0;
        },
        resetLoading: (state) => {
            state.isLoading = false;
            state.loadingCount = 0;
        }
    }
});

export const { showLoading, hideLoading, resetLoading } = loadingSlice.actions;
export default loadingSlice.reducer;