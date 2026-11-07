const express = require("express");
const {
  listDoctors,
  getDoctor,
  createNewDoctor,
  updateExistingDoctor,
  deleteExistingDoctor
} = require("../controllers/doctorController");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticateToken);

router.get("/", listDoctors);
router.get("/:id", getDoctor);
router.post("/", createNewDoctor);
router.put("/:id", updateExistingDoctor);
router.delete("/:id", deleteExistingDoctor);

module.exports = router;
