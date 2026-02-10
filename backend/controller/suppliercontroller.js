const Supplier = require("../models/Suppliermodel");
const logActivity = require("../libs/logger");


module.exports.createSupplier = async (req, res) => {
  try {
    const { name, contact_person, phone, email, address, pan_vat, status } = req.body;
    console.log("Create Supplier - Received Body:", req.body);

    const missing = [];
    if (!name || !name.trim()) missing.push("Company Name");
    if (!contact_person || !contact_person.trim()) missing.push("Contact_person");
    if (!phone) missing.push("Phone");
    if (!address || !address.trim()) missing.push("Address");
    if (!pan_vat) missing.push("PAN/VAT");

    if (missing.length > 0) {
      console.log("Validation Failed - Missing fields:", missing);
      return res.status(400).json({ success: false, message: `Please fill in: ${missing.join(", ")}` });
    }

    // Uniqueness: PAN/VAT
    const cleanPan = pan_vat.toString().trim();
    const existingPan = await Supplier.findOne({ pan_vat: cleanPan });
    if (existingPan) {
      return res.status(400).json({ success: false, message: `Supplier with PAN/VAT "${cleanPan}" already exists.` });
    }

    // Uniqueness: Name (Case-Insensitive)
    const cleanName = name.trim();
    const existingName = await Supplier.findOne({ name: { $regex: `^${cleanName}$`, $options: 'i' } });
    if (existingName) {
      return res.status(400).json({ success: false, message: `Supplier with name "${cleanName}" already exists.` });
    }

    // Uniqueness: Email (if provided)
    if (email && email.trim()) {
      const cleanEmail = email.toLowerCase().trim();
      const existingEmail = await Supplier.findOne({ email: cleanEmail });
      if (existingEmail) {
        return res.status(400).json({ success: false, message: `Supplier with email "${cleanEmail}" already exists.` });
      }
    }

    // Generate Supplier Code (SUP-0001)
    const allSuppliers = await Supplier.find({}, 'supplier_id');
    let maxNum = 0;

    allSuppliers.forEach(s => {
      if (s.supplier_id && s.supplier_id.startsWith("SUP-")) {
        const parts = s.supplier_id.split("-");
        const num = parseInt(parts[1]);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    });

    const nextCode = `SUP-${String(maxNum + 1).padStart(4, "0")}`;

    // Status Validation
    const validStatuses = ["Active", "Inactive"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value." });
    }

    const newSupplier = new Supplier({
      name: cleanName,
      contact_person: contact_person.trim(),
      phone: phone.toString().trim(),
      ...(email && email.trim() ? { email: email.toLowerCase().trim() } : {}),
      address: address.trim(),
      pan_vat: cleanPan,
      status: status || 'Active',
      supplier_id: nextCode
    });

    await newSupplier.save();
    console.log("Supplier created successfully:", newSupplier._id);

    await logActivity({
      action: "Create Supplier",
      description: `Supplier "${name}" (${nextCode}) was created.`,
      entity: "supplier",
      entityId: newSupplier._id,
      userId: req.user?._id,
      ipAddress: req.ip,
    });

    res.status(201).json({ success: true, message: "Supplier created successfully", newSupplier });
  } catch (error) {
    console.error("Create Supplier Error:", error);
    res.status(500).json({ success: false, message: "Server error creating supplier", error: error.message });
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
  const { name, contact_person, phone, email, address, pan_vat, status } = req.body;

  try {
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    // Check unique PAN/VAT if changed
    if (pan_vat && pan_vat.toString().trim() !== supplier.pan_vat) {
      const cleanPan = pan_vat.toString().trim();
      const existing = await Supplier.findOne({ pan_vat: cleanPan });
      if (existing) return res.status(400).json({ message: `PAN/VAT "${cleanPan}" already in use by another supplier.` });
      supplier.pan_vat = cleanPan;
    }

    // Check unique Name if changed
    if (name && name.trim().toLowerCase() !== supplier.name.toLowerCase()) {
      const cleanName = name.trim();
      const existingName = await Supplier.findOne({ name: { $regex: new RegExp(`^${cleanName}$`, "i") } });
      if (existingName) return res.status(400).json({ message: `Supplier name "${cleanName}" already exists.` });
      supplier.name = cleanName;
    }

    // Check unique Email if changed
    if (email !== undefined) {
      const cleanEmail = email && email.trim() ? email.toLowerCase().trim() : undefined;
      if (cleanEmail !== (supplier.email || undefined)) {
        if (cleanEmail) {
          const existingEmail = await Supplier.findOne({ email: cleanEmail });
          if (existingEmail) return res.status(400).json({ message: `Email "${cleanEmail}" already in use.` });
          supplier.email = cleanEmail;
        } else {
          supplier.email = undefined; // Mongoose will unset if sparse/no-default
        }
      }
    }

    // Status Validation
    if (status && !["Active", "Inactive"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    supplier.contact_person = contact_person ? contact_person.trim() : supplier.contact_person;
    supplier.phone = phone ? phone.toString().trim() : supplier.phone;
    supplier.address = address ? address.trim() : supplier.address;
    supplier.status = status || supplier.status;

    const updatedSupplier = await supplier.save();

    await logActivity({
      action: "Update Supplier",
      description: `Supplier "${updatedSupplier.name}" (${updatedSupplier.supplier_id}) details were updated.`,
      entity: "supplier",
      entityId: updatedSupplier._id,
      userId: req.user?._id,
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: "Supplier updated successfully",
      supplier: updatedSupplier,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating supplier", error: error.message });
  }
};



module.exports.deleteSupplier = async (req, res) => {
  return res.status(403).json({
    success: false,
    message: "Supplier deletion is disabled for data integrity. Please set the status to 'Inactive' instead."
  });
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


