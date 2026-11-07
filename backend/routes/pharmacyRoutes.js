const express = require("express");
const {
  listPharmacies,
  getPharmacy,
  createNewPharmacy,
  updateExistingPharmacy,
  deleteExistingPharmacy
} = require("../controllers/pharmacyController");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticateToken);

router.get("/", listPharmacies);
router.get("/:id", getPharmacy);
router.post("/", createNewPharmacy);
router.put("/:id", updateExistingPharmacy);
router.delete("/:id", deleteExistingPharmacy);

module.exports = router;
