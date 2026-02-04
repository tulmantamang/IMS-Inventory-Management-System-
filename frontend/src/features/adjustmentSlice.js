import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../lib/axios";
import toast from 'react-hot-toast';

const initialState = {
    adjustments: [],
    loading: false,
    error: null
};

export const createAdjustment = createAsyncThunk(
    'adjustment/create',
    async (adjustmentData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("adjustments", adjustmentData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Adjustment failed");
        }
    }
);

export const getAllAdjustments = createAsyncThunk(
    'adjustment/getAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get("adjustments");
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch adjustments");
        }
    }
);

const adjustmentSlice = createSlice({
    name: "adjustment",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getAllAdjustments.pending, (state) => {
                state.loading = true;
            })
            .addCase(getAllAdjustments.fulfilled, (state, action) => {
                state.loading = false;
                state.adjustments = action.payload;
            })
            .addCase(getAllAdjustments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createAdjustment.fulfilled, (state, action) => {
                state.adjustments.unshift(action.payload.adjustment);
            });
    },
});

export default adjustmentSlice.reducer;
