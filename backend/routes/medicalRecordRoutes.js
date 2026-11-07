const express = require("express");
const {
  listMedicalRecords,
  getMedicalRecord,
  createNewMedicalRecord,
  updateExistingMedicalRecord,
  deleteExistingMedicalRecord
} = require("../controllers/medicalRecordController");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticateToken);

router.get("/", listMedicalRecords);
router.get("/:id", getMedicalRecord);
router.post("/", createNewMedicalRecord);
router.put("/:id", updateExistingMedicalRecord);
router.delete("/:id", deleteExistingMedicalRecord);

module.exports = router;
