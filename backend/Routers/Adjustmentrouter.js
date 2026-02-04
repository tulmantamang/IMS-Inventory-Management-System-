const express = require('express');
const router = express.Router();
const { createAdjustment, getAdjustmentsByProduct, getAllAdjustments } = require('../controller/Adjustmentcontroller');
const { authmiddleware, staffmiddleware } = require('../middleware/Authmiddleware');

// Admin and Staff can manage adjustments
router.post('/', authmiddleware, staffmiddleware, createAdjustment);
router.get('/', authmiddleware, staffmiddleware, getAllAdjustments);
router.get('/:productId', authmiddleware, getAdjustmentsByProduct);

module.exports = router;

