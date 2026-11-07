const express = require("express");
const {
  listDepartments,
  getDepartment,
  createNewDepartment,
  updateExistingDepartment,
  deleteExistingDepartment
} = require("../controllers/departmentController");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticateToken);

router.get("/", listDepartments);
router.get("/:id", getDepartment);
router.post("/", createNewDepartment);
router.put("/:id", updateExistingDepartment);
router.delete("/:id", deleteExistingDepartment);

module.exports = router;
