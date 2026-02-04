const mongoose=require("mongoose")


require("dotenv").config()

module.exports.MongoDBconfig = async () => {
    // Try primary Atlas URI first, then fall back to local MongoDB for development convenience.
    const primary = process.env.MONGODB_URI || process.env.MONGODB_URL;
    const localFallback = process.env.LOCAL_MONGO_URI || 'mongodb://127.0.0.1:27017/inventorydb';

    const options = {
        // Mongoose v6+ uses modern defaults; serverSelectionTimeout is useful for quick failures
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        family: 4,
    };

    if (primary) {
        try {
            await mongoose.connect(primary, options);
            console.log(primary.includes('mongodb+srv') ? 'MongoDB Atlas connected' : 'MongoDB connected');
            return;
        } catch (err) {
            const msg = err && (err.message || err.toString());
            console.error('Primary MongoDB Connection Error:', msg || err);

            if (msg && (msg.includes('ENOTFOUND') || msg.includes('querySrv') || msg.includes('ETIMEOUT'))) {
                console.error('\nPrimary Atlas connection failed (DNS/timeout). Will attempt local MongoDB fallback.');
            } else {
                console.error('\nPrimary connection failed. Will attempt local MongoDB fallback.');
            }
        }
    } else {
        console.warn('No primary MONGODB_URI configured. Will attempt local MongoDB.');
    }

    // Attempt local fallback
    try {
        await mongoose.connect(localFallback, options);
        console.log('MongoDB connected (local fallback)');
        return;
    } catch (err) {
        const msg = err && (err.message || err.toString());
        console.error('Local MongoDB Connection Error:', msg || err);
        console.error('\nFailed to connect to both primary (Atlas) and local MongoDB.');
        console.error('If you want to use Atlas, ensure MONGODB_URI is correct and your network/DNS can reach Atlas.');
        console.error('To run locally, install and start MongoDB or update LOCAL_MONGO_URI in .env.');
        process.exit(1);
    }
};
