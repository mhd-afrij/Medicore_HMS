const express = require("express");
const {
  listRoomAllocations,
  getRoomAllocation,
  createNewRoomAllocation,
  updateExistingRoomAllocation,
  deleteExistingRoomAllocation
} = require("../controllers/roomAllocationController");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticateToken);

router.get("/", listRoomAllocations);
router.get("/:id", getRoomAllocation);
router.post("/", createNewRoomAllocation);
router.put("/:id", updateExistingRoomAllocation);
router.delete("/:id", deleteExistingRoomAllocation);

module.exports = router;
