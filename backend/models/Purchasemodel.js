const mongoose = require('mongoose');

const PurchaseSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        unique: true,
        trim: true,
        sparse: true // Allow nulls while maintaining uniqueness for non-nulls
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Supplier",
        required: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        costPrice: {
            type: Number,
            required: true,
            min: 0
        },
        batchNumber: {
            type: String,
            trim: true
        },
        expiryDate: {
            type: Date
        }
    }],
    subtotal: {
        type: Number,
        default: 0
    },
    discountPercentage: {
        type: Number,
        default: 0
    },
    discountAmount: {
        type: Number,
        default: 0
    },
    taxPercentage: {
        type: Number,
        default: 0
    },
    taxAmount: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        required: true,
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
    purchaseDate: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const Purchase = mongoose.model("Purchase", PurchaseSchema);
module.exports = Purchase;
