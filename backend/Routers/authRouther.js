const express = require("express")
const router = express.Router()
const { signup, login, updateProfile, logout, staffuser, adminuser, userCounts, removeuser, checkUser, getAllUsers, updateUserSecret } = require('../controller/authController')
const { authmiddleware, adminmiddleware } = require('../middleware/Authmiddleware')

router.post("/signup", signup)
router.post("/login", login)
router.post("/logout", authmiddleware, logout)
router.put("/updateProfile", authmiddleware, updateProfile)

// User Management (Admin Only)
router.get("/all", authmiddleware, adminmiddleware, getAllUsers)
router.put("/update-user", authmiddleware, adminmiddleware, updateUserSecret)
router.delete("/removeuser/:UserId", authmiddleware, adminmiddleware, removeuser)

router.get("/staffuser", authmiddleware, staffuser)
router.get("/adminuser", authmiddleware, adminuser)
router.get("/usercounts", authmiddleware, userCounts)
router.get("/check", authmiddleware, checkUser)

module.exports = router