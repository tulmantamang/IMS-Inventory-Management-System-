const Sale = require('../models/Salesmodel');
const Product = require('../models/Productmodel');
const Supplier = require('../models/Suppliermodel');
const Category = require('../models/Categorymodel');
const StockLog = require('../models/StockLogmodel');
const ActivityLog = require('../models/ActivityLogmodel');
const PDFDocument = require('pdfkit');

// Helper to generate PDF header
const generateHeader = (doc, title) => {
    doc.fillColor("#444444")
        .fontSize(20)
        .text("Advanced Inventory Management System", 110, 57)
        .fontSize(10)
        .text("System Reports", 200, 80, { align: "right" })
        .text(title, 200, 95, { align: "right" })
        .moveDown();
    doc.lineCap('butt').moveTo(50, 115).lineTo(550, 115).stroke();
};

module.exports.getSalesReport = async (req, res) => {
    try {
        const { startDate, endDate, format } = req.query;
        let query = {};
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
            };
        }

        const sales = await Sale.find(query).sort({ createdAt: -1 });

        if (format === 'pdf') {
            const doc = new PDFDocument({ margin: 50 });
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=Sales_Report_${startDate || 'All'}.pdf`);
            doc.pipe(res);

            generateHeader(doc, "Sales Report");

            doc.fontSize(12).text(`Period: ${startDate || 'All Time'} to ${endDate || 'Present'}`).moveDown();

            // Table Header
            let y = 160;
            doc.fontSize(10).font('Helvetica-Bold');
            doc.text("Customer", 50, y);
            doc.text("Date", 150, y);
            doc.text("Method", 250, y);
            doc.text("Status", 350, y);
            doc.text("Amount", 450, y, { align: 'right' });

            y += 20;
            doc.font('Helvetica').fontSize(9);
            let total = 0;

            sales.forEach(sale => {
                doc.text(sale.customerName, 50, y);
                doc.text(new Date(sale.createdAt).toLocaleDateString(), 150, y);
                doc.text(sale.paymentMethod, 250, y);
                doc.text(sale.paymentStatus, 350, y);
                doc.text(`Rs. ${sale.totalAmount.toLocaleString()}`, 450, y, { align: 'right' });
                total += sale.totalAmount;
                y += 20;
                if (y > 700) { doc.addPage(); y = 50; }
            });

            doc.moveDown().fontSize(12).font('Helvetica-Bold').text(`Total Revenue: Rs. ${total.toLocaleString()}`, { align: 'right' });
            doc.end();
        } else {
            res.status(200).json(sales);
        }
    } catch (error) {
        res.status(500).json({ message: "Error generating sales report", error: error.message });
    }
};

module.exports.getStockReport = async (req, res) => {
    try {
        const products = await Product.find({ isDeleted: false }).populate('category supplier');

        const doc = new PDFDocument({ margin: 50 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=Inventory_Stock_Report.pdf');
        doc.pipe(res);

        generateHeader(doc, "Inventory Stock Report");

        let y = 140;
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text("Product (SKU)", 50, y);
        doc.text("Category", 200, y);
        doc.text("Supplier", 300, y);
        doc.text("Stock", 400, y, { align: 'right' });
        doc.text("Price", 500, y, { align: 'right' });

        y += 20;
        doc.font('Helvetica').fontSize(8);

        products.forEach(p => {
            doc.text(`${p.name} (${p.sku})`, 50, y);
            doc.text(p.category?.name || "N/A", 200, y);
            doc.text(p.supplier?.name || "N/A", 300, y);
            doc.text(`${p.stockQuantity} ${p.unit}`, 400, y, { align: 'right' });
            doc.text(`Rs. ${p.price}`, 500, y, { align: 'right' });
            y += 20;
            if (y > 700) { doc.addPage(); y = 50; }
        });

        doc.end();
    } catch (error) {
        res.status(500).json({ message: "Error generating stock report" });
    }
};

module.exports.getSupplierReport = async (req, res) => {
    try {
        const suppliers = await Supplier.find();
        const doc = new PDFDocument({ margin: 50 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=Supplier_Contact_Report.pdf');
        doc.pipe(res);

        generateHeader(doc, "Supplier Contact List");

        let y = 140;
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text("Supplier Name", 50, y);
        doc.text("Contact Person", 150, y);
        doc.text("Phone", 250, y);
        doc.text("Email", 350, y);
        doc.text("Status", 450, y);

        y += 20;
        doc.font('Helvetica').fontSize(9);

        suppliers.forEach(s => {
            doc.text(s.name, 50, y);
            doc.text(s.contactPerson, 150, y);
            doc.text(s.phone, 250, y);
            doc.text(s.email, 350, y);
            doc.text(s.status, 450, y);
            y += 20;
            if (y > 700) { doc.addPage(); y = 50; }
        });

        doc.end();
    } catch (error) {
        res.status(500).json({ message: "Error generating supplier report" });
    }
};

module.exports.getActivityReport = async (req, res) => {
    try {
        const logs = await ActivityLog.find().populate('userId', 'name role').sort({ createdAt: -1 }).limit(100);
        const doc = new PDFDocument({ margin: 50 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=Activity_Logs.pdf');
        doc.pipe(res);

        generateHeader(doc, "System Activity Logs (Last 100)");

        let y = 140;
        doc.fontSize(9).font('Helvetica-Bold');
        doc.text("Date/Time", 50, y);
        doc.text("User", 150, y);
        doc.text("Action", 250, y);
        doc.text("Description", 350, y);

        y += 20;
        doc.font('Helvetica').fontSize(8);

        logs.forEach(l => {
            doc.text(new Date(l.createdAt).toLocaleString(), 50, y);
            doc.text(l.userId?.name || "System", 150, y);
            doc.text(l.action, 250, y);
            doc.text(l.description, 350, y, { width: 200 });
            y += 25;
            if (y > 700) { doc.addPage(); y = 50; }
        });

        doc.end();
    } catch (error) {
        res.status(500).json({ message: "Error generating activity report" });
    }
};
