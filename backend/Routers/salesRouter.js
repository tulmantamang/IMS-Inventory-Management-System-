const express = require("express");
const router = express.Router();
const { createSale, getSales, generateInvoice } = require("../controller/salescontroller");
const { authmiddleware, staffmiddleware } = require('../middleware/Authmiddleware');

// Admin and Staff can manage Sales (Create, View, Invoices)
router.post("/createsales", authmiddleware, staffmiddleware, createSale);
router.get("/getallsales", authmiddleware, staffmiddleware, getSales);
router.get("/:id/invoice", authmiddleware, staffmiddleware, generateInvoice);

module.exports = router;

