const Purchase = require('../models/Purchasemodel');
const Supplier = require('../models/Suppliermodel');
const { updateStock } = require('../utils/stockUtils');
const logActivity = require("../libs/logger");
const PDFDocument = require('pdfkit');

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

module.exports.generatePurchaseInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("Generating Invoice for Purchase ID:", id);

        const purchase = await Purchase.findById(id)
            .populate('supplier', 'name email pan_vat address')
            .populate('items.product', 'name sku');

        if (!purchase) {
            console.error("Purchase not found for ID:", id);
            return res.status(404).json({ message: "Purchase not found" });
        }

        console.log("Purchase data retrieved. Starting PDF generation...");

        const doc = new PDFDocument({ margin: 50 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=purchase-invoice-${purchase.invoiceNumber || id}.pdf`);

        doc.pipe(res);

        // Header
        doc.fillColor("#444444")
            .fontSize(20)
            .text("INVENTORY MANAGEMENT SYSTEM", { align: "center" })
            .fontSize(10)
            .text("123 Business Street, Kathmandu, Nepal", { align: "center" })
            .text("Phone: +977-9800000000", { align: "center" })
            .moveDown();

        doc.strokeColor("#aaaaaa")
            .lineWidth(1)
            .moveTo(50, doc.y)
            .lineTo(550, doc.y)
            .stroke();

        doc.moveDown();

        // Invoice Info
        doc.fontSize(16).text("PURCHASE ORDER", { align: "right" });
        doc.fontSize(10).text(`Invoice Number: ${String(purchase.invoiceNumber || "N/A").toUpperCase()}`, { align: "right" });
        doc.text(`Date: ${new Date(purchase.purchaseDate).toLocaleDateString()}`, { align: "right" });
        doc.text(`Payment Method: ${String(purchase.paymentType || "Cash").toUpperCase()}`, { align: "right" });

        doc.moveDown();
        doc.fontSize(12).text(`Vendor: ${String(purchase.supplier?.name || "N/A")}`, { align: "left" });
        doc.fontSize(10).text(`PAN/VAT: ${String(purchase.supplier?.pan_vat || "N/A")}`, { align: "left" });
        doc.text(`Email: ${String(purchase.supplier?.email || "N/A")}`, { align: "left" });
        doc.moveDown();

        // Table Header
        const tableTop = 260;
        doc.font("Helvetica-Bold");
        doc.text("Product", 50, tableTop);
        doc.text("Quantity", 300, tableTop, { width: 90, align: "right" });
        doc.text("Unit Cost", 400, tableTop, { width: 90, align: "right" });
        doc.text("Total", 500, tableTop, { width: 50, align: "right" });

        doc.strokeColor("#aaaaaa")
            .lineWidth(1)
            .moveTo(50, tableTop + 15)
            .lineTo(550, tableTop + 15)
            .stroke();

        // Items
        let y = tableTop + 30;
        doc.font("Helvetica");

        purchase.items.forEach(item => {
            const qty = item.quantity || 0;
            const cost = item.costPrice || 0;
            const itemTotal = qty * cost;

            doc.text(String(item.product?.name || "Deleted Product"), 50, y);
            doc.text(String(qty), 300, y, { width: 90, align: "right" });
            doc.text(cost.toFixed(2), 400, y, { width: 90, align: "right" });
            doc.text(itemTotal.toFixed(2), 500, y, { width: 50, align: "right" });
            y += 20;
        });

        doc.strokeColor("#aaaaaa")
            .lineWidth(1)
            .moveTo(50, y)
            .lineTo(550, y)
            .stroke();

        // Total
        y += 20;
        doc.font("Helvetica-Bold").fontSize(12);
        doc.text("Grand Total:", 400, y, { width: 90, align: "right" });
        doc.text(Number(purchase.totalAmount || 0).toFixed(2), 500, y, { width: 50, align: "right" });

        // Footer
        doc.fontSize(10)
            .text("Purchase recorded in the inventory system.", 50, 700, { align: "center", width: 500 });

        doc.end();
        console.log("PDF generation complete.");

    } catch (error) {
        console.error("Purchase Invoice Error Detail:", error);
        if (!res.headersSent) {
            res.status(500).json({ message: "Error generating purchase invoice", error: error.message });
        }
    }
};
