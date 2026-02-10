const Purchase = require('../models/Purchasemodel');
const Supplier = require('../models/Suppliermodel');
const { updateStock } = require('../utils/stockUtils');
const logActivity = require("../libs/logger");

module.exports.addPurchase = async (req, res) => {
    try {
        const { supplierId, items, invoiceNumber, paymentType, notes, purchaseDate } = req.body;
        const userId = req.user._id;

        if (!supplierId || !items || !items.length) {
            return res.status(400).json({ message: "Supplier and at least one item are required." });
        }

        const supplier = await Supplier.findById(supplierId);
        if (!supplier) throw new Error("Supplier not found.");
        if (supplier.status !== 'Active') throw new Error("Cannot purchase from an inactive supplier.");

        let calculatedTotal = 0;
        const processedItems = [];

        // 1. Process Stock Updates
        for (const item of items) {
            const { productId, quantity, costPrice, batchNumber, expiryDate } = item;

            // Fetch product with category to check status
            const Product = require('../models/Productmodel');
            const productDoc = await Product.findById(productId).populate('category');

            if (!productDoc) throw new Error(`Product with ID ${productId} not found.`);
            if (productDoc.category && productDoc.category.status !== 'Active') {
                throw new Error(`Cannot purchase product '${productDoc.name}' because its category '${productDoc.category.name}' is inactive.`);
            }
            if (productDoc.status !== 'Active') {
                throw new Error(`Cannot purchase product '${productDoc.name}' because it is inactive.`);
            }

            // Use updateStock utility with purchasePrice for WAC calculation
            const { product } = await updateStock({
                productId,
                quantity: Number(quantity),
                type: 'IN',
                reason: `Purchase Invoice: ${invoiceNumber || 'NEW'}`,
                userId,
                supplierId,
                purchasePrice: Number(costPrice)
            });

            calculatedTotal += Number(quantity) * Number(costPrice);
            processedItems.push({
                product: productId,
                quantity: Number(quantity),
                costPrice: Number(costPrice),
                batchNumber,
                expiryDate
            });
        }

        // 2. Create Purchase Master Record
        const newPurchase = new Purchase({
            invoiceNumber,
            supplier: supplierId,
            items: processedItems,
            totalAmount: calculatedTotal,
            paymentType: paymentType || "Cash",
            notes,
            purchaseDate: purchaseDate || Date.now()
        });
        await newPurchase.save();

        // 3. Activity Log
        await logActivity({
            action: "Add Purchase",
            description: `Recorded purchase ${invoiceNumber || newPurchase._id} from ${supplier.name}.`,
            entity: "purchase",
            entityId: newPurchase._id,
            userId: userId,
            ipAddress: req.ip
        });

        res.status(201).json({ message: "Purchase recorded successfully", purchase: newPurchase });

    } catch (error) {
        console.error("Purchase Error:", error);
        res.status(400).json({ message: error.message || "Error recording purchase" });
    }
};

module.exports.getPurchaseHistory = async (req, res) => {
    try {
        const history = await Purchase.find()
            .populate('items.product', 'name sku unit')
            .populate('supplier', 'name email pan_vat')
            .sort({ purchaseDate: -1 });
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: "Error fetching history", error: error.message });
    }
};
