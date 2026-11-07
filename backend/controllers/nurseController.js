const {
  getAllNurses,
  getNurseById,
  createNurse,
  updateNurse,
  deleteNurse
} = require("../services/nurseService");
const { validateNurse } = require("../validators/nurseValidator");

async function listNurses(req, res, next) {
  try {
    const nurses = await getAllNurses();
    res.json({ success: true, data: nurses });
  } catch (error) {
    next(error);
  }
}

async function getNurse(req, res, next) {
  try {
    const nurse = await getNurseById(req.params.id);
    if (!nurse) {
      return res.status(404).json({ success: false, error: { message: "Nurse not found" } });
    }
    res.json({ success: true, data: nurse });
  } catch (error) {
    next(error);
  }
}

async function createNewNurse(req, res, next) {
  try {
    const errors = validateNurse(req.body);
    if (errors.length) {
      return res.status(400).json({ success: false, error: { message: "Validation failed", details: errors } });
    }

    const nurse = await createNurse(req.body);
    res.status(201).json({ success: true, data: nurse });
  } catch (error) {
    next(error);
  }
}

async function updateExistingNurse(req, res, next) {
  try {
    const errors = validateNurse(req.body);
    if (errors.length) {
      return res.status(400).json({ success: false, error: { message: "Validation failed", details: errors } });
    }

    const nurse = await updateNurse(req.params.id, req.body);
    if (!nurse) {
      return res.status(404).json({ success: false, error: { message: "Nurse not found" } });
    }
    res.json({ success: true, data: nurse });
  } catch (error) {
    next(error);
  }
}

async function deleteExistingNurse(req, res, next) {
  try {
    const nurse = await deleteNurse(req.params.id);
    if (!nurse) {
      return res.status(404).json({ success: false, error: { message: "Nurse not found" } });
    }
    res.json({ success: true, data: { message: "Nurse deleted successfully" } });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listNurses,
  getNurse,
  createNewNurse,
  updateExistingNurse,
  deleteExistingNurse
};
