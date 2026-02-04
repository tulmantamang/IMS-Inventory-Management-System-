const express = require("express");
const router = express.Router();
const { createNotification, getAllNotifications, getUnreadNotifications, markAsRead, deleteNotification } = require("../controller/notificationcontroller");
const { authmiddleware, adminmiddleware } = require("../middleware/Authmiddleware");

// Only admin can create and delete notifications
router.post("/createNotification", authmiddleware, adminmiddleware, createNotification);
router.get("/allNotification", authmiddleware, getAllNotifications);
router.get("/unreadNotification", authmiddleware, getUnreadNotifications);
router.put("/:id/readNotification", authmiddleware, markAsRead);
router.delete("/deleteNotification/:id/", authmiddleware, adminmiddleware, deleteNotification);

module.exports = router;
