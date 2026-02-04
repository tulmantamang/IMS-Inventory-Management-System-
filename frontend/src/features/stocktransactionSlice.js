import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../lib/axios";

const initialState = {
  getallStocks: [],
  totalPages: 1,
  currentPage: 1,
  totalLogs: 0,
  isgetallStocks: false,
  iscreatedStocks: false,
  searchdata: []
};

export const createStockTransaction = createAsyncThunk(
  'stocktransaction/createStockTransaction',
  async (Stocks, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("stock/create", Stocks);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Stocks creation failed");
    }
  }
);

export const getAllStockTransactions = createAsyncThunk(
  'stocktransaction/getallStockTransaction',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("stock/getall", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Stock retrieval failed");
    }
  }
);

const stocktransactionSlice = createSlice({
  name: "stocktransaction",
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllStockTransactions.pending, (state) => {
        state.isgetallStocks = true;
      })
      .addCase(getAllStockTransactions.fulfilled, (state, action) => {
        state.isgetallStocks = false;
        // Handle paginated structure from backend
        if (action.payload.logs) {
          state.getallStocks = action.payload.logs;
          state.totalPages = action.payload.totalPages;
          state.currentPage = action.payload.currentPage;
          state.totalLogs = action.payload.totalLogs;
        } else {
          state.getallStocks = action.payload || [];
        }
      })
      .addCase(getAllStockTransactions.rejected, (state, action) => {
        state.isgetallStocks = false;
      })

      .addCase(createStockTransaction.pending, (state) => {
        state.iscreatedStocks = true;
      })
      .addCase(createStockTransaction.fulfilled, (state, action) => {
        state.iscreatedStocks = false;
        // The backend returns { message, log, currentStock }
        if (action.payload.log) {
          state.getallStocks.unshift(action.payload.log);
          state.totalLogs += 1;
        }
      })
      .addCase(createStockTransaction.rejected, (state, action) => {
        state.iscreatedStocks = false;
      })
  },
});

export default stocktransactionSlice.reducer;
