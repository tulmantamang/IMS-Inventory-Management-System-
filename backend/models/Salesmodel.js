const mongoose = require("mongoose");

const SalesSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  customerName: {
    type: String,
    trim: true,
    default: "Walking Customer"
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    name: { type: String }, // Snapshot
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 }, // Selling price snapshot
    batchNumber: { type: String }
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  paymentType: {
    type: String,
    enum: ["Cash", "Credit", "Online"],
    default: "Cash"
  },
  notes: {
    type: String,
    trim: true
  },
  soldBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  saleDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Sale = mongoose.model("Sale", SalesSchema);

module.exports = Sale;
