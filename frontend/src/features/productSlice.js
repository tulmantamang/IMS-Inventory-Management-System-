import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../lib/axios";
import toast from 'react-hot-toast';

const initialState = {
  getallproduct: [], // Initialize as empty array
  isallproductget: false,
  isproductadd: false,
  isproductremove: false,
  searchdata: [],
  issearchdata: false,
  editedProduct: null,
  iseditedProduct: false,
  gettopproduct: [],
  lowStockProducts: [],
  expiringProducts: []
}

export const Addproduct = createAsyncThunk('product/addproduct', async (product, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post("product/addproduct", product, { withCredentials: true, })
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Product adding failed");
  }
})

export const Removeproduct = createAsyncThunk('product/removeproduct', async (productId, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.delete(`product/removeproduct/${productId}`, { withCredentials: true, })
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Product remove failed");
  }
})

export const EditProduct = createAsyncThunk('product/editproduct', async ({ id, updatedData }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(
      `product/editproduct/${id}`,
      { productId: id, updatedData },
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Failed to update product.";
    toast.error(errorMessage);
    return rejectWithValue(errorMessage);
  }
}
);

export const gettingallproducts = createAsyncThunk('product/getproduct', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get("product/getproduct", { withCredentials: true, })
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Product getting failed");
  }
})

export const Searchproduct = createAsyncThunk('product/searchproduct', async (query, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(`product/searchproduct?query=${query}`, { withCredentials: true, })
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Search failed");
  }
})

export const getTopProductsByQuantity = createAsyncThunk('product/getTopProductsByQuantity', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(`product/getTopProductsByQuantity`, { withCredentials: true, })
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Product getting failed");
  }
})

export const getLowStockProducts = createAsyncThunk('product/getLowStockProducts', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get("product/lowstock", { withCredentials: true });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Low Stock Fetch Failed");
  }
});

export const getExpiringProducts = createAsyncThunk('product/getExpiringProducts', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get("product/expiring", { withCredentials: true });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || "Expiring Fetch Failed");
  }
});

const productSlice = createSlice({
  name: "product",
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(gettingallproducts.pending, (state) => {
        state.isallproductget = true
      })
      .addCase(gettingallproducts.fulfilled, (state, action) => {
        state.isallproductget = false;
        state.getallproduct = action.payload.Products || [];
        // Removed toast to avoid spam on page load
      })
      .addCase(gettingallproducts.rejected, (state, action) => {
        state.isallproductget = false
        // toast.error(action.payload || 'Error getting products');
      })

      .addCase(Removeproduct.pending, (state) => {
        state.isproductremove = true
      })
      .addCase(Removeproduct.fulfilled, (state, action) => {
        state.isproductremove = false;
        // Check if getallproduct exists before filtering
        if (state.getallproduct) {
          state.getallproduct = state.getallproduct.filter(product => product._id !== action.meta.arg);
        }
      })
      .addCase(Removeproduct.rejected, (state, action) => {
        state.isproductremove = false
      })

      .addCase(Addproduct.pending, (state) => {
        state.isproductadd = true
      })
      .addCase(Addproduct.fulfilled, (state, action) => {
        state.isproductadd = false
        if (action.payload.product) {
          state.getallproduct.push(action.payload.product);
        }
      })
      .addCase(Addproduct.rejected, (state, action) => {
        state.isproductadd = false
      })

      .addCase(Searchproduct.pending, (state) => {
        state.issearchdata = true
      })
      .addCase(Searchproduct.fulfilled, (state, action) => {
        state.issearchdata = false
        state.searchdata = action.payload
      })
      .addCase(Searchproduct.rejected, (state, action) => {
        state.issearchdata = false
      })

      .addCase(EditProduct.pending, (state) => {
        state.iseditedProduct = true
      })
      .addCase(EditProduct.fulfilled, (state, action) => {
        state.iseditedProduct = false
        state.editedProduct = action.payload
        // Update local list
        const index = state.getallproduct.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.getallproduct[index] = action.payload;
        }
      })
      .addCase(EditProduct.rejected, (state, action) => {
        state.iseditedProduct = false
      })

      .addCase(getTopProductsByQuantity.fulfilled, (state, action) => {
        state.gettopproduct = action.payload.topProducts || []
      })
      .addCase(getLowStockProducts.fulfilled, (state, action) => {
        state.lowStockProducts = action.payload;
      })
      .addCase(getExpiringProducts.fulfilled, (state, action) => {
        state.expiringProducts = action.payload;
      })
  }
});

export default productSlice.reducer;