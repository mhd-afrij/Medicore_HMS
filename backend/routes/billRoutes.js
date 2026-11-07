const express = require("express");
const router = express.Router();
const billController = require("../controllers/billController");

router.get("/", billController.getAllBills);
router.post("/", billController.createBill);
router.put("/:id/status", billController.updateBillStatus);

module.exports = router;