const express = require("express");
const {
  listPrescriptions,
  getPrescription,
  createNewPrescription,
  updateExistingPrescription,
  deleteExistingPrescription
} = require("../controllers/prescriptionController");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticateToken);

router.get("/", listPrescriptions);
router.get("/:id", getPrescription);
router.post("/", createNewPrescription);
router.put("/:id", updateExistingPrescription);
router.delete("/:id", deleteExistingPrescription);

module.exports = router;
