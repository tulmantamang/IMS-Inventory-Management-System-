const StockLog = require('../models/StockLogmodel');
const Product = require('../models/Productmodel');
const logActivity = require('../libs/logger');

module.exports.createStockLog = async (req, res) => {
    const userId = req.user._id;
    try {
        const { productId, type, quantity, reason, supplierId } = req.body;

        if (!productId || !type || !quantity) {
            return res.status(400).json({ message: "Please provide Product, Type, and Quantity." });
        }

        const normalizedType = type.toUpperCase();
        if (!['IN', 'OUT', 'ADJUST'].includes(normalizedType)) {
            return res.status(400).json({ message: "Invalid type. Must be IN, OUT, or ADJUST." });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found." });
        }

        let newStock = product.stockQuantity;
        if (normalizedType === 'IN' || (normalizedType === 'ADJUST' && quantity > 0)) {
            newStock += Number(Math.abs(quantity));
        } else if (normalizedType === 'OUT' || (normalizedType === 'ADJUST' && quantity < 0)) {
            const absQty = Number(Math.abs(quantity));
            if (normalizedType === 'OUT' && newStock < absQty) {
                return res.status(400).json({ message: "Insufficient stock." });
            }
            newStock -= absQty;
        }

        product.stockQuantity = newStock;
        await product.save();

        const log = new StockLog({
            product: productId,
            type: normalizedType,
            quantity: Number(Math.abs(quantity)),
            reason,
            performedBy: userId,
            supplier: supplierId || product.supplier // Fallback to product's default supplier
        });
        await log.save();

        res.status(201).json({ message: "Stock updated successfully", log, currentStock: newStock });

    } catch (error) {
        res.status(500).json({ message: "Error updating stock", error: error.message });
    }
};

module.exports.getStockLogs = async (req, res) => {
    try {
        const { product, supplier, type, startDate, endDate, search, page = 1, limit = 20 } = req.query;
        let query = {};

        if (product) query.product = product;
        if (supplier) query.supplier = supplier;
        if (type) query.type = type.toUpperCase();

        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        // Search logic (requires population or aggregation usually, 
        // but let's do simple ID matches if search is an ID, 
        // or we'd need aggregation for name search. 
        // Let's settle for basic filters first as per prompt.)

        const logs = await StockLog.find(query)
            .populate('product', 'name sku unit')
            .populate('supplier', 'name')
            .populate('performedBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await StockLog.countDocuments(query);

        res.json({
            logs,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalLogs: count
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching stock history", error: error.message });
    }
};

module.exports.getProductStockLogs = async (req, res) => {
    try {
        const { productId } = req.params;
        const logs = await StockLog.find({ product: productId })
            .populate('product', 'name sku')
            .populate('supplier', 'name')
            .populate('performedBy', 'name email')
            .sort({ createdAt: -1 });
        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ message: "Error fetching product stock logs", error: error.message });
    }
};
