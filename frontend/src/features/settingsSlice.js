import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../lib/axios';
import toast from 'react-hot-toast';

export const fetchSettings = createAsyncThunk(
    'settings/fetchSettings',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get('/settings');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch settings');
        }
    }
);

export const updateSettings = createAsyncThunk(
    'settings/updateSettings',
    async (updates, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put('/settings', updates);
            return response.data.settings;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update settings');
        }
    }
);

const settingsSlice = createSlice({
    name: 'settings',
    initialState: {
        data: {},
        isLoading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchSettings.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchSettings.fulfilled, (state, action) => {
                state.isLoading = false;
                state.data = action.payload;
            })
            .addCase(fetchSettings.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(updateSettings.fulfilled, (state, action) => {
                state.data = action.payload;
                toast.success('Settings updated successfully');
            })
            .addCase(updateSettings.rejected, (state, action) => {
                toast.error(action.payload);
            });
    },
});

export default settingsSlice.reducer;
