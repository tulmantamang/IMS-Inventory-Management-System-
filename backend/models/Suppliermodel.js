const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    contactPerson: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        default: ""
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    panVat: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    }
}, { timestamps: true });

const Supplier = mongoose.model("Supplier", SupplierSchema);

module.exports = Supplier;