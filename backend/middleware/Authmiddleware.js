const jwt = require('jsonwebtoken');
const User = require('../models/Usermodel');
require('dotenv').config();

module.exports.authmiddleware = async (req, res, next) => {
    let token;
    try {
        token = req.cookies.Inventorymanagmentsystem;

        // Fallback to Authorization Header
        if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({ message: "Unauthorized: No token provided." });
        }

        const decodedToken = jwt.verify(token, process.env.SecretKey);

        if (!decodedToken || !decodedToken.userId) {
            return res.status(401).json({ message: "Unauthorized: Invalid token." });
        }

        const user = await User.findById(decodedToken.userId).select("-password");

        if (!user) {
            return res.status(401).json({ message: "Unauthorized: User not found." });
        }

        if (user.status === 'INACTIVE') {
            return res.status(403).json({ message: "Access denied. Account is inactive." });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("Token verification error:", error.message, "Token snippet:", token ? `${token.substring(0, 10)}...` : "NULL/EMPTY");
        return res.status(401).json({ message: "Unauthorized: Invalid or expired token." });
    }
};

module.exports.adminmiddleware = async (req, res, next) => {
    const user = req.user;
    if (!user) {
        return res.status(403).json({ message: "Access denied. Not authenticated." });
    }

    const DrawingSetting = require('../models/Settingmodel');
    const settingsList = await DrawingSetting.find();
    const settings = settingsList.reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
    }, {});

    const rbacEnabled = settings.enable_rbac !== false;
    const role = user.role?.trim().toUpperCase();

    if (rbacEnabled && role !== "ADMIN") {
        return res.status(403).json({ message: "Access denied. Admin role required." });
    }
    next();
};

// Staff middleware allows both Staff AND Admin
module.exports.staffmiddleware = async (req, res, next) => {
    const user = req.user;
    if (!user) {
        return res.status(403).json({ message: "Access denied. Not authenticated." });
    }
    const role = user.role?.trim().toUpperCase();
    if (role === "ADMIN" || role === "STAFF") {
        next();
    } else {
        return res.status(403).json({ message: "Access denied. Staff or Admin role required." });
    }
};

// Generic role authorizer
module.exports.authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            return res.status(403).json({ message: "Access denied. Not authenticated." });
        }
        const userRole = user.role?.trim().toUpperCase();
        if (allowedRoles.map(r => r.toUpperCase()).includes(userRole)) {
            next();
        } else {
            return res.status(403).json({ message: `Access denied. Role ${allowedRoles.join(' or ')} required.` });
        }
    };
};
