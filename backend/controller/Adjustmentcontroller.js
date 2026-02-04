const Adjustment = require('../models/Adjustmentmodel');
const { updateStock } = require('../utils/stockUtils');
const logActivity = require("../libs/logger");

module.exports.createAdjustment = async (req, res) => {
    try {
        const { productId, type, quantity, reason } = req.body;
        const userId = req.user._id;

        if (!productId || !type || quantity === undefined || !reason) {
            throw new Error("Missing required fields: Product, Type, Quantity, Reason.");
        }

        let adjustmentValue = Number(quantity);
        // Correct logic based on type: Damage reduces stock, Return adds stock
        if (type === 'Damage') adjustmentValue = -Math.abs(adjustmentValue);
        if (type === 'Return') adjustmentValue = Math.abs(adjustmentValue);

        // Use updateStock utility
        const { product } = await updateStock({
            productId,
            quantity: adjustmentValue, // Passing delta for ADJUST
            type: 'ADJUST',
            reason: `${type}: ${reason}`,
            userId
        });

        const adjustment = new Adjustment({
            product: productId,
            type,
            quantity: adjustmentValue,
            reason,
            adjustedBy: userId
        });
        await adjustment.save();

        await logActivity({
            action: "Stock Adjustment",
            description: `${type} adjustment for ${product.name}: ${adjustmentValue}`,
            entity: "adjustment",
            entityId: adjustment._id,
            userId: userId,
            ipAddress: req.ip
        });

        res.status(201).json({ message: "Adjustment recorded successfully", adjustment });
    } catch (error) {
        console.error("Adjustment Error:", error);
        res.status(400).json({ message: error.message || "Error recording adjustment" });
    }
};

module.exports.getAllAdjustments = async (req, res) => {
    try {
        const adjustments = await Adjustment.find()
            .populate('adjustedBy', 'name')
            .populate('product', 'name sku')
            .sort({ createdAt: -1 });
        res.json(adjustments);
    } catch (error) {
        res.status(500).json({ message: "Error fetching adjustments" });
    }
};

module.exports.getAdjustmentsByProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const adjustments = await Adjustment.find({ product: productId })
            .populate('adjustedBy', 'name')
            .populate('product', 'name sku')
            .sort({ createdAt: -1 });
        res.json(adjustments);
    } catch (error) {
        res.status(500).json({ message: "Error fetching adjustments" });
    }
};
