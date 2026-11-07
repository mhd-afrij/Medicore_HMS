const express = require("express");
const {
  listStaff,
  getStaff,
  createNewStaff,
  updateExistingStaff,
  deleteExistingStaff
} = require("../controllers/staffController");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticateToken);

router.get("/", listStaff);
router.get("/:id", getStaff);
router.post("/", createNewStaff);
router.put("/:id", updateExistingStaff);
router.delete("/:id", deleteExistingStaff);

module.exports = router;
