const express = require("express");
const router = express.Router();
const { addPurchase, getPurchaseHistory, generatePurchaseInvoice } = require('../controller/purchasecontroller');
const { authmiddleware, staffmiddleware } = require('../middleware/Authmiddleware');

// Admin and Staff can record purchases and view history
router.post("/add", authmiddleware, staffmiddleware, addPurchase);
router.get("/history", authmiddleware, staffmiddleware, getPurchaseHistory);
router.get("/:id/invoice", authmiddleware, staffmiddleware, generatePurchaseInvoice);

module.exports = router;
