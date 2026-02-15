const express = require("express");
const router = express.Router();
const { getDashboardStats } = require("../controller/dashboardController");
const { authmiddleware, adminmiddleware, staffmiddleware } = require("../middleware/Authmiddleware");

router.get("/stats", authmiddleware, staffmiddleware, getDashboardStats);
router.get("/summary", authmiddleware, staffmiddleware, getDashboardStats);

module.exports = router;
