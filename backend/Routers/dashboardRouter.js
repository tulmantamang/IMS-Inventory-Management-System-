const express = require("express");
const router = express.Router();
const { getDashboardStats } = require("../controller/dashboardController");
const { authmiddleware, adminmiddleware } = require("../middleware/Authmiddleware");

router.get("/stats", authmiddleware, adminmiddleware, getDashboardStats);

module.exports = router;
