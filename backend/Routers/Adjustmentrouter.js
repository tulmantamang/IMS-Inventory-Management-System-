const express = require('express');
const router = express.Router();
const { createAdjustment, getAdjustmentsByProduct, getAllAdjustments } = require('../controller/Adjustmentcontroller');
const { authmiddleware, staffmiddleware, adminmiddleware } = require('../middleware/Authmiddleware');

// Admin only can manage adjustments
router.post('/', authmiddleware, adminmiddleware, createAdjustment);
router.get('/', authmiddleware, adminmiddleware, getAllAdjustments);
router.get('/:productId', authmiddleware, getAdjustmentsByProduct);

module.exports = router;

