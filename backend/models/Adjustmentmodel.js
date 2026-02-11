const mongoose = require('mongoose');

const AdjustmentSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['INCREASE', 'DECREASE'],
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    reason: {
        type: String,
        required: true,
        trim: true
    },
    remarks: {
        type: String,
        trim: true,
        default: ''
    },
    adjustedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const Adjustment = mongoose.model('Adjustment', AdjustmentSchema);
module.exports = Adjustment;
