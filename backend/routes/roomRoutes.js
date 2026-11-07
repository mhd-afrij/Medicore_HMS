const express = require("express");
const {
  listRooms,
  getRoom,
  createNewRoom,
  updateExistingRoom,
  deleteExistingRoom
} = require("../controllers/roomController");
const { authenticateToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticateToken);

router.get("/", listRooms);
router.get("/:roomId", getRoom);
router.post("/", createNewRoom);
router.put("/:roomId", updateExistingRoom);
router.delete("/:roomId", deleteExistingRoom);

module.exports = router;
