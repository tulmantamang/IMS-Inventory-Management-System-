const Product = require('../models/Productmodel');
const Category = require('../models/Categorymodel');
const logActivity = require('../libs/logger');
const Cloundinary = require('../libs/Cloundinary');

// Helper for SKU Generation
const generateSKU = async () => {
  const date = new Date();
  const year = date.getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000); // 4 digit random
  const prefix = "PRD";
  return `${prefix}-${year}-${random}`;
};

module.exports.Addproduct = async (req, res) => {
  const userId = req.user._id;
  try {
    const { name, description, category, selling_price, reorderLevel, status, image } = req.body;

    // Strict Validation
    if (!name || !category || !description || selling_price === undefined) {
      return res.status(400).json({ error: "Missing required fields: Name, Category, Description, Selling Price." });
    }

    // Check if Category is Active
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return res.status(404).json({ error: "Category not found." });
    }
    if (categoryDoc.status !== 'Active') {
      return res.status(400).json({ error: "Cannot assign an inactive category to a product." });
    }

    // Check for Duplicates (Name)
    const existingProduct = await Product.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });
    if (existingProduct) {
      return res.status(400).json({ error: `Product '${name}' already exists.` });
    }

    if (Number(selling_price) <= 0) {
      return res.status(400).json({ error: "Selling Price must be greater than 0" });
    }

    const validStatuses = ["Active", "Inactive"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    // Auto-Generate Unique SKU
    let sku = await generateSKU();
    let skuExists = await Product.findOne({ sku });
    while (skuExists) {
      sku = await generateSKU();
      skuExists = await Product.findOne({ sku });
    }

    // Handle Image Upload Action
    let imageUrl = "";
    if (image) {
      // Direct Base64 Storage due to disabled Cloudinary Account
      imageUrl = image;
    }

    const createdProduct = new Product({
      name,
      sku,
      description,
      category,
      image: imageUrl,
      current_cost_price: 0, // Initialized to 0, only updated via Purchase
      selling_price: Number(selling_price),
      total_stock: 0,
      reorderLevel: Number(reorderLevel) || 0,
      status: status || "Active"
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
    res.status(500).json({ message: "Error in creating product", error: error.message });
  }
}

module.exports.getProduct = async (req, res) => {
  try {
    const productsDocs = await Product.find({}).populate('category');
    const totalProduct = await Product.countDocuments({});

    res.status(200).json({ Products: productsDocs, totalProduct });
  } catch (error) {
    res.status(500).json({ message: "Error getting products", error: error.message });
  }
};

module.exports.RemoveProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;
    
    // Import all transactional models
    const StockLog = require("../models/StockLogmodel");
    const Sale = require("../models/Salesmodel");
    const Purchase = require("../models/Purchasemodel");
    const Adjustment = require("../models/Adjustmentmodel");

    // Check system-wide dependencies natively with Promise.all
    const [stockLogsCount, salesCount, purchasesCount, adjustmentsCount] = await Promise.all([
      StockLog.countDocuments({ product: productId }),
      Sale.countDocuments({ "products.product": productId }),
      Purchase.countDocuments({ "items.product": productId }),
      Adjustment.countDocuments({ product: productId })
    ]);

    const totalDependencies = stockLogsCount + salesCount + purchasesCount + adjustmentsCount;

    // Reject Deletion Rule
    if (totalDependencies > 0) {
      return res.status(400).json({
        message: "This product cannot be deleted because it is linked to system transactions."
      });
    }

    const deletedProduct = await Product.findByIdAndDelete(productId);

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

// Restoration logic removed as isDeleted is removed.

module.exports.EditProduct = async (req, res) => {
  try {
    const { productId, updatedData } = req.body;
    const userId = req.user._id;

    if (!updatedData) return res.status(400).json({ message: "No data provided" });

    // Check for Duplicates if Name is changing
    if (updatedData.name) {
      const duplicate = await Product.findOne({
        _id: { $ne: productId },
        name: { $regex: new RegExp(`^${updatedData.name}$`, 'i') }
      });
      if (duplicate) {
        return res.status(400).json({ message: `Product '${updatedData.name}' already exists.` });
      }
    }

    // Check if category is being updated and if it's active
    if (updatedData.category) {
      const categoryDoc = await Category.findById(updatedData.category);
      if (!categoryDoc) {
        return res.status(404).json({ message: "Category not found." });
      }
      if (categoryDoc.status !== 'Active') {
        return res.status(400).json({ message: "Cannot assign an inactive category to a product." });
      }
    }

    // Strict Security: Prevent editing of SKU, Stock, and Cost Price
    delete updatedData.sku;
    delete updatedData.total_stock;
    delete updatedData.current_cost_price;

    // Handle Image Upload Action
    if (updatedData.image) {
       // Direct Base64 Storage due to disabled Cloudinary Account
       // Leaves updatedData.image as the base64 string inherently.
    } else {
      // Prevent deleting the old image if no new image is provided
      delete updatedData.image;
    }

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
      $or: [
        { name: { $regex: query, $options: "i" } },
        { sku: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } }
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
      $expr: { $lte: ["$total_stock", "$reorderLevel"] }
    });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching low stock products", error: error.message });
  }
};

module.exports.getExpiringProducts = async (req, res) => {
  // Expiry date removed from schema
  res.status(200).json([]);
};

module.exports.getTopProductsByQuantity = async (req, res) => {
  try {
    const topProducts = await Product.find({ status: 'Active' }).sort({ total_stock: -1 }).limit(5);
    res.status(200).json({ topProducts });
  } catch (error) {
    res.status(500).json({ message: "Error fetching top products" });
  }
}
