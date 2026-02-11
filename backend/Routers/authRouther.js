const express = require("express")
const router = express.Router()
const { signup, login, logout, userCounts, removeuser, checkUser, getAllUsers, updateUserSecret, updateUserProfile } = require('../controller/authcontroller')
const { authmiddleware, adminmiddleware } = require('../middleware/Authmiddleware')

router.post("/signup", signup)
router.post("/login", login)
router.post("/logout", authmiddleware, logout)

// User Management (Admin Only)
router.get("/all", authmiddleware, adminmiddleware, getAllUsers)
router.put("/update-user", authmiddleware, adminmiddleware, updateUserSecret)
router.delete("/removeuser/:UserId", authmiddleware, adminmiddleware, removeuser)

router.get("/usercounts", authmiddleware, userCounts)
router.get("/check", authmiddleware, checkUser)
router.put("/profile", authmiddleware, updateUserProfile)

module.exports = router