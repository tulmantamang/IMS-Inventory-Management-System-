const express = require("express");
const router = express.Router();
const { addOrUpdateInventory, getAllInventory, getInventoryByProduct, deleteInventory } = require("../controller/inventorycontroller");
const { authmiddleware, staffmiddleware } = require('../middleware/Authmiddleware');

router.post("/inventory", authmiddleware, staffmiddleware, addOrUpdateInventory);
router.get("/inventory", authmiddleware, getAllInventory);
router.get("/inventory/:productId", authmiddleware, getInventoryByProduct);
router.delete("/inventory/:productId", authmiddleware, staffmiddleware, deleteInventory);

module.exports = router;
