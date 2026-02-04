const express = require("express");
const router = express.Router();
const { addPurchase, getPurchaseHistory } = require('../controller/purchasecontroller');
const { authmiddleware, staffmiddleware } = require('../middleware/Authmiddleware');

// Admin and Staff can record purchases and view history
router.post("/add", authmiddleware, staffmiddleware, addPurchase);
router.get("/history", authmiddleware, staffmiddleware, getPurchaseHistory);

module.exports = router;
