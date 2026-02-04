const Sale = require('../models/Salesmodel');
const Product = require('../models/Productmodel');
const logActivity = require('../libs/logger');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');
const StockLog = require('../models/StockLogmodel');

module.exports.createSale = async (req, res) => {
  try {
    const { customerName, products, paymentType, notes, saleDate, invoiceNumber } = req.body;
    const userId = req.user._id;

    if (!products || !products.length) {
      throw new Error("At least one product is required for a sale.");
    }

    let calculatedTotal = 0;
    const processedProducts = [];
    const stockLogs = [];

    // 1. Initial Validation Loop (Don't modify DB yet)
    // We check all products first to ensure they exist and have stock
    for (const item of products) {
      const { product: productId, quantity } = item;

      if (!productId || quantity === undefined || quantity === null || Number(quantity) <= 0) {
        throw new Error("Invalid product or quantity. Quantity must be greater than zero.");
      }

      const productDoc = await Product.findById(productId);
      if (!productDoc) throw new Error(`Product not found: ${productId}`);

      if (productDoc.stockQuantity < Number(quantity)) {
        throw new Error(`Insufficient stock for ${productDoc.name}. Available: ${productDoc.stockQuantity}, Requested: ${quantity}`);
      }
    }

    // 2. Processing Loop (Apply updates)
    for (const item of products) {
      const { product: productId, quantity, price, batchNumber } = item;

      const productDoc = await Product.findById(productId);

      // Deduct Stock
      productDoc.stockQuantity -= Number(quantity);
      await productDoc.save();

      const itemPrice = Number(price || productDoc.price);
      calculatedTotal += itemPrice * Number(quantity);

      processedProducts.push({
        product: productId,
        name: productDoc.name,
        quantity: Number(quantity),
        price: itemPrice,
        batchNumber: batchNumber || productDoc.batchNumber
      });

      // Prepare Stock Log data
      stockLogs.push({
        product: productId,
        type: 'OUT',
        quantity: Number(quantity),
        reason: `Sale Invoice: ${invoiceNumber || 'NEW_SALE'}`,
        performedBy: userId,
        date: saleDate || new Date()
      });
    }

    // 3. Create Sale Record
    const sale = new Sale({
      invoiceNumber: invoiceNumber || `INV-${Date.now()}`,
      customerName: customerName || "Walking Customer",
      products: processedProducts,
      totalAmount: calculatedTotal,
      paymentType: paymentType || "Cash",
      notes,
      soldBy: userId,
      saleDate: saleDate || Date.now()
    });

    await sale.save();

    // 4. Save Stock Logs
    for (const logData of stockLogs) {
      logData.reason = `Sale Invoice: ${sale.invoiceNumber}`;
      const log = new StockLog(logData);
      await log.save();
    }

    // 5. Activity Log
    await logActivity({
      action: "New Multi-item Sale",
      description: `Sale ${sale.invoiceNumber} to ${sale.customerName}. Total: Rs.${calculatedTotal}`,
      entity: "sale",
      entityId: sale._id,
      userId: userId,
      ipAddress: req.ip
    });

    res.status(201).json({ message: "Sale recorded successfully", sale });

  } catch (error) {
    console.error("Sale Error:", error);
    res.status(400).json({ message: error.message || "Error recording sale" });
  }
};

module.exports.generateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const sale = await Sale.findById(id).populate('soldBy', 'name');

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${sale.transactionId}.pdf`);

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
    doc.fontSize(16).text("TAX INVOICE", { align: "right" });
    doc.fontSize(10).text(`Invoice Number: ${sale.invoiceNumber.toUpperCase()}`, { align: "right" });
    doc.text(`Date: ${new Date(sale.saleDate).toLocaleDateString()}`, { align: "right" });
    doc.text(`Payment Method: ${sale.paymentType.toUpperCase()}`, { align: "right" });

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
    doc.font("Helvetica-Bold").fontSize(12);
    doc.text("Grand Total:", 400, y, { width: 90, align: "right" });
    doc.text(sale.totalAmount.toFixed(2), 500, y, { width: 50, align: "right" });

    // Footer
    doc.fontSize(10)
      .text("Thank you for your business!", 50, 700, { align: "center", width: 500 });

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
