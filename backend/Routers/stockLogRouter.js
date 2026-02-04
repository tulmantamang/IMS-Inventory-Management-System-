const express = require('express');
const router = express.Router();
const { createStockLog, getStockLogs, getProductStockLogs } = require('../controller/stockLogController');
const { authmiddleware, staffmiddleware } = require('../middleware/Authmiddleware');

// Staff can manage stock in/out (Admin included)
router.post('/create', authmiddleware, staffmiddleware, createStockLog);
router.get('/getall', authmiddleware, getStockLogs);
router.get('/product/:productId', authmiddleware, getProductStockLogs);

module.exports = router;
