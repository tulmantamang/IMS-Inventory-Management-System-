const mongoose = require('mongoose');
const Supplier = require('./models/Suppliermodel');

async function checkRaw() {
    try {
        const localUri = 'mongodb://127.0.0.1:27017/inventorydb';
        await mongoose.connect(localUri);
        console.log('Connected');

        const raw = await Supplier.find({}).lean();
        console.log('Raw Data:', JSON.stringify(raw, null, 2));

        const countNull = await Supplier.countDocuments({ email: null });
        console.log('Count null emails:', countNull);

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkRaw();
