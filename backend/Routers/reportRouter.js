const express = require("express");
const router = express.Router();
const { getSalesReport, getStockReport, getSupplierReport, getActivityReport } = require("../controller/reportController");
const { authmiddleware, adminmiddleware } = require("../middleware/Authmiddleware");

// Admin Only Reports
router.get("/sales", authmiddleware, adminmiddleware, getSalesReport);
router.get("/stock", authmiddleware, adminmiddleware, getStockReport);
router.get("/supplier", authmiddleware, adminmiddleware, getSupplierReport);
router.get("/activity", authmiddleware, adminmiddleware, getActivityReport);

// Public/Staff accessible simple JSON views (if needed by frontend)
const { getCategory } = require("../controller/categorycontroller");
router.get("/category", authmiddleware, getCategory);

const { getExpiringProducts } = require("../controller/productController");
router.get("/expiry", authmiddleware, getExpiringProducts);

module.exports = router;
