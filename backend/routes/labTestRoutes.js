const express = require("express");
const {
  listLabTests,
  getLabTest,
  createNewLabTest,
  updateExistingLabTest,
  deleteExistingLabTest
} = require("../controllers/labTestController");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticateToken);

router.get("/", listLabTests);
router.get("/:id", getLabTest);
router.post("/", createNewLabTest);
router.put("/:id", updateExistingLabTest);
router.delete("/:id", deleteExistingLabTest);

module.exports = router;
