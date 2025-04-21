import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  registrations: [],
  loading: false,
  error: null,
};

const flashSaleSlice = createSlice({
  name: 'flashSales',
  initialState,
  reducers: {
    fetchRegistrationsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchRegistrationsSuccess: (state, action) => {
      state.loading = false;
      state.registrations = action.payload;
    },
    fetchRegistrationsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchRegistrationsStart,
  fetchRegistrationsSuccess,
  fetchRegistrationsFailure,
} = flashSaleSlice.actions;

export default flashSaleSlice.reducer;