const {
  getAllBeds,
  getBedById,
  createBed,
  updateBed,
  deleteBed
} = require("../services/bedService");
const { validateBed } = require("../validators/bedValidator");

async function listBeds(req, res, next) {
  try {
    const beds = await getAllBeds();
    res.json({ success: true, data: beds });
  } catch (error) {
    next(error);
  }
}

async function getBed(req, res, next) {
  try {
    const bed = await getBedById(req.params.id);
    if (!bed) {
      return res.status(404).json({ success: false, error: { message: "Bed not found" } });
    }
    res.json({ success: true, data: bed });
  } catch (error) {
    next(error);
  }
}

async function createNewBed(req, res, next) {
  try {
    const errors = validateBed(req.body);
    if (errors.length) {
      return res.status(400).json({ success: false, error: { message: "Validation failed", details: errors } });
    }

    const bed = await createBed(req.body);
    res.status(201).json({ success: true, data: bed });
  } catch (error) {
    next(error);
  }
}

async function updateExistingBed(req, res, next) {
  try {
    const errors = validateBed(req.body);
    if (errors.length) {
      return res.status(400).json({ success: false, error: { message: "Validation failed", details: errors } });
    }

    const bed = await updateBed(req.params.id, req.body);
    if (!bed) {
      return res.status(404).json({ success: false, error: { message: "Bed not found" } });
    }
    res.json({ success: true, data: bed });
  } catch (error) {
    next(error);
  }
}

async function deleteExistingBed(req, res, next) {
  try {
    const bed = await deleteBed(req.params.id);
    if (!bed) {
      return res.status(404).json({ success: false, error: { message: "Bed not found" } });
    }
    res.json({ success: true, data: { message: "Bed deleted successfully" } });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listBeds,
  getBed,
  createNewBed,
  updateExistingBed,
  deleteExistingBed
};
