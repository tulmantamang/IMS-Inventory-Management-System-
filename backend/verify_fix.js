const mongoose = require('mongoose');
const Supplier = require('./models/Suppliermodel');

async function verifyFix() {
    try {
        const localUri = 'mongodb://127.0.0.1:27017/inventorydb';
        await mongoose.connect(localUri);
        console.log('Connected to Local MongoDB');

        // Test logic equivalent to controller
        const allSuppliers = await Supplier.find({}, 'supplierCode');
        let maxNum = 0;

        console.log('Current Suppliers in DB:');
        allSuppliers.forEach(s => {
            console.log(`- ${s.supplierCode}`);
            if (s.supplierCode && s.supplierCode.startsWith("SUP-")) {
                const parts = s.supplierCode.split("-");
                const num = parseInt(parts[1]);
                if (!isNaN(num) && num > maxNum) {
                    maxNum = num;
                }
            }
        });

        const nextCode = `SUP-${String(maxNum + 1).padStart(4, "0")}`;
        console.log('Generated Next Code:', nextCode);

        if (nextCode === "SUP-0002") {
            console.log('SUCCESS: Correct next code generated despite missing codes in some entries.');
        } else {
            console.error('FAILURE: Unexpected next code:', nextCode);
        }

        process.exit(0);
    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
}

verifyFix();
