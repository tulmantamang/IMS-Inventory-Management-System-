const Sale = require('../models/Salesmodel');
const Product = require('../models/Productmodel');
const Setting = require('../models/Settingmodel');
const PDFDocument = require('pdfkit');
const { updateStock } = require('../utils/stockUtils');
const logActivity = require("../libs/logger");

// Helper to get settings as object
const getSettingsMap = async () => {
  const settings = await Setting.find();
  return settings.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {});
};

module.exports.createSale = async (req, res) => {
  try {
    const { customerName, products, paymentType, notes, saleDate, invoiceNumber } = req.body;
    const userId = req.user._id;
    const settings = await getSettingsMap();

    if (!products || !products.length) {
      return res.status(400).json({ message: "At least one product is required for a sale." });
    }

    // Check if negative stock is allowed
    const allowNegative = settings.allow_negative_stock === true;

    const invNum = invoiceNumber || `INV-${Date.now()}`;
    let calculatedTotal = 0;
    const processedProducts = [];

    // 1. Validation Loop
    for (const item of products) {
      const { product: productId, quantity } = item;
      if (!productId || !quantity || Number(quantity) <= 0) {
        return res.status(400).json({ message: "Invalid product or quantity." });
      }
      const productDoc = await Product.findById(productId);
      if (!productDoc) return res.status(404).json({ message: `Product not found: ${productId}` });
      if (productDoc.status !== 'Active') return res.status(400).json({ message: `Product ${productDoc.name} is Inactive.` });

      if (!allowNegative && productDoc.total_stock < Number(quantity)) {
        return res.status(400).json({ message: `Insufficient stock for ${productDoc.name}. Available: ${productDoc.total_stock}` });
      }
    }

    // ... rest of execution loop ...
    for (const item of products) {
      const { product: productId, quantity, price } = item;

      const { product: updatedProd } = await updateStock({
        productId,
        quantity: Number(quantity),
        type: 'OUT',
        reason: `Sale Invoice: ${invNum}`,
        userId
      });

      const itemPrice = Number(price || updatedProd.selling_price);
      calculatedTotal += itemPrice * Number(quantity);

      processedProducts.push({
        product: productId,
        name: updatedProd.name,
        quantity: Number(quantity),
        price: itemPrice,
        costPrice: updatedProd.current_cost_price,
      });
    }

    // 3. Create Sale Record
    const subtotal = calculatedTotal;
    const discountPerc = Number(req.body.discountPercentage) >= 0 ? Number(req.body.discountPercentage) : 10;
    const discountAmt = subtotal * (discountPerc / 100);

    const taxPerc = Number(req.body.taxPercentage) >= 0 ? Number(req.body.taxPercentage) : 13;
    const taxAmt = (subtotal - discountAmt) * (taxPerc / 100);

    const finalTotal = subtotal - discountAmt + taxAmt;

    const sale = new Sale({
      invoiceNumber: invNum,
      customerName: customerName || "Walking Customer",
      products: processedProducts,
      subtotal,
      discountPercentage: discountPerc,
      discountAmount: discountAmt,
      taxPercentage: taxPerc,
      taxAmount: taxAmt,
      totalAmount: finalTotal,
      paymentType: paymentType || "Cash",
      notes,
      soldBy: userId,
      saleDate: saleDate || Date.now()
    });

    await sale.save();

    await logActivity({
      action: "New Sale",
      description: `Sale ${sale.invoiceNumber} recorded. Total: Rs.${finalTotal}`,
      entity: "sale",
      entityId: sale._id,
      userId,
      ipAddress: req.ip
    });

    res.status(201).json({ message: "Sale recorded successfully", sale });

  } catch (error) {
    console.error("Sale Error:", error);
    res.status(500).json({ message: error.message || "Error recording sale" });
  }
};

module.exports.generateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const sale = await Sale.findById(id).populate('soldBy', 'full_name');
    const settings = await getSettingsMap();

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    const doc = new PDFDocument({ margins: { top: 50, left: 50, right: 50, bottom: 30 } });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${sale.invoiceNumber || id}.pdf`);

    doc.pipe(res);

    // ── Header Banner ────────────────────────────────────────────────────────
    doc.rect(0, 0, 612, 90).fill("#1E293B");

    // Logo (if set)
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

    // Left: Bill To
    doc.fillColor("#64748B").font("Helvetica-Bold").fontSize(7)
      .text("BILL TO", 50, metaY);
    doc.fillColor("#1E293B").font("Helvetica-Bold").fontSize(11)
      .text(sale.customerName || "Walking Customer", 50, metaY + 12);

    // Right: Invoice details
    doc.fillColor("#1E293B").font("Helvetica-Bold").fontSize(16)
      .text("TAX INVOICE", 350, metaY, { width: 200, align: "right" });

    const infoRight = 555;
    const infoLabelW = 120;
    let iy = metaY + 26;
    const infoRows = [
      ["Invoice No:", sale.invoiceNumber.toUpperCase()],
      ["Date:", new Date(sale.saleDate).toLocaleDateString()],
      ["Payment:", sale.paymentType.toUpperCase()],
      ...(settings.company_pan ? [["PAN/VAT:", settings.company_pan]] : []),
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
    doc.text("ITEM DESCRIPTION", col.item,  tableTop, { width: 250 });
    doc.text("QTY",              col.qty,   tableTop, { width: colW.qty,   align: "right" });
    doc.text("UNIT PRICE",       col.price, tableTop, { width: colW.price, align: "right" });
    doc.text("TOTAL",            col.total, tableTop, { width: colW.total, align: "right" });

    // Items
    let y = tableTop + 22;
    doc.font("Helvetica").fontSize(9).fillColor("#1a1a1a");

    sale.products.forEach((item, i) => {
      const itemTotal = item.quantity * item.price;
      if (i % 2 === 0) doc.rect(50, y - 4, 512, 18).fill("#F8FAFC");
      doc.fillColor("#1a1a1a");

      doc.text(item.name,                   col.item,  y, { width: 250 });
      doc.text(String(item.quantity),        col.qty,   y, { width: colW.qty,   align: "right" });
      doc.text(`Rs. ${item.price.toFixed(2)}`,   col.price, y, { width: colW.price, align: "right" });
      doc.text(`Rs. ${itemTotal.toFixed(2)}`,    col.total, y, { width: colW.total, align: "right" });

      doc.strokeColor("#E2E8F0").lineWidth(0.5)
        .moveTo(50, y + 14).lineTo(562, y + 14).stroke();
      y += 20;
    });
    // Divider after items
    doc.strokeColor("#94A3B8").lineWidth(1)
      .moveTo(50, y).lineTo(562, y).stroke();

    // ── Totals ───────────────────────────────────────────────────────────────
    const curr = settings.currency_symbol || 'Rs.';
    y += 12;

    const tLabelX = col.price;
    const tValX   = col.total;

    doc.font("Helvetica").fontSize(9).fillColor("#374151");
    doc.text("Subtotal:",                       tLabelX, y, { width: colW.price, align: "right" });
    doc.text(`${curr} ${sale.subtotal.toFixed(2)}`,      tValX, y, { width: colW.total, align: "right" });
    y += 16;

    doc.text(`Discount (${sale.discountPercentage}%):`,  tLabelX, y, { width: colW.price, align: "right" });
    doc.text(`- ${curr} ${sale.discountAmount.toFixed(2)}`, tValX, y, { width: colW.total, align: "right" });
    y += 16;

    doc.text(`Tax (${sale.taxPercentage}%):`,            tLabelX, y, { width: colW.price, align: "right" });
    doc.text(`+ ${curr} ${sale.taxAmount.toFixed(2)}`,   tValX, y, { width: colW.total, align: "right" });
    y += 18;

    // Grand Total row
    doc.rect(tLabelX - 10, y - 4, colW.price + colW.total + 20, 22).fill("#1E293B");
    doc.fillColor("#FFFFFF").font("Helvetica-Bold").fontSize(10);
    doc.text("GRAND TOTAL:",                             tLabelX, y, { width: colW.price, align: "right" });
    doc.text(`${curr} ${sale.totalAmount.toFixed(2)}`,   tValX,   y, { width: colW.total, align: "right" });

    // ── Footer ───────────────────────────────────────────────────────────────
    const footerY = 710;
    doc.strokeColor("#CBD5E1").lineWidth(0.8)
      .moveTo(50, footerY).lineTo(562, footerY).stroke();

    doc.fillColor("#64748B").font("Helvetica").fontSize(8)
      .text(settings.invoice_footer || "Thank you for your business!", 50, footerY + 8, { align: "center", width: 512 });

    doc.fillColor("#374151").font("Helvetica-Bold").fontSize(7.5)
      .text(`Generated By: ${sale.soldBy?.full_name || "Admin"}`, 50, footerY + 22, { align: "left" })
      .text(`Printed: ${new Date().toLocaleString()}`,            50, footerY + 22, { align: "right", width: 512 });

    doc.end();

  } catch (error) {
    console.error("Invoice Error:", error);
    res.status(500).json({ message: "Error generating invoice" });
  }
};

module.exports.getSales = async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate('soldBy', 'name')
      .populate('products.product', 'name sku')
      .sort({ saleDate: -1 });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: "Error fetching sales", error: error.message });
  }
};
