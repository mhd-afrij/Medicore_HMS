const express = require("express");
const {
  listAppointments,
  getAppointment,
  createNewAppointment,
  updateExistingAppointment,
  deleteExistingAppointment
} = require("../controllers/appointmentController");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticateToken);

router.get("/", listAppointments);
router.get("/:id", getAppointment);
router.post("/", createNewAppointment);
router.put("/:id", updateExistingAppointment);
router.delete("/:id", deleteExistingAppointment);

module.exports = router;
