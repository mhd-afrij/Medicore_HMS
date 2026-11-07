const express = require("express");
const {
  listBeds,
  getBed,
  createNewBed,
  updateExistingBed,
  deleteExistingBed
} = require("../controllers/bedController");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticateToken);

router.get("/", listBeds);
router.get("/:id", getBed);
router.post("/", createNewBed);
router.put("/:id", updateExistingBed);
router.delete("/:id", deleteExistingBed);

module.exports = router;
