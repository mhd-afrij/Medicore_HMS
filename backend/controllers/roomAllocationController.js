const {
  getAllRoomAllocations,
  getRoomAllocationById,
  createRoomAllocation,
  updateRoomAllocation,
  deleteRoomAllocation
} = require("../services/roomAllocationService");
const { validateRoomAllocation } = require("../validators/roomAllocationValidator");

async function listRoomAllocations(req, res, next) {
  try {
    const allocations = await getAllRoomAllocations();
    res.json({ success: true, data: allocations });
  } catch (error) {
    next(error);
  }
}

async function getRoomAllocation(req, res, next) {
  try {
    const allocation = await getRoomAllocationById(req.params.id);
    if (!allocation) {
      return res.status(404).json({ success: false, error: { message: "Room allocation not found" } });
    }
    res.json({ success: true, data: allocation });
  } catch (error) {
    next(error);
  }
}

async function createNewRoomAllocation(req, res, next) {
  try {
    const errors = validateRoomAllocation(req.body);
    if (errors.length) {
      return res.status(400).json({ success: false, error: { message: "Validation failed", details: errors } });
    }

    const allocation = await createRoomAllocation(req.body);
    res.status(201).json({ success: true, data: allocation });
  } catch (error) {
    next(error);
  }
}

async function updateExistingRoomAllocation(req, res, next) {
  try {
    const errors = validateRoomAllocation(req.body);
    if (errors.length) {
      return res.status(400).json({ success: false, error: { message: "Validation failed", details: errors } });
    }

    const allocation = await updateRoomAllocation(req.params.id, req.body);
    if (!allocation) {
      return res.status(404).json({ success: false, error: { message: "Room allocation not found" } });
    }
    res.json({ success: true, data: allocation });
  } catch (error) {
    next(error);
  }
}

async function deleteExistingRoomAllocation(req, res, next) {
  try {
    const allocation = await deleteRoomAllocation(req.params.id);
    if (!allocation) {
      return res.status(404).json({ success: false, error: { message: "Room allocation not found" } });
    }
    res.json({ success: true, data: { message: "Room allocation deleted successfully" } });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listRoomAllocations,
  getRoomAllocation,
  createNewRoomAllocation,
  updateExistingRoomAllocation,
  deleteExistingRoomAllocation
};
