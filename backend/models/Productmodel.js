const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    sku: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    stockQuantity: {
        type: Number,
        default: 0,
        min: 0
    },
    unit: {
        type: String,
        default: "pcs",
        trim: true
    },
    reorderLevel: {
        type: Number,
        default: 0,
        min: 0
    },
    status: {
        type: String,
        enum: ["Active", "Inactive"],
        default: "Active"
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Supplier",
        required: true
    },
    image: {
        type: String,
        default: ""
    },
    expiryDate: {
        type: Date,
        default: null
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    batchNumber: {
        type: String,
        trim: true
    },
    serialNumber: {
        type: String,
        trim: true
    },
    notes: {
        type: String,
        trim: true
    }
}, { timestamps: true });

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;