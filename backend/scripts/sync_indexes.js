const mongoose = require('mongoose');
const Supplier = require('../models/Suppliermodel');

async function syncIndexes() {
    try {
        const localUri = 'mongodb://127.0.0.1:27017/inventorydb';
        await mongoose.connect(localUri);
        console.log('Connected');

        console.log('Syncing indexes...');
        await Supplier.syncIndexes();
        console.log('Indexes synced.');

        const indexes = await mongoose.connection.db.collection('suppliers').indexes();
        console.log('Current Indexes:', JSON.stringify(indexes, null, 2));

        const emailIndex = indexes.find(i => i.name === 'email_1');
        if (emailIndex && emailIndex.sparse) {
            console.log('SUCCESS: email_1 is now sparse.');
        } else {
            console.error('FAILURE: email_1 is still NOT sparse or missing.');
        }

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

syncIndexes();
