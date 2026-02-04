const express = require('express');
const router = express.Router();
const { createStockTransaction, getAllStockTransactions, searchStocks, getStockTransactionsByProduct, getStockTransactionsBySupplier } = require('../controller/stocktransaction');
const { authmiddleware, staffmiddleware } = require('../middleware/Authmiddleware');

router.post('/createStockTransaction', authmiddleware, staffmiddleware, createStockTransaction);
router.get('/getallStockTransaction', authmiddleware, getAllStockTransactions);
router.get('/product/:productId', authmiddleware, getStockTransactionsByProduct);
router.get('/supplier/:supplierId', authmiddleware, getStockTransactionsBySupplier);
router.get('/searchstocks', authmiddleware, searchStocks);


module.exports = router;
