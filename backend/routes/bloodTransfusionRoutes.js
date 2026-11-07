const express = require("express");
const {
  listBloodTransfusions,
  createNewBloodTransfusion
} = require("../controllers/bloodTransfusionController");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(authenticateToken);

router.get("/", listBloodTransfusions);
router.post("/", createNewBloodTransfusion);

module.exports = router;
