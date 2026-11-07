const {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff
} = require("../services/staffService");
const { validateStaff } = require("../validators/staffValidator");

async function listStaff(req, res, next) {
  try {
    const staff = await getAllStaff();
    res.json({ success: true, data: staff });
  } catch (error) {
    next(error);
  }
}

async function getStaff(req, res, next) {
  try {
    const staff = await getStaffById(req.params.id);
    if (!staff) {
      return res.status(404).json({ success: false, error: { message: "Staff member not found" } });
    }
    res.json({ success: true, data: staff });
  } catch (error) {
    next(error);
  }
}

async function createNewStaff(req, res, next) {
  try {
    // Normalize incoming name fields: prefer StaffName, then Staffname, then FirstName+LastName
    req.body.Staffname = req.body.StaffName || req.body.Staffname || ((req.body.FirstName || '') + ' ' + (req.body.LastName || '')).trim();
    const errors = validateStaff(req.body);
    if (errors.length) {
      return res.status(400).json({ success: false, error: { message: "Validation failed", details: errors } });
    }

    const staff = await createStaff(req.body);
    res.status(201).json({ success: true, data: staff });
  } catch (error) {
    next(error);
  }
}

async function updateExistingStaff(req, res, next) {
  try {
    // Normalize name for updates as well
    req.body.Staffname = req.body.StaffName || req.body.Staffname || ((req.body.FirstName || '') + ' ' + (req.body.LastName || '')).trim();
    const errors = validateStaff(req.body);
    if (errors.length) {
      return res.status(400).json({ success: false, error: { message: "Validation failed", details: errors } });
    }

    const staff = await updateStaff(req.params.id, req.body);
    if (!staff) {
      return res.status(404).json({ success: false, error: { message: "Staff member not found" } });
    }
    res.json({ success: true, data: staff });
  } catch (error) {
    next(error);
  }
}

async function deleteExistingStaff(req, res, next) {
  try {
    const staff = await deleteStaff(req.params.id);
    if (!staff) {
      return res.status(404).json({ success: false, error: { message: "Staff member not found" } });
    }
    res.json({ success: true, data: { message: "Staff member deleted successfully" } });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listStaff,
  getStaff,
  createNewStaff,
  updateExistingStaff,
  deleteExistingStaff
};
