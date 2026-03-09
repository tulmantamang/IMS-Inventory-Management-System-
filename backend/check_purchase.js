const mongoose = require('mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/inventorydb")
    .then(async () => {
        const Purchase = require('./models/Purchasemodel');
        const purchase = await Purchase.findOne().lean();
        console.log("Purchase record:\n", JSON.stringify(purchase, null, 2));
        mongoose.disconnect();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
