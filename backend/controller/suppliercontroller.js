const Supplier = require("../models/Suppliermodel");
const logActivity = require("../libs/logger");


module.exports.createSupplier = async (req, res) => {
  try {
    const { name, contactPerson, phone, email, address, panVat, status } = req.body;

    if (!name || !contactPerson || !phone || !address || !panVat) {
      return res.status(400).json({ success: false, message: "Required fields: Name, Contact Person, Phone, Address, PAN/VAT." });
    }

    const existingSupplier = await Supplier.findOne({ panVat });
    if (existingSupplier) {
      return res.status(400).json({ success: false, message: "Supplier with this PAN/VAT already exists." });
    }

    const newSupplier = new Supplier({
      name,
      contactPerson,
      phone,
      email,
      address,
      panVat,
      status: status || 'Active'
    });

    await newSupplier.save();

    await logActivity({
      action: "Create Supplier",
      description: `Supplier "${name}" was created.`,
      entity: "supplier",
      entityId: newSupplier._id,
      userId: req.user?._id,
      ipAddress: req.ip,
    });

    res.status(201).json({ success: true, message: "Supplier created successfully", newSupplier });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating supplier", error: error.message });
  }
};


module.exports.getAllSuppliers = async (req, res) => {
  try {
    const Suppliers = await Supplier.find().sort({ createdAt: -1 });
    res.status(200).json(Suppliers);
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching suppliers", error: error.message });
  }
};


module.exports.getSupplierById = async (req, res) => {
  try {
    const { supplierId } = req.params;
    const supplier = await Supplier.findById(supplierId);

    if (!supplier) {
      return res.status(404).json({ success: false, message: "Supplier not found" });
    }

    res.status(200).json({ success: true, supplier });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching supplier", error: error.message });
  }
};


module.exports.editSupplier = async (req, res) => {
  const { supplierId } = req.params;
  const { name, contactPerson, phone, email, address, panVat, status } = req.body;

  try {
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    // Check unique PAN/VAT if changed
    if (panVat && panVat !== supplier.panVat) {
      const existing = await Supplier.findOne({ panVat });
      if (existing) return res.status(400).json({ message: "PAN/VAT already in use." });
    }

    supplier.name = name || supplier.name;
    supplier.contactPerson = contactPerson || supplier.contactPerson;
    supplier.phone = phone || supplier.phone;
    supplier.email = email || supplier.email;
    supplier.address = address || supplier.address;
    supplier.panVat = panVat || supplier.panVat;
    supplier.status = status || supplier.status;

    const updatedSupplier = await supplier.save();

    await logActivity({
      action: "Update Supplier",
      description: `Supplier "${updatedSupplier.name}" details were updated.`,
      entity: "supplier",
      entityId: updatedSupplier._id,
      userId: req.user?._id,
      ipAddress: req.ip,
    });

    res.status(200).json({
      message: "Supplier updated successfully",
      supplier: updatedSupplier,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating supplier", error: error.message });
  }
};



module.exports.deleteSupplier = async (req, res) => {
  try {
    const { supplierId } = req.params;

    // Check if products are linked
    const Product = require("../models/Productmodel");
    const linkedProducts = await Product.countDocuments({ supplier: supplierId, isDeleted: false });

    if (linkedProducts > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete supplier. ${linkedProducts} active products are linked to this supplier. Deactivate them first or change their supplier.`
      });
    }

    const supplier = await Supplier.findByIdAndDelete(supplierId);

    if (!supplier) {
      return res.status(404).json({ success: false, message: "Supplier not found" });
    }

    await logActivity({
      action: "Delete Supplier",
      description: `Supplier "${supplier.name}" was deleted.`,
      entity: "supplier",
      entityId: supplier._id,
      userId: req.user?._id,
      ipAddress: req.ip,
    });

    res.status(200).json({ success: true, message: "Supplier deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting supplier", error: error.message });
  }
};


module.exports.searchSupplier = async (req, res) => {
  try {
    const { query } = req.query;
    console.log("Received query:", query);

    if (!query || query.trim() === "") {
      return res.status(400).json({ success: false, message: "Query parameter is required" });
    }


    const suppliers = await Supplier.find({
      name: { $regex: new RegExp(query, "i") },
    });

    return res.json({ success: true, suppliers });
  } catch (error) {
    console.error("Search Error:", error);
    return res.status(500).json({ success: false, message: "Error fetching supplier", error: error.message });
  }
};


