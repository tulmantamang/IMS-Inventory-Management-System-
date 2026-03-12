const mongoose = require('mongoose');
const Supplier = require('../models/Suppliermodel');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function checkSuppliers() {
    try {
        const uri = process.env.MONGODB_URI || process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/inventorydb';
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const suppliers = await Supplier.find({}, 'name supplierCode panVat email');
        console.log('Total Suppliers:', suppliers.length);
        suppliers.forEach(s => {
            console.log(`- ${s.name}: ${s.supplierCode} (PAN: ${s.panVat}, Email: ${s.email})`);
        });

        const lastSupplier = await Supplier.findOne().sort({ createdAt: -1 });
        console.log('Last Supplier:', lastSupplier ? JSON.stringify(lastSupplier, null, 2) : 'None');

        process.exit(0);
    } catch (error) {
        console.error('Diagnostic failed:', error);
        process.exit(1);
    }
}

checkSuppliers();
