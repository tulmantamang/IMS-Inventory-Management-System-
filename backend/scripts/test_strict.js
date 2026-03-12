const mongoose = require('mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/inventorydb")
    .then(async () => {
        const Purchase = require('../models/Purchasemodel');
        // create a dummy purchase
        const p = new Purchase({
            supplier: new mongoose.Types.ObjectId(),
            totalAmount: 100,
            items: [{
                product: new mongoose.Types.ObjectId(),
                name: "Test Product Name", // NOT IN SCHEMA
                quantity: 1,
                costPrice: 100
            }]
        });
        await p.save();
        const saved = await Purchase.findById(p._id).lean();
        console.log("Saved items array:", JSON.stringify(saved.items, null, 2));
        await Purchase.findByIdAndDelete(p._id);
        mongoose.disconnect();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
