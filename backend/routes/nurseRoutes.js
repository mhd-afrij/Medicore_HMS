const express = require("express");
const {
  listNurses,
  getNurse,
  createNewNurse,
  updateExistingNurse,
  deleteExistingNurse
} = require("../controllers/nurseController");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticateToken);

router.get("/", listNurses);
router.get("/:id", getNurse);
router.post("/", createNewNurse);
router.put("/:id", updateExistingNurse);
router.delete("/:id", deleteExistingNurse);

module.exports = router;
