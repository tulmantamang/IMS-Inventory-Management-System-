const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    full_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['ADMIN', 'STAFF'],
        default: 'STAFF',
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE'],
        default: 'ACTIVE'
    },
    profile_image: {
        type: String,
        default: null
    }
}, { timestamps: true });

const User = mongoose.model("User", UserSchema);

module.exports = User;