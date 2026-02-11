const express = require("express")
const router = express.Router()
const { createCategory, RemoveCategory, getCategory, updateCategory, Searchcategory } = require('../controller/categorycontroller')
const { authmiddleware, staffmiddleware, adminmiddleware } = require('../middleware/Authmiddleware')

// CRUD operations - Staff and Admin can manage categories
router.post("/createcategory", authmiddleware, staffmiddleware, createCategory)
router.get("/getcategory", getCategory)
router.get("/searchcategory", authmiddleware, Searchcategory)
router.put("/updatecategory/:CategoryId", authmiddleware, staffmiddleware, updateCategory)

// Delete - Staff and Admin
router.delete("/removecategory/:CategoryId", authmiddleware, staffmiddleware, RemoveCategory)

module.exports = router



module.exports = router