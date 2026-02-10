const express = require("express")
const router = express.Router()
const { createCategory, RemoveCategory, getCategory, updateCategory, Searchcategory } = require('../controller/categorycontroller')
const { authmiddleware, staffmiddleware, adminmiddleware } = require('../middleware/Authmiddleware')

// CRUD operations - Staff and Admin can manage categories
router.post("/createcategory", authmiddleware, adminmiddleware, createCategory)
router.get("/getcategory", getCategory)
router.get("/searchcategory", authmiddleware, Searchcategory)
router.put("/updatecategory/:CategoryId", authmiddleware, adminmiddleware, updateCategory)

// Delete - Admin only
router.delete("/removecategory/:CategoryId", authmiddleware, adminmiddleware, RemoveCategory)

module.exports = router



module.exports = router