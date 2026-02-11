const mongoose = require('mongoose');

const StockLogSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    type: {
        type: String,
        enum: ["IN", "OUT", "ADJUST"], // Standardized uppercase for consistency
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    reason: {
        type: String,
        default: ""
    },
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Supplier"
    },
    previousStock: {
        type: Number,
        default: 0
    },
    currentStock: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const StockLog = mongoose.model("StockLog", StockLogSchema);

module.exports = StockLog;
