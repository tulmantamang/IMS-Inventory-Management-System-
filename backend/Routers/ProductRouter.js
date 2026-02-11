const express = require("express")
const router = express.Router()
const { Addproduct, getTopProductsByQuantity, RemoveProduct, SearchProduct, EditProduct, getProduct, getLowStockProducts, getExpiringProducts } = require('../controller/productController')
const { authmiddleware, adminmiddleware, staffmiddleware } = require('../middleware/Authmiddleware')

// Staff can Add and Edit. Admin can invalidly do everything (staffmiddleware allows admin).
router.post("/addproduct", authmiddleware, staffmiddleware, Addproduct)
router.put("/editproduct/:productId", authmiddleware, staffmiddleware, EditProduct)

// Admin only Delete/Restore
router.delete("/removeproduct/:productId", authmiddleware, staffmiddleware, RemoveProduct)
// Read access for all authenticated
router.get("/getproduct", authmiddleware, getProduct)
router.get("/searchproduct", authmiddleware, SearchProduct)
router.get("/getTopProductsByQuantity", authmiddleware, getTopProductsByQuantity)
router.get("/lowstock", authmiddleware, getLowStockProducts)
router.get("/expiring", authmiddleware, getExpiringProducts)

module.exports = router