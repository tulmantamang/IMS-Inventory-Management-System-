const Product = require('../models/Productmodel');
const Supplier = require('../models/Suppliermodel');
const Category = require('../models/Categorymodel');
const Sale = require('../models/Salesmodel');
const StockLog = require('../models/StockLogmodel');
const ActivityLog = require('../models/ActivityLogmodel');

module.exports.getDashboardStats = async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments({ isDeleted: false });
        const totalSuppliers = await Supplier.countDocuments({ status: 'Active' });
        const totalCategories = await Category.countDocuments();

        // 1. Total Available Stock Quantity
        const totalStockResult = await Product.aggregate([
            { $match: { isDeleted: false } },
            { $group: { _id: null, total: { $sum: "$stockQuantity" } } }
        ]);
        const totalAvailableStock = totalStockResult[0]?.total || 0;

        // 2. Today's Stock IN and Stock OUT Summary
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const stockFlow = await StockLog.aggregate([
            { $match: { createdAt: { $gte: startOfToday } } },
            { $group: { _id: "$type", total: { $sum: "$quantity" } } }
        ]);

        const todayStockIn = stockFlow.find(sf => sf._id === 'IN')?.total || 0;
        const todayStockOut = stockFlow.find(sf => sf._id === 'OUT')?.total || 0;

        // 3. Number of low-stock items
        const lowStockCount = await Product.countDocuments({
            isDeleted: false,
            $expr: { $lte: ["$stockQuantity", "$reorderLevel"] }
        });

        // Recent Activity Logs (Last 10)
        const recentActivities = await ActivityLog.find()
            .populate('userId', 'name role')
            .sort({ createdAt: -1 })
            .limit(10);

        // Inventory Value
        const products = await Product.find({ isDeleted: false });
        const inventoryValue = products.reduce((acc, curr) => {
            return acc + ((curr.stockQuantity || 0) * (curr.price || 0));
        }, 0);

        // Recent Sales
        const recentSales = await Sale.find().sort({ createdAt: -1 }).limit(10);
        const lifetimeSalesValue = await Sale.aggregate([
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);

        res.status(200).json({
            totalProducts,
            totalSuppliers,
            totalCategories,
            totalAvailableStock,
            todayStockIn,
            todayStockOut,
            lowStockCount,
            inventoryValue,
            totalSalesValue: lifetimeSalesValue[0]?.total || 0,
            recentSales,
            recentActivities
        });

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ message: "Error fetching dashboard stats", error: error.message });
    }
};
