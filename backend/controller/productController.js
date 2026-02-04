const Product = require('../models/Productmodel');
const logActivity = require('../libs/logger');
const Cloundinary = require('../libs/Cloundinary');

module.exports.Addproduct = async (req, res) => {
  const userId = req.user._id;
  try {
    const { name, sku, description, category, price, unit, reorderLevel, status, expiryDate, image, supplier, batchNumber, serialNumber, notes } = req.body;

    // Strict Validation
    if (!name || !sku || !category || !supplier || !description || price === undefined) {
      return res.status(400).json({ error: "Missing required fields: Name, SKU, Category, Supplier, Description, Price." });
    }

    // SKU Uniqueness
    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
      return res.status(400).json({ error: "SKU already exists." });
    }

    // Image Upload handled via helper or raw as provided
    let imageUrl = image || "";
    // Note: Cloundinary helper logic can be integrated here if needed, 
    // but focusing on field logic as per prompt constraints.

    const createdProduct = new Product({
      name,
      sku,
      description,
      category,
      price: Number(price),
      stockQuantity: 0, // Mandatory: initialized as 0
      unit: unit || "pcs",
      reorderLevel: Number(reorderLevel) || 0,
      status: status || "Active",
      expiryDate: expiryDate || null,
      image: imageUrl,
      supplier,
      batchNumber: batchNumber || null,
      serialNumber: serialNumber || null,
      notes: notes || ""
    });

    await createdProduct.save();

    await logActivity({
      action: "Add Product",
      description: `Product ${name} (SKU: ${sku}) added with 0 initial stock.`,
      entity: "product",
      entityId: createdProduct._id,
      userId: userId,
      ipAddress: req.ip,
    });

    res.status(201).json({ message: "Product created successfully. Use Stock-In to add inventory.", product: createdProduct });

  } catch (error) {
    console.error("Add Product Error:", error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "Duplicate key error", error: "SKU already exists." });
    }
    res.status(500).json({ message: "Error in creating product", error: error.message });
  }
}

module.exports.getProduct = async (req, res) => {
  try {
    const Products = await Product.find({ isDeleted: false }).populate('category').populate('supplier');
    const totalProduct = await Product.countDocuments({ isDeleted: false });
    // Return 'Products' to match frontend expectation if it expects 'Products' key
    res.status(200).json({ Products, totalProduct });
  } catch (error) {
    res.status(500).json({ message: "Error getting products", error: error.message });
  }
};

module.exports.RemoveProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;
    const StockLog = require("../models/StockLogmodel");

    // Check if any transactions exist for this product
    const transactionCount = await StockLog.countDocuments({ product: productId });
    if (transactionCount > 0) {
      return res.status(400).json({
        message: `Cannot delete product: It has ${transactionCount} recorded transactions. Set status to 'Inactive' instead.`
      });
    }

    const deletedProduct = await Product.findByIdAndUpdate(productId, { isDeleted: true }, { new: true });

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found!" });
    }

    await logActivity({
      action: "Delete Product",
      description: `Product ${deletedProduct.name} deleted.`,
      entity: "product",
      entityId: deletedProduct._id,
      userId: userId,
      ipAddress: req.ip,
    });

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error: error.message });
  }
};

module.exports.restoreProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    const restoredProduct = await Product.findByIdAndUpdate(productId, { isDeleted: false }, { new: true });

    if (!restoredProduct) {
      return res.status(404).json({ message: "Product not found!" });
    }

    await logActivity({
      action: "Restore Product",
      description: `Product ${restoredProduct.name} restored.`,
      entity: "product",
      entityId: restoredProduct._id,
      userId: userId,
      ipAddress: req.ip,
    });

    res.status(200).json({ message: "Product restored successfully", product: restoredProduct });
  } catch (error) {
    res.status(500).json({ message: "Error restoring product", error: error.message });
  }
};

module.exports.EditProduct = async (req, res) => {
  try {
    const { productId, updatedData } = req.body;
    const userId = req.user._id;

    if (!updatedData) return res.status(400).json({ message: "No data provided" });

    // Normalize
    if (updatedData.Category) { updatedData.category = updatedData.Category; delete updatedData.Category; }
    if (updatedData.Price) { updatedData.price = updatedData.Price; delete updatedData.Price; }

    // Explicitly prevent direct stockQuantity update
    delete updatedData.stockQuantity;
    delete updatedData.quantity;

    if (updatedData.supplier && updatedData.supplier === "") { updatedData.supplier = null; }
    // New fields
    if (updatedData.batchNumber === "") updatedData.batchNumber = null;
    if (updatedData.serialNumber === "") updatedData.serialNumber = null;
    if (updatedData.notes === "") updatedData.notes = null;

    const updatedProduct = await Product.findByIdAndUpdate(productId, updatedData, { new: true });

    if (!updatedProduct) return res.status(404).json({ message: "Product not found" });

    await logActivity({
      action: "Update Product",
      description: `Product ${updatedProduct.name} updated.`,
      entity: "product",
      entityId: updatedProduct._id,
      userId: userId,
      ipAddress: req.ip,
    });

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: "Error updating product", error: error.message });
  }
};

module.exports.SearchProduct = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: "Query required" });

    const products = await Product.find({
      isDeleted: false,
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { sku: { $regex: query, $options: "i" } }
      ],
    }).populate('category');

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error finding product", error: error.message });
  }
};

module.exports.getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find({
      isDeleted: false,
      $expr: { $lte: ["$stockQuantity", "$reorderLevel"] }
    });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching low stock products", error: error.message });
  }
};

module.exports.getExpiringProducts = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + parseInt(days));

    const products = await Product.find({
      isDeleted: false,
      expiryDate: { $ne: null, $lte: futureDate }
    });

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching expiring products", error: error.message });
  }
};

module.exports.getTopProductsByQuantity = async (req, res) => {
  try {
    // Just return top 5 by quantity for now as a simple placeholder, or logic from Sales
    // If "Top Products" means "Best Sellers", we need Sales data.
    // If "Top Products" means "Highest Stock", we use Product data.
    // Let's assume Highest Stock for now to avoid breaking the route.
    const topProducts = await Product.find({ isDeleted: false, status: 'Active' }).sort({ stockQuantity: -1 }).limit(5);
    res.status(200).json({ topProducts });
  } catch (error) {
    res.status(500).json({ message: "Error fetching top products" });
  }
}
