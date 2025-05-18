// src/store/slices/commonSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import productService from "../../services/product.service";

// Async thunk để fetch dữ liệu chung
export const initStateCommon = createAsyncThunk(
  "common/initStateCommon",
  async (_, { rejectWithValue }) => {
    try {
      const response = await productService.product_get_categories();
      return {
        categories: response.data,
      };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch common data");
    }
  }
);

// Initial state
const initialState = {
  categories: [],
  loading: false,
  error: null,
};

// Slice
const commonSlice = createSlice({
  name: "common",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(initStateCommon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initStateCommon.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.categories;
      })
      .addCase(initStateCommon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default commonSlice.reducer;
