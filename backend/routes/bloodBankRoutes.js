const express = require("express");
const {
  listBloodBanks,
  createNewBloodBank
} = require("../controllers/bloodBankController");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(authenticateToken);

router.get("/", listBloodBanks);
router.post("/", createNewBloodBank);

module.exports = router;
