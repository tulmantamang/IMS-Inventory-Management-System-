
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice";
import productReducer from "../features/productSlice"
import categoryReducer from "../features/categorySlice"
import supplierReducer from "../features/SupplierSlice"
import salesReducer from "../features/salesSlice"
import purchaseReducer from "../features/purchaseSlice"
import adjustmentReducer from "../features/adjustmentSlice"
import settingsReducer from "../features/settingsSlice";
import stocktransactionReducer from "../features/stocktransactionSlice"

const store = configureStore({
    reducer: {
        auth: authReducer,
        product: productReducer,
        category: categoryReducer,
        supplier: supplierReducer,
        sales: salesReducer,
        purchase: purchaseReducer,
        adjustment: adjustmentReducer,
        settings: settingsReducer,
        stocktransaction: stocktransactionReducer
    }
})
export default store;