const express = require("express");
const router = express.Router();
const { createSupplier, searchSupplier, editSupplier, getAllSuppliers, deleteSupplier, getSupplierById } = require("../controller/suppliercontroller");
const { authmiddleware, staffmiddleware, adminmiddleware } = require('../middleware/Authmiddleware');

router.use((req, res, next) => {
    console.log(`[Supplier Router] ${req.method} ${req.url}`, req.body);
    next();
});

// CRUD operations - Staff and Admin can manage suppliers
router.post("/createsupplier", authmiddleware, staffmiddleware, createSupplier);
router.get("/getallsupplier", authmiddleware, getAllSuppliers);
router.get("/:supplierId", authmiddleware, getSupplierById);
router.get("/searchSupplier", authmiddleware, searchSupplier);
router.put("/updatesupplier/:supplierId", authmiddleware, staffmiddleware, editSupplier);

// Delete - Staff and Admin
router.delete("/:supplierId", authmiddleware, staffmiddleware, deleteSupplier);

module.exports = router;
