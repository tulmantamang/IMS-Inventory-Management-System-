const Purchase = require('../models/Purchasemodel');
const Supplier = require('../models/Suppliermodel');
const { updateStock } = require('../utils/stockUtils');
const logActivity = require("../libs/logger");
const PDFDocument = require('pdfkit');

module.exports.addPurchase = async (req, res) => {
    try {
        const {
            supplierId, items, invoiceNumber, paymentType, notes, purchaseDate,
            discountPercentage, taxPercentage
        } = req.body;
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

        // 2. Financial Calculations
        const subtotal = calculatedTotal;
        const discountPerc = Number(discountPercentage) || 0;
        const discountAmt = subtotal * (discountPerc / 100);
        const taxPerc = Number(taxPercentage) || 0;
        const taxAmt = (subtotal - discountAmt) * (taxPerc / 100);
        const finalTotal = subtotal - discountAmt + taxAmt;

        // 3. Create Purchase Master Record
        const newPurchase = new Purchase({
            invoiceNumber,
            supplier: supplierId,
            items: processedItems,
            subtotal,
            discountPercentage: discountPerc,
            discountAmount: discountAmt,
            taxPercentage: taxPerc,
            taxAmount: taxAmt,
            totalAmount: finalTotal,
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

    const doc = new PDFDocument({ margins: { top: 50, left: 50, right: 50, bottom: 30 } });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=purchase-invoice-${purchase.invoiceNumber || id}.pdf`);

        doc.pipe(res);

        const Setting = require('../models/Settingmodel');
        const settingsList = await Setting.find();
        const settings = settingsList.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});

        // ── Header Banner ────────────────────────────────────────────────────────
        doc.rect(0, 0, 612, 90).fill("#1E293B");

        if (settings.company_logo) {
            try {
                const base64Data = settings.company_logo.split(';base64,').pop();
                const logoBuffer = Buffer.from(base64Data, 'base64');
                doc.image(logoBuffer, 50, 18, { width: 45 });
            } catch (err) { console.error("Logo render error", err); }
        }

        doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(18)
            .text(settings.company_name || "INVENTORY SYSTEM", 50, 18, { align: "center", width: 512 });
        doc.fillColor("#94A3B8").font("Helvetica").fontSize(9)
            .text(`${settings.company_address || "Nepal"}   |   Phone: ${settings.company_phone || "N/A"}   |   ${settings.company_email || ""}`, 50, 42, { align: "center", width: 512 });

        // ── Two-column meta section ───────────────────────────────────────────────
        const metaY = 108;

        // Left: Vendor Info
        doc.fillColor("#64748B").font("Helvetica-Bold").fontSize(7)
            .text("VENDOR", 50, metaY);
        doc.fillColor("#1E293B").font("Helvetica-Bold").fontSize(11)
            .text(String(purchase.supplier?.name || "N/A"), 50, metaY + 12);
        
        doc.font("Helvetica").fontSize(8.5).fillColor("#374151");
        if (purchase.supplier?.pan_vat) doc.text(`PAN/VAT: ${purchase.supplier.pan_vat}`, 50, metaY + 26);
        if (purchase.supplier?.email)   doc.text(purchase.supplier.email, 50, metaY + 40);

        // Right: Invoice details
        doc.fillColor("#1E293B").font("Helvetica-Bold").fontSize(16)
            .text("PURCHASE ORDER", 250, metaY, { width: 300, align: "right" });

        const infoRight = 555;
        const infoLabelW = 120;
        let iy = metaY + 26;
        const infoRows = [
            ["Order No:", String(purchase.invoiceNumber || "N/A").toUpperCase()],
            ["Date:", new Date(purchase.purchaseDate).toLocaleDateString()],
            ["Payment:", String(purchase.paymentType || "Cash").toUpperCase()]
        ];
        doc.font("Helvetica").fontSize(8.5);
        infoRows.forEach(([label, val]) => {
            doc.fillColor("#64748B").text(label, infoRight - infoLabelW - 100, iy, { width: 95, align: "right" });
            doc.fillColor("#1E293B").font("Helvetica-Bold").text(val, infoRight - 100, iy, { width: 100, align: "right" });
            doc.font("Helvetica");
            iy += 14;
        });

        // Separator
        doc.strokeColor("#E2E8F0").lineWidth(1)
            .moveTo(50, metaY + 75).lineTo(562, metaY + 75).stroke();

        // ── Table ────────────────────────────────────────────────────────────────
        const tableTop = metaY + 88;
        const col = { item: 50, qty: 310, price: 395, total: 485 };
        const colW = { qty: 75, price: 80, total: 77 };

        // Header background
        doc.rect(50, tableTop - 5, 512, 20).fill("#1E293B");

        doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(8.5);
        doc.text("PRODUCT",          col.item,  tableTop, { width: 250 });
        doc.text("QTY",              col.qty,   tableTop, { width: colW.qty,   align: "right" });
        doc.text("UNIT COST",        col.price, tableTop, { width: colW.price, align: "right" });
        doc.text("TOTAL",            col.total, tableTop, { width: colW.total, align: "right" });

        // Items
        let y = tableTop + 22;
        doc.font("Helvetica").fontSize(9).fillColor("#1a1a1a");

        purchase.items.forEach((item, i) => {
            const qty = item.quantity || 0;
            const cost = item.costPrice || 0;
            const itemTotal = qty * cost;

            if (i % 2 === 0) doc.rect(50, y - 4, 512, 18).fill("#F8FAFC");
            doc.fillColor("#1a1a1a");

            doc.text(String(item.product?.name || "Deleted Product"), col.item,  y, { width: 250 });
            doc.text(String(qty),                                     col.qty,   y, { width: colW.qty,   align: "right" });
            doc.text(`Rs. ${cost.toFixed(2)}`,                        col.price, y, { width: colW.price, align: "right" });
            doc.text(`Rs. ${itemTotal.toFixed(2)}`,                   col.total, y, { width: colW.total, align: "right" });

            doc.strokeColor("#E2E8F0").lineWidth(0.5)
                .moveTo(50, y + 14).lineTo(562, y + 14).stroke();
            y += 20;
        });

        // Divider after items
        doc.strokeColor("#94A3B8").lineWidth(1)
            .moveTo(50, y).lineTo(562, y).stroke();

        // ── Totals breakdown ────────────────────────────────────────────────────
        y += 12;
        const curr = settings.currency_symbol || 'Rs.';
        const tLabelX = col.price;
        const tValX   = col.total;

        doc.font("Helvetica").fontSize(9).fillColor("#374151");
        
        doc.text("Subtotal:", tLabelX, y, { width: colW.price, align: "right" });
        doc.text(`${curr} ${Number(purchase.subtotal || purchase.totalAmount).toFixed(2)}`, tValX, y, { width: colW.total, align: "right" });
        y += 16;

        doc.text(`Discount (${purchase.discountPercentage || 0}%):`, tLabelX, y, { width: colW.price, align: "right" });
        doc.text(`- ${curr} ${Number(purchase.discountAmount || 0).toFixed(2)}`, tValX, y, { width: colW.total, align: "right" });
        y += 16;

        doc.text(`Tax (${purchase.taxPercentage || 0}%):`, tLabelX, y, { width: colW.price, align: "right" });
        doc.text(`+ ${curr} ${Number(purchase.taxAmount || 0).toFixed(2)}`, tValX, y, { width: colW.total, align: "right" });
        y += 18;

        // Grand Total row
        doc.rect(tLabelX - 10, y - 4, colW.price + colW.total + 20, 22).fill("#1E293B");
        doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(10);
        doc.text("GRAND TOTAL:", tLabelX, y, { width: colW.price, align: "right" });
        doc.text(`${curr} ${Number(purchase.totalAmount || 0).toFixed(2)}`, tValX, y, { width: colW.total, align: "right" });

        // ── Footer ───────────────────────────────────────────────────────────────
        const User = require('../models/Usermodel');
        const userDoc = await User.findById(req.user._id);

        const footerY = 710;
        doc.strokeColor("#CBD5E1").lineWidth(0.8)
            .moveTo(50, footerY).lineTo(562, footerY).stroke();

        doc.fillColor("#64748B").font("Helvetica").fontSize(8)
            .text("Purchase recorded in the inventory system.", 50, footerY + 8, { align: "center", width: 512 });

        doc.fillColor("#374151").font("Helvetica-Bold").fontSize(7.5)
            .text(`Generated By: ${userDoc?.full_name || 'System Administrator'}`, 50, footerY + 22, { align: "left" })
            .text(`Date printed: ${new Date().toLocaleString()}`,                  50, footerY + 22, { align: "right", width: 512 });

        doc.end();
        console.log("PDF generation complete.");

    } catch (error) {
        console.error("Purchase Invoice Error Detail:", error);
        if (!res.headersSent) {
            res.status(500).json({ message: "Error generating purchase invoice", error: error.message });
        }
    }
};
