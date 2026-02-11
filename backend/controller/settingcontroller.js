const Setting = require("../models/Settingmodel");
const logActivity = require("../libs/logger");

// Helper to get all settings as a flat object
const getAllSettingsInternal = async () => {
    const settings = await Setting.find();
    return settings.reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
    }, {});
};

module.exports.getSettings = async (req, res) => {
    try {
        const settings = await getAllSettingsInternal();
        res.status(200).json(settings);
    } catch (error) {
        res.status(500).json({ message: "Error fetching settings", error: error.message });
    }
};

module.exports.updateSettings = async (req, res) => {
    try {
        const updates = req.body; // Expecting an object { key1: value1, key2: value2 }
        const userId = req.user._id;

        const results = [];
        for (const [key, value] of Object.entries(updates)) {
            const updatedSetting = await Setting.findOneAndUpdate(
                { key },
                { value },
                { upsert: true, new: true }
            );
            results.push(updatedSetting);
        }

        await logActivity({
            action: "Update Settings",
            description: `Global settings updated by ${req.user.full_name}`,
            entity: "settings",
            userId,
            ipAddress: req.ip
        });

        const allSettings = await getAllSettingsInternal();
        res.status(200).json({ message: "Settings updated successfully", settings: allSettings });
    } catch (error) {
        res.status(500).json({ message: "Error updating settings", error: error.message });
    }
};

// Seed default settings
module.exports.seedDefaults = async () => {
    const defaults = {
        // Company Settings
        company_name: "My Inventory Store",
        company_email: "admin@store.com",
        company_phone: "+977-9800000000",
        company_address: "Kathmandu, Nepal",
        company_pan: "123456789",
        company_logo: null,
        currency: "NPR",
        // Financial Settings
        default_tax_percentage: 13,
        default_discount_percentage: 10,
        purchase_default_tax: 0,
        purchase_default_discount: 0,
        currency_symbol: "Rs.",
        timezone: "Asia/Kathmandu",
        invoice_footer: "Thank you for your business!",



        // Inventory Settings
        allow_negative_stock: false,
        default_reorder_level: 10,
        enable_low_stock_alert: true,
        auto_stock_deduction: true,

        // Security Settings
        session_timeout: 60,
        min_password_length: 6,
        enable_rbac: true
    };

    for (const [key, value] of Object.entries(defaults)) {
        await Setting.findOneAndUpdate(
            { key },
            { $setOnInsert: { key, value } },
            { upsert: true }
        );
    }
};
