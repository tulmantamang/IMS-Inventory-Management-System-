const Adjustment = require('../models/Adjustmentmodel');
const Product = require('../models/Productmodel');
const { updateStock } = require('../utils/stockUtils');
const logActivity = require("../libs/logger");

module.exports.createAdjustment = async (req, res) => {
    try {
        const { productId, type, quantity, reason, remarks } = req.body;
        const userId = req.user._id;

        // Validate required fields
        if (!productId || !type || quantity === undefined || !reason) {
            throw new Error("Missing required fields: Product, Type, Quantity, Reason.");
        }

        // Validate quantity is positive
        const adjustmentQty = Number(quantity);
        if (isNaN(adjustmentQty) || adjustmentQty <= 0) {
            throw new Error("Quantity must be a positive number greater than 0");
        }

        // Validate product exists and is active
        const product = await Product.findById(productId);
        if (!product) {
            throw new Error("Product not found");
        }
        if (product.status !== 'Active') {
            throw new Error("Cannot adjust inactive product. Only active products can be adjusted.");
        }

        // Validate adjustment type
        if (type !== 'INCREASE' && type !== 'DECREASE') {
            throw new Error("Invalid adjustment type. Must be INCREASE or DECREASE.");
        }

        // Validate reason based on type
        const INCREASE_REASONS = [
            "Physical Count Correction",
            "Initial Stock Entry",
            "Found Extra Stock",
            "System Entry Error",
            "Other"
        ];

        const DECREASE_REASONS = [
            "Damaged",
            "Expired",
            "Lost / Theft",
            "Internal Use",
            "System Entry Error",
            "Other"
        ];

        if (type === 'INCREASE' && !INCREASE_REASONS.includes(reason)) {
            throw new Error(`Invalid reason for INCREASE adjustment: ${reason}`);
        }

        if (type === 'DECREASE' && !DECREASE_REASONS.includes(reason)) {
            throw new Error(`Invalid reason for DECREASE adjustment: ${reason}`);
        }

        // For DECREASE, validate sufficient stock
        if (type === 'DECREASE') {
            if (product.total_stock < adjustmentQty) {
                throw new Error(`Insufficient stock. Available: ${product.total_stock}, Requested: ${adjustmentQty}`);
            }
        }

        // Calculate adjustment value: INCREASE = positive, DECREASE = negative
        const adjustmentValue = type === 'INCREASE' ? adjustmentQty : -adjustmentQty;

        // Use updateStock utility
        const { product: updatedProduct } = await updateStock({
            productId,
            quantity: adjustmentValue,
            type: 'ADJUST',
            reason: `${type}: ${reason}`,
            userId
        });

        // Create adjustment record
        const adjustment = new Adjustment({
            product: productId,
            type,
            quantity: adjustmentValue,
            reason,
            remarks: remarks || '',
            adjustedBy: userId
        });
        await adjustment.save();

        await logActivity({
            action: "Stock Adjustment",
            description: `${type} adjustment for ${updatedProduct.name}: ${adjustmentValue > 0 ? '+' : ''}${adjustmentValue}`,
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
