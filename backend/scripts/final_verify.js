const mongoose = require('mongoose');
const Supplier = require('../models/Suppliermodel');

async function finalVerify() {
    try {
        const localUri = 'mongodb://127.0.0.1:27017/inventorydb';
        await mongoose.connect(localUri);
        console.log('Connected to Local MongoDB');

        // Check current state
        const allSuppliers = await Supplier.find({});
        console.log(`Current Suppliers: ${allSuppliers.length}`);
        allSuppliers.forEach(s => {
            console.log(`- ${s.name}: Code=${s.supplierCode}, Email=${s.email}`);
        });

        // Test next code generation logic
        let maxNum = 0;
        allSuppliers.forEach(s => {
            if (s.supplierCode && s.supplierCode.startsWith("SUP-")) {
                const parts = s.supplierCode.split("-");
                const num = parseInt(parts[1]);
                if (!isNaN(num) && num > maxNum) {
                    maxNum = num;
                }
            }
        });
        const nextCode = `SUP-${String(maxNum + 1).padStart(4, "0")}`;
        console.log('Next Generated Code:', nextCode);

        // Verify if we can have two suppliers with undefined email
        // We will try to update the existing one and then simulate what a new one would look like
        // (We don't actually insert here to avoid polluting DB too much, but we check if nulls exist)
        const nullEmails = await Supplier.countDocuments({ email: null });
        console.log(`Suppliers with email: null = ${nullEmails}`);

        if (nullEmails === 0 && nextCode !== "SUP-0001") {
            console.log("SUCCESS: Schema and data look clean for creation.");
        } else {
            console.warn("WARNING: Still seeing issues in data state.");
        }

        process.exit(0);
    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
}

finalVerify();
