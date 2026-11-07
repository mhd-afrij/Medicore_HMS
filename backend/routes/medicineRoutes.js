const express = require("express");
const {
  listMedicines,
  getMedicine,
  createNewMedicine,
  updateExistingMedicine,
  deleteExistingMedicine
} = require("../controllers/medicineController");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticateToken);

router.get("/", listMedicines);
router.get("/:id", getMedicine);
router.post("/", createNewMedicine);
router.put("/:id", updateExistingMedicine);
router.delete("/:id", deleteExistingMedicine);

module.exports = router;
