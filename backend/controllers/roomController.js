const {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom
} = require("../services/roomService");
const { validateRoom } = require("../validators/roomValidator");

async function listRooms(req, res, next) {
  try {
    const rooms = await getAllRooms();
    res.json({ success: true, data: rooms });
  } catch (error) {
    next(error);
  }
}

async function getRoom(req, res, next) {
  try {
    const room = await getRoomById(req.params.roomId);
    if (!room) {
      return res.status(404).json({ success: false, error: { message: "Room not found" } });
    }
    res.json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
}

function normalizeRoomPayload(data) {
  const payload = Object.assign({}, data);
  if (!payload.RoomNumber && payload.Name) payload.RoomNumber = payload.Name;
  if (!payload.RoomType && payload.Type) payload.RoomType = payload.Type;
  if (payload.DailyCharge === undefined && payload.Description !== undefined) payload.DailyCharge = payload.Description;
  return payload;
}

async function createNewRoom(req, res, next) {
  try {
    const payload = normalizeRoomPayload(req.body);
    const errors = validateRoom(payload);
    if (errors.length) {
      return res.status(400).json({ success: false, error: { message: "Validation failed", details: errors } });
    }

    const room = await createRoom(payload);
    res.status(201).json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
}

async function updateExistingRoom(req, res, next) {
  try {
    const payload = normalizeRoomPayload(req.body);
    const errors = validateRoom(payload);
    if (errors.length) {
      return res.status(400).json({ success: false, error: { message: "Validation failed", details: errors } });
    }

    const room = await updateRoom(req.params.roomId, payload);
    if (!room) {
      return res.status(404).json({ success: false, error: { message: "Room not found" } });
    }
    res.json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
}

async function deleteExistingRoom(req, res, next) {
  try {
    const room = await deleteRoom(req.params.roomId);
    if (!room) {
      return res.status(404).json({ success: false, error: { message: "Room not found" } });
    }
    res.json({ success: true, data: { message: "Room deleted successfully" } });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listRooms,
  getRoom,
  createNewRoom,
  updateExistingRoom,
  deleteExistingRoom
};
