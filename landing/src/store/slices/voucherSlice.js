import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  vouchers: [],
  loading: false,
  error: null,
  selectedVoucher: null,
};

const voucherSlice = createSlice({
  name: 'vouchers',
  initialState,
  reducers: {
    fetchVouchersStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchVouchersSuccess: (state, action) => {
      state.loading = false;
      state.vouchers = action.payload;
    },
    fetchVouchersFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setSelectedVoucher: (state, action) => {
      state.selectedVoucher = action.payload;
    },
  },
});

export const {
  fetchVouchersStart,
  fetchVouchersSuccess,
  fetchVouchersFailure,
  setSelectedVoucher,
} = voucherSlice.actions;

export default voucherSlice.reducer;