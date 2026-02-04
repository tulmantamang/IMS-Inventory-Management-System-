const express = require("express");
const router = express.Router();
const {
  createOrder,
  searchOrder,
  updatestatusOrder,
  getOrder,
  getOrderStatistics,
  Removeorder,
} = require("../controller/orderController");
const {
  authmiddleware,
  adminmiddleware,
  staffmiddleware,
} = require("../middleware/Authmiddleware");

router.post("/createorder", authmiddleware, staffmiddleware, createOrder);
router.get("/getorders", authmiddleware, getOrder);
router.delete("/removeorder/:OrdertId", authmiddleware, staffmiddleware, Removeorder);
router.put("/updatestatusOrder/:OrderId", authmiddleware, staffmiddleware, updatestatusOrder);
router.get("/Searchdata", authmiddleware, searchOrder);
router.get("/graphstatusorder", authmiddleware, getOrderStatistics);


module.exports = router;
