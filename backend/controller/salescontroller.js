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

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${sale.invoiceNumber || id}.pdf`);

    doc.pipe(res);

    // Dynamic Logo if exists
    if (settings.company_logo) {
      try {
        // Extract base64 content
        const base64Data = settings.company_logo.split(';base64,').pop();
        const logoBuffer = Buffer.from(base64Data, 'base64');
        doc.image(logoBuffer, 50, 45, { width: 50 });
      } catch (err) {
        console.error("Logo render error", err);
      }
    }

    // Header - Dynamic from Settings - CENTER ALIGNED
    doc.fillColor("#444444")
      .fontSize(20)
      .text(settings.company_name || "INVENTORY SYSTEM", 50, 50, { align: "center", width: 500 })
      .fontSize(10)
      .text(settings.company_address || "Nepal", 50, 75, { align: "center", width: 500 })
      .text(`Phone: ${settings.company_phone || "N/A"} | Email: ${settings.company_email || "N/A"}`, 50, 90, { align: "center", width: 500 })
      .moveDown();

    doc.strokeColor("#aaaaaa")
      .lineWidth(1)
      .moveTo(50, 115)
      .lineTo(550, 115)
      .stroke();

    doc.moveDown(2);

    // Invoice Info
    doc.fontSize(16).text("TAX INVOICE", { align: "right" });
    doc.fontSize(10).text(`Invoice Number: ${sale.invoiceNumber.toUpperCase()}`, { align: "right" });
    doc.text(`Date: ${new Date(sale.saleDate).toLocaleDateString()}`, { align: "right" });
    doc.text(`Payment Method: ${sale.paymentType.toUpperCase()}`, { align: "right" });
    if (settings.company_pan) doc.text(`PAN/VAT: ${settings.company_pan}`, { align: "right" });

    doc.moveDown();
    doc.fontSize(12).text(`Bill To: ${sale.customerName || "Walking Customer"}`, { align: "left" });
    doc.moveDown();

    // Table Header
    const tableTop = 250;
    doc.font("Helvetica-Bold");
    doc.text("Item", 50, tableTop);
    doc.text("Quantity", 300, tableTop, { width: 90, align: "right" });
    doc.text("Price", 400, tableTop, { width: 90, align: "right" });
    doc.text("Total", 500, tableTop, { width: 50, align: "right" });

    doc.strokeColor("#aaaaaa")
      .lineWidth(1)
      .moveTo(50, tableTop + 15)
      .lineTo(550, tableTop + 15)
      .stroke();

    // Items
    let y = tableTop + 30;
    doc.font("Helvetica");

    sale.products.forEach(item => {
      const itemTotal = item.quantity * item.price;
      doc.text(item.name, 50, y);
      doc.text(item.quantity, 300, y, { width: 90, align: "right" });
      doc.text(item.price.toFixed(2), 400, y, { width: 90, align: "right" });
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

    doc.font("Helvetica").fontSize(10);
    doc.text("Subtotal:", 400, y, { width: 90, align: "right" });
    doc.text(`${settings.currency_symbol || 'Rs.'} ${sale.subtotal.toFixed(2)}`, 500, y, { width: 50, align: "right" });
    y += 15;

    doc.text(`Discount (${sale.discountPercentage}%):`, 400, y, { width: 90, align: "right" });
    doc.text(`- ${settings.currency_symbol || 'Rs.'} ${sale.discountAmount.toFixed(2)}`, 500, y, { width: 50, align: "right" });
    y += 15;

    doc.text(`Tax (${sale.taxPercentage}%):`, 400, y, { width: 90, align: "right" });
    doc.text(`+ ${settings.currency_symbol || 'Rs.'} ${sale.taxAmount.toFixed(2)}`, 500, y, { width: 50, align: "right" });
    y += 20;

    doc.font("Helvetica-Bold").fontSize(12);
    doc.text("Grand Total:", 400, y, { width: 90, align: "right" });
    doc.text(`${settings.currency_symbol || 'Rs.'} ${sale.totalAmount.toFixed(2)}`, 500, y, { width: 50, align: "right" });

    // Generated By Section
    doc.moveDown(4);
    doc.fontSize(10).font("Helvetica-Bold")
      .text(`Bill Generated By: ${sale.soldBy?.full_name || "Admin"}`, 50, doc.y, { align: "left" });

    // Footer - Dynamic from Settings
    doc.fontSize(10).font("Helvetica")
      .text(settings.invoice_footer || "Thank you for your business!", 50, 700, { align: "center", width: 500 });

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
