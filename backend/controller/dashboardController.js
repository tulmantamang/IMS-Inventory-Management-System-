const Product = require('../models/Productmodel');
const Supplier = require('../models/Suppliermodel');
const Category = require('../models/Categorymodel');
const Sale = require('../models/Salesmodel');
const Purchase = require('../models/Purchasemodel');
const StockLog = require('../models/StockLogmodel');
const Setting = require('../models/Settingmodel');

/**
 * Advanced Dashboard Business Intelligence Controller
 * 
 * Implements 10 business intelligence algorithms:
 * 1. Sales Growth Percentage (Weekly)
 * 2. Monthly Profit Calculation
 * 3. Stock Movement Velocity (Last 30 Days)
 * 4. Dead Stock & Slow Stock Detection
 * 5. Stock Health Ratio (Coverage-Based)
 * 6. Reorder Prediction (Rule-Based)
 * 7. Low & Critical Stock Detection
 * 8. Inventory Value Calculation
 * 9. Daily Summary
 * 10. Rule-Based Alert Engine
 */

module.exports.getDashboardSummary = async (req, res) => {
    try {
        // Calculate date ranges once for reuse
        const now = new Date();
        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);

        const startOfCurrentWeek = new Date(now);
        startOfCurrentWeek.setDate(now.getDate() - now.getDay()); // Sunday
        startOfCurrentWeek.setHours(0, 0, 0, 0);

        const startOfPreviousWeek = new Date(startOfCurrentWeek);
        startOfPreviousWeek.setDate(startOfPreviousWeek.getDate() - 7);

        const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(now.getDate() - 30);

        const ninetyDaysAgo = new Date(now);
        ninetyDaysAgo.setDate(now.getDate() - 90);

        const fifteenDaysAgo = new Date(now);
        fifteenDaysAgo.setDate(now.getDate() - 15);

        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(now.getDate() - 7);

        const twentyFourHoursAgo = new Date(now);
        twentyFourHoursAgo.setHours(now.getHours() - 24);

        // Legacy fields for backward compatibility
        const [totalProducts, totalSuppliers, totalCategories, totalAvailableStock, totalSalesValue, recentSales, recentActivities] = await Promise.all([
            Product.countDocuments({ status: 'Active' }),
            require('../models/Suppliermodel').countDocuments({ status: 'Active' }),
            Category.countDocuments(),
            Product.aggregate([
                { $match: { status: 'Active' } },
                { $group: { _id: null, total: { $sum: "$total_stock" } } }
            ]).then(result => result[0]?.total || 0),
            Sale.aggregate([
                { $group: { _id: null, total: { $sum: "$totalAmount" } } }
            ]).then(result => result[0]?.total || 0),
            Sale.find().sort({ createdAt: -1 }).limit(10),
            StockLog.find()
                .sort({ createdAt: -1 })
                .limit(10)
                .populate('product', 'name')
                .populate('performedBy', 'full_name')
        ]);

        // Execute all independent calculations in parallel for performance
        const [
            todayStockInOut,
            salesGrowth,
            monthlyProfit,
            stockVelocity,
            deadSlowStock,
            stockHealth,
            reorderPredictionResult,
            productDerivedStats,
            inventoryValueSevenDaysAgo,
            topAndLeastSellingProducts,
            highValueSales,
            highValuePurchases,
            dailyRevenue
        ] = await Promise.all([
            // 1. Daily Summary (Today's Stock IN and OUT)
            calculateDailyStockInOut(startOfToday),

            // 2. Sales Growth Percentage (Weekly)
            calculateSalesGrowth(startOfCurrentWeek, startOfPreviousWeek),

            // 3. Monthly Profit Calculation (Corrected for discounts)
            calculateMonthlyProfit(startOfCurrentMonth),

            // 4. Stock Movement Velocity (Last 30 Days)
            calculateStockVelocity(thirtyDaysAgo),

            // 5. Dead Stock & Slow Stock Detection (15/30 days)
            calculateDeadSlowStock(fifteenDaysAgo, thirtyDaysAgo),

            // 6. Stock Health Ratio (Coverage-Based)
            calculateStockHealth(thirtyDaysAgo),

            // 7. Reorder Prediction (Rule-Based)
            calculateReorderPrediction(thirtyDaysAgo),

            // 8. Optimized Product Metrics (Combined Aggregation)
            calculateProductStats(),

            // 9. Inventory Value 7 Days Ago (for change percentage)
            calculateInventoryValueAtDate(sevenDaysAgo),

            // 10. Top and Least Selling Products (Last 7 Days)
            calculateTopAndLeastSellingProducts(sevenDaysAgo),

            // 11. High value sales & purchases in last 24h
            calculateHighValueSales(twentyFourHoursAgo, 30000),
            calculateHighValuePurchases(twentyFourHoursAgo, 30000),

            // 12. Daily Revenue (Last 7 Days)
            calculateDailyRevenue(sevenDaysAgo)
        ]);

        const { inventoryValue: inventoryValueData, lowStockCount, criticalStockCount, lowStockDetails } = productDerivedStats;
        const reorderRequiredCount = reorderPredictionResult.reorderRequiredCount;
        const reorderDetails = reorderPredictionResult.reorderDetails;

        // Calculate inventory value change percentage
        const inventoryValueChangePercent = inventoryValueSevenDaysAgo > 0
            ? ((inventoryValueData - inventoryValueSevenDaysAgo) / inventoryValueSevenDaysAgo) * 100
            : 0;

        // Generate rule-based alerts
        const alerts = generateAlerts({
            criticalStockDetails: lowStockDetails.filter(p => p.status === 'Critical'),
            deadStockDetails: deadSlowStock.deadStockDetails,
            salesGrowthPercent: salesGrowth,
            reorderDetails: reorderDetails,
            highValueSales: highValueSales,
            highValuePurchases: highValuePurchases
        });

        // Return comprehensive dashboard summary
        res.status(200).json({
            // Legacy fields (backward compatibility)
            totalProducts,
            totalSuppliers,
            totalCategories,
            totalAvailableStock,
            totalSalesValue,
            recentSales,
            recentActivities,
            // New BI metrics
            todayStockIn: todayStockInOut.stockIn,
            todayStockOut: todayStockInOut.stockOut,
            salesGrowthPercent: parseFloat(salesGrowth.toFixed(2)),
            inventoryValue: parseFloat(inventoryValueData.toFixed(2)),
            inventoryValueChangePercent: parseFloat(inventoryValueChangePercent.toFixed(2)),
            fastMovingCount: stockVelocity.fastMovingCount,
            mediumMovingCount: stockVelocity.mediumMovingCount,
            slowMovingCount: stockVelocity.slowMovingCount,
            slowStockCount: deadSlowStock.slowStockCount,
            deadStockCount: deadSlowStock.deadStockCount,
            deadStockDetails: deadSlowStock.deadStockDetails,
            lowStockCount: lowStockCount,
            criticalStockCount: criticalStockCount,
            healthyStockCount: stockHealth.healthyStockCount,
            overstockCount: stockHealth.overstockCount,
            criticalCoverageCount: stockHealth.criticalCoverageCount,
            reorderRequiredCount: reorderRequiredCount,
            alerts: alerts,
            dailyRevenue: dailyRevenue,
            // New Detail Arrays
            lowStockDetails: lowStockDetails,
            mostSellingProducts: topAndLeastSellingProducts.mostSellingProducts,
            leastSellingProducts: topAndLeastSellingProducts.leastSellingProducts,
            // Comparison Data
            monthlyRevenue: parseFloat(monthlyProfit.totalRevenue.toFixed(2)),
            monthlyProfit: parseFloat(monthlyProfit.profit.toFixed(2))
        });

    } catch (error) {
        console.error("Dashboard Summary Error:", error);
        res.status(500).json({
            message: "Error fetching dashboard summary",
            error: error.message
        });
    }
};

// ========================================
// HELPER FUNCTIONS FOR EACH ALGORITHM
// ========================================

/**
 * Algorithm 1: Daily Summary - Today's Stock IN and OUT
 */
async function calculateDailyStockInOut(startOfToday) {
    const stockFlow = await StockLog.aggregate([
        { $match: { createdAt: { $gte: startOfToday } } },
        { $group: { _id: "$type", total: { $sum: "$quantity" } } }
    ]);

    const stockIn = stockFlow.find(sf => sf._id === 'IN')?.total || 0;
    const stockOut = stockFlow.find(sf => sf._id === 'OUT')?.total || 0;

    return { stockIn, stockOut };
}

/**
 * Algorithm 2: Sales Growth Percentage (Weekly)
 * Formula: ((CurrentWeek - PreviousWeek) / PreviousWeek) × 100
 */
async function calculateSalesGrowth(startOfCurrentWeek, startOfPreviousWeek) {
    const currentWeekSales = await Sale.aggregate([
        { $match: { saleDate: { $gte: startOfCurrentWeek } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);

    const previousWeekSales = await Sale.aggregate([
        {
            $match: {
                saleDate: {
                    $gte: startOfPreviousWeek,
                    $lt: startOfCurrentWeek
                }
            }
        },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);

    const currentWeekTotal = currentWeekSales[0]?.total || 0;
    const previousWeekTotal = previousWeekSales[0]?.total || 0;

    // Handle division by zero
    if (previousWeekTotal === 0) {
        return currentWeekTotal > 0 ? 100 : 0;
    }

    return ((currentWeekTotal - previousWeekTotal) / previousWeekTotal) * 100;
}

/**
 * Algorithm 3: Monthly Profit Calculation
 * Profit = (Selling Price - Cost Price) × Quantity
 */
async function calculateMonthlyProfit(startOfCurrentMonth) {
    const monthlySales = await Sale.aggregate([
        { $match: { saleDate: { $gte: startOfCurrentMonth } } },
        {
            $project: {
                revenue: { $subtract: ["$subtotal", "$discountAmount"] },
                totalCost: {
                    $reduce: {
                        input: "$products",
                        initialValue: 0,
                        in: { $add: ["$$value", { $multiply: ["$$this.costPrice", "$$this.quantity"] }] }
                    }
                }
            }
        },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: "$revenue" },
                totalCost: { $sum: "$totalCost" }
            }
        },
        {
            $project: {
                profit: { $subtract: ["$totalRevenue", "$totalCost"] },
                totalRevenue: 1
            }
        }
    ]);

    return {
        profit: monthlySales[0]?.profit || 0,
        totalRevenue: monthlySales[0]?.totalRevenue || 0
    };
}

/**
 * Algorithm 4: Stock Movement Velocity (Last 30 Days)
 * Classifications:
 * - Fast Moving: avgDailySales > 10
 * - Medium Moving: avgDailySales 3-10
 * - Slow Moving: avgDailySales < 3
 */
async function calculateStockVelocity(thirtyDaysAgo) {
    const productSales = await Sale.aggregate([
        { $match: { saleDate: { $gte: thirtyDaysAgo } } },
        { $unwind: "$products" },
        {
            $group: {
                _id: "$products.product",
                totalSold: { $sum: "$products.quantity" }
            }
        },
        {
            $project: {
                productId: "$_id",
                avgDailySales: { $divide: ["$totalSold", 30] }
            }
        }
    ]);

    let fastMovingCount = 0;
    let mediumMovingCount = 0;
    let slowMovingCount = 0;

    productSales.forEach(product => {
        if (product.avgDailySales > 10) {
            fastMovingCount++;
        } else if (product.avgDailySales >= 3) {
            mediumMovingCount++;
        } else {
            slowMovingCount++;
        }
    });

    return { fastMovingCount, mediumMovingCount, slowMovingCount };
}

/**
 * Algorithm 5: Dead Stock & Slow Stock Detection
 * - Slow Stock: No sales in last 15 days
 * - Dead Stock: No sales in last 30 days
 */
async function calculateDeadSlowStock(recentDate, olderDate) {
    // Get all active products
    const allProducts = await Product.find({ status: 'Active' }).select('_id name total_stock');
    const allProductIds = allProducts.map(p => p._id.toString());
    const productMap = {};
    allProducts.forEach(p => productMap[p._id.toString()] = p);

    // Get products with sales in recentDate
    const productsWithRecentSales = await Sale.aggregate([
        { $match: { saleDate: { $gte: recentDate } } },
        { $unwind: "$products" },
        { $group: { _id: "$products.product" } }
    ]);
    const recentSalesIds = productsWithRecentSales.map(p => p._id.toString());

    // Get products with sales in olderDate
    const productsWithOlderSales = await Sale.aggregate([
        { $match: { saleDate: { $gte: olderDate } } },
        { $unwind: "$products" },
        { $group: { _id: "$products.product" } }
    ]);
    const olderSalesIds = productsWithOlderSales.map(p => p._id.toString());

    // Slow stock: no sales since recentDate but has sales since olderDate (and has stock)
    const slowStockCount = allProductIds.filter(id =>
        !recentSalesIds.includes(id) && olderSalesIds.includes(id) && productMap[id].total_stock > 0
    ).length;

    // Dead stock: no sales since olderDate (and has stock)
    const deadStockIds = allProductIds.filter(id =>
        !olderSalesIds.includes(id) && productMap[id].total_stock > 0
    );

    const deadStockDetails = deadStockIds.map(id => ({
        productName: productMap[id].name,
        currentStock: productMap[id].total_stock,
        status: 'Dead Stock'
    })).sort((a, b) => b.currentStock - a.currentStock);

    return { 
        slowStockCount, 
        deadStockCount: deadStockIds.length,
        deadStockDetails
    };
}

/**
 * Algorithm 6: Stock Health Ratio (Coverage-Based)
 * Stock Coverage Ratio = Current Stock / Average Monthly Sales
 * Classifications:
 * - Critical: Ratio < 1
 * - Healthy: Ratio 1-3
 * - Overstock: Ratio > 6
 */
async function calculateStockHealth(thirtyDaysAgo) {
    // Get sales data for last 30 days per product
    const productSales = await Sale.aggregate([
        { $match: { saleDate: { $gte: thirtyDaysAgo } } },
        { $unwind: "$products" },
        {
            $group: {
                _id: "$products.product",
                totalSold: { $sum: "$products.quantity" }
            }
        }
    ]);

    // Create map of product sales
    const salesMap = {};
    productSales.forEach(ps => {
        salesMap[ps._id.toString()] = ps.totalSold;
    });

    // Get all products with stock
    const products = await Product.find({ status: 'Active' }).select('_id total_stock');

    let criticalCoverageCount = 0;
    let healthyStockCount = 0;
    let overstockCount = 0;

    products.forEach(product => {
        const avgMonthlySales = salesMap[product._id.toString()] || 0;

        if (avgMonthlySales === 0) {
            // If no sales, treat products with stock as overstock
            if (product.total_stock > 0) {
                overstockCount++;
            }
            return;
        }

        const coverageRatio = product.total_stock / avgMonthlySales;

        if (coverageRatio < 1) {
            criticalCoverageCount++;
        } else if (coverageRatio <= 3) {
            healthyStockCount++;
        } else if (coverageRatio > 6) {
            overstockCount++;
        } else {
            healthyStockCount++; // 3-6 range also considered healthy
        }
    });

    return { criticalCoverageCount, healthyStockCount, overstockCount };
}

/**
 * Algorithm 7: Reorder Prediction (Rule-Based)
 * Reorder Threshold = Average Daily Sales × 15
 * Flag when: Current Stock < Threshold
 */
async function calculateReorderPrediction(thirtyDaysAgo) {
    // Get sales data for last 30 days per product
    const productSales = await Sale.aggregate([
        { $match: { saleDate: { $gte: thirtyDaysAgo } } },
        { $unwind: "$products" },
        {
            $group: {
                _id: "$products.product",
                totalSold: { $sum: "$products.quantity" }
            }
        },
        {
            $project: {
                productId: "$_id",
                avgDailySales: { $divide: ["$totalSold", 30] }
            }
        }
    ]);

    // Create map of average daily sales
    const avgDailySalesMap = {};
    productSales.forEach(ps => {
        avgDailySalesMap[ps.productId.toString()] = ps.avgDailySales;
    });

    // Get all products
    const products = await Product.find({ status: 'Active' }).select('_id name total_stock');

    const reorderDetails = [];

    products.forEach(product => {
        const avgDailySales = avgDailySalesMap[product._id.toString()] || 0;
        const reorderThreshold = avgDailySales * 15;

        if (product.total_stock < reorderThreshold && avgDailySales > 0) {
            reorderDetails.push({
                productName: product.name,
                currentStock: product.total_stock,
                reorderThreshold: Math.ceil(reorderThreshold)
            });
        }
    });

    return {
        reorderRequiredCount: reorderDetails.length,
        reorderDetails
    };
}

/**
 * Algorithm 8 & 9 Combined: Optimized Product Stats
 * Calculates inventory value, low stock counts, and critical details in one pass.
 */
async function calculateProductStats() {
    const results = await Product.aggregate([
        { $match: { status: 'Active' } },
        {
            $project: {
                name: 1,
                total_stock: 1,
                reorderLevel: 1,
                value: { $multiply: ["$total_stock", { $ifNull: ["$current_cost_price", 0] }] },
                isLow: { $lte: ["$total_stock", "$reorderLevel"] },
                isCritical: { $lte: ["$total_stock", { $divide: ["$reorderLevel", 2] }] }
            }
        },
        {
            $group: {
                _id: null,
                totalValue: { $sum: "$value" },
                lowStockCount: { $sum: { $cond: ["$isLow", 1, 0] } },
                criticalStockCount: { $sum: { $cond: ["$isCritical", 1, 0] } },
                allLowStockProducts: {
                    $push: {
                        $cond: [
                            "$isLow",
                            {
                                productName: "$name",
                                currentStock: "$total_stock",
                                reorderLevel: "$reorderLevel",
                                status: { $cond: ["$isCritical", "Critical", "Low"] }
                            },
                            "$$REMOVE"
                        ]
                    }
                }
            }
        }
    ]);

    const stats = results[0] || { totalValue: 0, lowStockCount: 0, criticalStockCount: 0, allLowStockProducts: [] };

    return {
        inventoryValue: stats.totalValue,
        lowStockCount: stats.lowStockCount,
        criticalStockCount: stats.criticalStockCount,
        lowStockDetails: stats.allLowStockProducts.sort((a, b) => a.currentStock - b.currentStock)
    };
}

/**
 * Helper: Calculate Inventory Value at Specific Date
 * (Simplified: uses current stock levels for approximation)
 */
async function calculateInventoryValueAtDate(date) {
    // For simplicity, we calculate based on current price but stock level changes
    // A more accurate implementation would track historical stock levels
    // This is a reasonable approximation for the 7-day change

    // Get stock movements between then and now
    const stockChanges = await StockLog.aggregate([
        { $match: { createdAt: { $gte: date } } },
        {
            $group: {
                _id: "$product",
                netChange: {
                    $sum: {
                        $cond: [
                            { $eq: ["$type", "IN"] },
                            "$quantity",
                            { $multiply: ["$quantity", -1] }
                        ]
                    }
                }
            }
        }
    ]);

    const stockChangesMap = {};
    stockChanges.forEach(sc => {
        stockChangesMap[sc._id.toString()] = sc.netChange;
    });

    // Calculate value 7 days ago
    const products = await Product.find({ status: 'Active' }).select('_id total_stock current_cost_price');

    let totalValue = 0;
    products.forEach(product => {
        const stockChange = stockChangesMap[product._id.toString()] || 0;
        const stockSevenDaysAgo = product.total_stock - stockChange;
        const valueSevenDaysAgo = stockSevenDaysAgo * product.current_cost_price;
        totalValue += valueSevenDaysAgo;
    });

    return totalValue;
}

/**
 * Top & Least Selling Products (Last 7 Days)
 */
async function calculateTopAndLeastSellingProducts(sevenDaysAgo) {
    const allSales = await Sale.aggregate([
        { $match: { saleDate: { $gte: sevenDaysAgo } } },
        { $unwind: "$products" },
        {
            $group: {
                _id: "$products.product",
                productName: { $first: "$products.name" },
                totalSold: { $sum: "$products.quantity" }
            }
        },
        { $sort: { totalSold: -1 } }
    ]);

    const mostSellingProducts = allSales.slice(0, 5);
    
    // For least selling, take from the bottom, but exclude any that are already in mostSellingProducts
    let leastSellingProducts = [];
    if (allSales.length > 5) {
        const reversed = [...allSales].reverse();
        leastSellingProducts = reversed.filter(item => 
            !mostSellingProducts.some(mostItem => mostItem._id.toString() === item._id.toString())
        ).slice(0, 5);
    }

    return {
        mostSellingProducts,
        leastSellingProducts
    };
}

/**
 * Algorithm 10: Rule-Based Alert Engine
 * Generate alerts based on business rules
 */
function generateAlerts(data) {
    const alerts = [];

    if (data.criticalStockDetails && data.criticalStockDetails.length > 0) {
        if (data.criticalStockDetails.length <= 3) {
            data.criticalStockDetails.forEach(p => {
                alerts.push(`Critical Stock: ${p.productName} is dangerously low (${p.currentStock} left).`);
            });
        } else {
            alerts.push(`${data.criticalStockDetails.length} products are critically low in stock (e.g., ${data.criticalStockDetails.slice(0, 2).map(p=>p.productName).join(', ')}).`);
        }
    }

    if (data.deadStockDetails && data.deadStockDetails.length > 0) {
        if (data.deadStockDetails.length <= 3) {
            data.deadStockDetails.forEach(p => {
                alerts.push(`Dead Stock: ${p.productName} has not sold in 30 days.`);
            });
        } else {
            alerts.push(`${data.deadStockDetails.length} products are dead stock (e.g., ${data.deadStockDetails.slice(0, 2).map(p=>p.productName).join(', ')}).`);
        }
    }

    if (data.salesGrowthPercent < -20) {
        alerts.push(`Sales dropped by ${Math.abs(data.salesGrowthPercent).toFixed(1)}% this week.`);
    }

    if (data.reorderDetails && data.reorderDetails.length > 0) {
         if (data.reorderDetails.length <= 3) {
            data.reorderDetails.forEach(p => {
                alerts.push(`Velocity Alert: ${p.productName} is selling fast. Reorder soon!`);
            });
        } else {
            alerts.push(`${data.reorderDetails.length} products require reordering based on velocity (e.g., ${data.reorderDetails.slice(0, 2).map(p=>p.productName).join(', ')}).`);
        }
    }

    if (data.salesGrowthPercent > 20) {
        if (data.salesGrowthPercent > 200) {
            alerts.push(`Great news! Sales have more than doubled this week!`);
        } else if (data.salesGrowthPercent > 100) {
            alerts.push(`Great news! Sales increased by over 100% this week!`);
        } else {
            alerts.push(`Great news! Sales increased by ${data.salesGrowthPercent.toFixed(1)}% this week.`);
        }
    }

    if (data.highValueSales && data.highValueSales.length > 0) {
        data.highValueSales.forEach(sale => {
            alerts.push(`Large Sale Processed: Invoice #${sale.invoiceNumber} for Rs. ${sale.totalAmount.toLocaleString()}`);
        });
    }

    if (data.highValuePurchases && data.highValuePurchases.length > 0) {
        data.highValuePurchases.forEach(purchase => {
            alerts.push(`Large Purchase Delivered: Stock worth Rs. ${purchase.totalAmount.toLocaleString()} added to inventory.`);
        });
    }

    return alerts;
}

async function calculateHighValueSales(since, threshold) {
    const highSales = await Sale.find({
        saleDate: { $gte: since },
        totalAmount: { $gte: threshold }
    }).select('invoiceNumber totalAmount').sort({ saleDate: -1 });
    
    return highSales;
}

async function calculateHighValuePurchases(since, threshold) {
    const highPurchases = await Purchase.find({
        purchaseDate: { $gte: since },
        totalAmount: { $gte: threshold }
    }).select('invoiceNumber totalAmount').sort({ purchaseDate: -1 });
    
    return highPurchases;
}

async function calculateDailyRevenue(sevenDaysAgo) {
    const dailySales = await Sale.aggregate([
        { $match: { saleDate: { $gte: sevenDaysAgo } } },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$saleDate" } },
                totalRevenue: { $sum: "$totalAmount" },
                transactionCount: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);
    return dailySales;
}

// Keep backward compatibility with old endpoint
module.exports.getDashboardStats = module.exports.getDashboardSummary;
