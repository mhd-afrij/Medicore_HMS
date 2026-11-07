const express = require("express");
const {
  listAmbulances,
  listAmbulanceLogs,
  createNewAmbulanceLog,
  updateAmbulanceStatusHandler,
  createNewAmbulance
} = require("../controllers/ambulanceController");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();
router.use(authenticateToken);

router.get("/", listAmbulances);
router.post("/", createNewAmbulance);
router.get("/logs", listAmbulanceLogs);
router.post("/logs", createNewAmbulanceLog);
router.put("/:ambulanceId/status", updateAmbulanceStatusHandler);

module.exports = router;
