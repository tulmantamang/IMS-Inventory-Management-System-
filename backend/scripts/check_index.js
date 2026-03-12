const mongoose = require('mongoose');

async function checkIndex() {
    try {
        const localUri = 'mongodb://127.0.0.1:27017/inventorydb';
        await mongoose.connect(localUri);
        console.log('Connected');

        const indexes = await mongoose.connection.db.collection('suppliers').indexes();
        console.log('Indexes:', JSON.stringify(indexes, null, 2));

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkIndex();
