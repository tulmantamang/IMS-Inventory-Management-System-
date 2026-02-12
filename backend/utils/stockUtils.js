const Product = require('../models/Productmodel');
const StockLog = require('../models/StockLogmodel');

/**
 * Standardizes stock updates and transaction logging.
 * @param {Object} params
 * @param {string} params.productId
 * @param {number} params.quantity - Delta for ADJUST, absolute for IN/OUT
 * @param {string} params.type - 'IN', 'OUT', 'ADJUST'
 * @param {string} params.reason - Description for the transaction
 * @param {string} params.userId - User performing the action
 * @param {string} [params.supplierId] - Optional supplier ID
 * @param {number} [params.purchasePrice] - Transactional purchase price for WAC calculation
 */
const updateStock = async ({ productId, quantity, type, reason, userId, supplierId, purchasePrice }) => {
    const Product = require('../models/Productmodel');
    const StockLog = require('../models/StockLogmodel');

    const product = await Product.findById(productId);
    if (!product) throw new Error("Product not found");

    const previousStock = product.total_stock;
    const oldCost = product.current_cost_price;
    let newStock = previousStock;

    if (type === 'IN') {
        const addQty = Math.abs(quantity);

        // Weighted Average Cost Calculation
        if (purchasePrice !== undefined && purchasePrice !== null) {
            if (previousStock === 0) {
                product.current_cost_price = purchasePrice;
            } else {
                // Formula: ((old_stock * old_cost) + (new_qty * purchase_price)) / (old_stock + new_qty)
                const newCost = ((previousStock * oldCost) + (addQty * purchasePrice)) / (previousStock + addQty);
                product.current_cost_price = Number(newCost.toFixed(2));
            }
        }

        newStock += addQty;
    } else if (type === 'OUT') {
        if (previousStock < Math.abs(quantity)) throw new Error("Insufficient stock");
        newStock -= Math.abs(quantity);
    } else if (type === 'ADJUST') {
        newStock += quantity;
        if (newStock < 0) throw new Error("Adjustment results in negative stock");
    } else {
        throw new Error("Invalid transaction type");
    }

    // Safety check: Ensure selling_price exists (Mongoose required field)
    if (product.selling_price === undefined || product.selling_price === null) {
        console.warn(`Product ${product.name} (ID: ${productId}) is missing selling_price. Defaulting to 0 for validation.`);
        product.selling_price = 0;
    }

    product.total_stock = newStock;
    try {
        await product.save();
    } catch (saveError) {
        console.error("Failed to save product in updateStock:", saveError.message);
        throw saveError;
    }

    const stockLogBody = {
        product: productId,
        quantity: Math.abs(quantity),
        type: type,
        reason: reason,
        performedBy: userId,
        previousStock,
        currentStock: newStock,
        date: new Date()
    };

    if (supplierId) stockLogBody.supplier = supplierId;

    const stockLog = new StockLog(stockLogBody);
    await stockLog.save();

    return { product, stockLog };
};

module.exports = { updateStock };
