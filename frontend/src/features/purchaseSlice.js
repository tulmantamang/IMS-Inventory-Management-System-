import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../lib/axios";

export const addPurchase = createAsyncThunk(
    "purchase/add",
    async (purchaseData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("purchase/add", purchaseData, { withCredentials: true });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Purchase failed");
        }
    }
);

export const getPurchaseHistory = createAsyncThunk(
    "purchase/history",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get("purchase/history", { withCredentials: true });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Fetch history failed");
        }
    }
);

const purchaseSlice = createSlice({
    name: "purchase",
    initialState: {
        history: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(addPurchase.pending, (state) => {
                state.loading = true;
            })
            .addCase(addPurchase.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.purchase) {
                    state.history.unshift(action.payload.purchase);
                }
            })
            .addCase(addPurchase.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getPurchaseHistory.pending, (state) => {
                state.loading = true;
            })
            .addCase(getPurchaseHistory.fulfilled, (state, action) => {
                state.loading = false;
                state.history = action.payload;
            })
            .addCase(getPurchaseHistory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export default purchaseSlice.reducer;
