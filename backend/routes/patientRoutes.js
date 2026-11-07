const express = require("express");
const {
  listPatients,
  getPatient,
  createNewPatient,
  updateExistingPatient,
  deleteExistingPatient
} = require("../controllers/patientController");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticateToken);

router.get("/", listPatients);
router.get("/:id", getPatient);
router.post("/", createNewPatient);
router.put("/:id", updateExistingPatient);
router.delete("/:id", deleteExistingPatient);

module.exports = router;
