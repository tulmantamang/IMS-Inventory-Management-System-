const Product = require('../models/Productmodel');
const StockLog = require('../models/StockLogmodel');
const ActivityLog = require('../models/ActivityLogmodel');

/**
 * Standardizes stock updates and transaction logging.
 * @param {Object} params
 * @param {string} params.productId
 * @param {number} params.quantity - Delta for ADJUST, absolute for IN/OUT
 * @param {string} params.type - 'IN', 'OUT', 'ADJUST'
 * @param {string} params.reason - Description for the transaction
 * @param {string} params.userId - User performing the action
 * @param {string} [params.supplierId] - Optional supplier ID
 */
const updateStock = async ({ productId, quantity, type, reason, userId, supplierId }) => {
    const Product = require('../models/Productmodel');
    const StockLog = require('../models/StockLogmodel');

    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");

    const previousStock = product.stockQuantity;
    let newStock = previousStock;

    if (type === 'IN') {
        newStock += Math.abs(quantity);
    } else if (type === 'OUT') {
        if (previousStock < Math.abs(quantity)) throw new Error("Insufficient stock");
        newStock -= Math.abs(quantity);
    } else if (type === 'ADJUST') {
        // quantity can be negative (reduction) or positive (addition)
        newStock += quantity;
        if (newStock < 0) throw new Error("Adjustment results in negative stock");
    } else {
        throw new Error("Invalid transaction type");
    }

    product.stockQuantity = newStock;
    product.status = newStock > 0 ? 'Active' : 'Inactive';
    await product.save();

    const stockLog = new StockLog({
        product: productId,
        quantity: Math.abs(quantity),
        type: type,
        reason: reason,
        performedBy: userId,
        supplier: supplierId || product.supplier,
        previousStock,
        currentStock: newStock
    });
    await stockLog.save();

    return { product, stockLog };
};

module.exports = { updateStock };
