const express = require("express");
const router = express.Router();
const { getSettings, updateSettings } = require("../controller/settingcontroller");
const { authmiddleware, adminmiddleware } = require("../middleware/Authmiddleware");

router.get("/", authmiddleware, getSettings);
router.put("/", authmiddleware, adminmiddleware, updateSettings);

module.exports = router;
