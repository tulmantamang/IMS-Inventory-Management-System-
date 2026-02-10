const mongoose = require('mongoose');

async function dropIndex() {
    try {
        const localUri = 'mongodb://127.0.0.1:27017/inventorydb';
        await mongoose.connect(localUri);
        console.log('Connected');

        try {
            await mongoose.connection.db.collection('suppliers').dropIndex('email_1');
            console.log('Dropped email_1 index');
        } catch (e) {
            console.log('Index email_1 might not exist or already dropped:', e.message);
        }

        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

dropIndex();
