const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
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
    image: {
        type: String,
        default: ""
    },
    current_cost_price: {
        type: Number,
        required: true,
        min: 0
    },
    selling_price: {
        type: Number,
        required: true,
        min: 0
    },
    total_stock: {
        type: Number,
        default: 0,
        min: 0
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
    }
}, { timestamps: true });

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;