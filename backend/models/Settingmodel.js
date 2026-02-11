const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
});

settingSchema.pre("save", function (next) {
    this.updated_at = Date.now();
    next();
});

module.exports = mongoose.model("Setting", settingSchema);
