import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../lib/axios";
import toast from 'react-hot-toast';

const initialState = {
  getallSupplier: [],
  isallSupplier: false,
  isSupplieradd: false,
  isSupplierremove: false,
  searchdata: [],
  issearchdata: false,
  editedSupplier: null,
  iseditedSupplier: false,
};


export const CreateSupplier = createAsyncThunk(
  'supplier/createsupplier',
  async (Supplier, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("supplier/createsupplier", Supplier, { withCredentials: true });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "supplier creation failed");
    }
  }
);

export const gettingallSupplier = createAsyncThunk(
  'supplier/getallsupplier',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('supplier/getallsupplier', { withCredentials: true });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Supplier retrieval failed");
    }
  }
);

export const deleteSupplier = createAsyncThunk(
  'supplier/delete', // Unique string
  async (supplierId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`supplier/${supplierId}`, { withCredentials: true });
      return { ...response.data, supplierId }; // Return ID to filter locally
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Supplier remove failed");
    }
  }
);

export const SearchSupplier = createAsyncThunk(
  "supplier/searchSupplier",
  async (query, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`supplier/searchSupplier?query=${query}`, { withCredentials: true });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Supplier search failed");
    }
  }
);

export const EditSupplier = createAsyncThunk(
  "supplier/updatesupplier",
  async ({ supplierId, updatedData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        `supplier/updatesupplier/${supplierId}`,
        updatedData,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.log(error)
      const errorMessage =
        error.response?.data?.message || "Failed to update supplier. Please try again.";
      return rejectWithValue(errorMessage);
    }
  }
);


const supplierSlice = createSlice({
  name: "supplier",
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      .addCase(CreateSupplier.pending, (state) => {
        state.isSupplieradd = true;
      })
      .addCase(CreateSupplier.fulfilled, (state, action) => {
        state.isSupplieradd = false;
        // Optional: Push to list if structure matches
        if (action.payload.newSupplier) {
          state.getallSupplier.push(action.payload.newSupplier);
        }
      })
      .addCase(CreateSupplier.rejected, (state, action) => {
        state.isSupplieradd = false;
      })


      .addCase(gettingallSupplier.pending, (state) => {
        state.isallSupplier = true;
      })
      .addCase(gettingallSupplier.fulfilled, (state, action) => {
        state.isallSupplier = false;
        // Backend returns generic array for getAll
        state.getallSupplier = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(gettingallSupplier.rejected, (state, action) => {
        state.isallSupplier = false;
      })


      .addCase(deleteSupplier.pending, (state) => {
        state.isSupplierremove = true;
      })
      .addCase(deleteSupplier.fulfilled, (state, action) => {
        state.isSupplierremove = false;
        // Correctly filter out the deleted supplier
        state.getallSupplier = state.getallSupplier.filter(s => s._id !== action.payload.supplierId);
      })
      .addCase(deleteSupplier.rejected, (state, action) => {
        state.isSupplierremove = false;
        toast.error(action.payload || "Delete failed");
      })

      .addCase(SearchSupplier.fulfilled, (state, action) => {
        // Backend returns { success: true, suppliers: [...] }
        state.issearchdata = false;
        state.searchdata = action.payload.suppliers || [];
      })

      .addCase(SearchSupplier.rejected, (state, action) => {
        state.issearchdata = false;
      })

      .addCase(EditSupplier.fulfilled, (state, action) => {
        state.iseditedSupplier = false;
        if (action.payload.supplier) {
          const index = state.getallSupplier.findIndex(s => s._id === action.payload.supplier._id);
          if (index !== -1) state.getallSupplier[index] = action.payload.supplier;
        }
      })

      .addCase(EditSupplier.rejected, (state, action) => {
        state.iseditedSupplier = false;
      })

  },
});

export default supplierSlice.reducer;
