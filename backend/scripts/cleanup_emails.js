const mongoose = require('mongoose');
const Supplier = require('../models/Suppliermodel');

async function cleanupEmails() {
    try {
        const localUri = 'mongodb://127.0.0.1:27017/inventorydb';
        await mongoose.connect(localUri);
        console.log('Connected to Local MongoDB');

        // Remove the email field where it is null to allow sparse index to work
        const result = await Supplier.updateMany(
            { email: null },
            { $unset: { email: "" } }
        );

        console.log(`Updated ${result.modifiedCount} documents (removed null email).`);

        // Also check if there are any duplicate supplierCodes while we are at it
        const suppliers = await Supplier.find({}, 'name supplierCode email');
        console.log('Current Suppliers:', JSON.stringify(suppliers, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('Cleanup failed:', error);
        process.exit(1);
    }
}

cleanupEmails();
