const {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
} = require("../services/departmentService");

async function listDepartments(req, res, next) {
  try {
    const departments = await getAllDepartments();
    res.json({ success: true, data: departments });
  } catch (error) {
    next(error);
  }
}

async function getDepartment(req, res, next) {
  try {
    const department = await getDepartmentById(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, error: { message: "Department not found" } });
    }
    res.json({ success: true, data: department });
  } catch (error) {
    next(error);
  }
}

async function createNewDepartment(req, res, next) {
  try {
    if (!req.body.Name || typeof req.body.Name !== "string" || !req.body.Name.trim()) {
      return res.status(400).json({ success: false, error: { message: "Department name is required" } });
    }

    const department = await createDepartment(req.body);
    res.status(201).json({ success: true, data: department });
  } catch (error) {
    next(error);
  }
}

async function updateExistingDepartment(req, res, next) {
  try {
    if (!req.body.Name || typeof req.body.Name !== "string" || !req.body.Name.trim()) {
      return res.status(400).json({ success: false, error: { message: "Department name is required" } });
    }

    const department = await updateDepartment(req.params.id, req.body);
    if (!department) {
      return res.status(404).json({ success: false, error: { message: "Department not found" } });
    }

    res.json({ success: true, data: department });
  } catch (error) {
    next(error);
  }
}

async function deleteExistingDepartment(req, res, next) {
  try {
    const department = await deleteDepartment(req.params.id);
    if (!department) {
      return res.status(404).json({ success: false, error: { message: "Department not found" } });
    }
    res.json({ success: true, data: { message: "Department deleted successfully" } });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listDepartments,
  getDepartment,
  createNewDepartment,
  updateExistingDepartment,
  deleteExistingDepartment
};
