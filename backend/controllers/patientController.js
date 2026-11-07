const {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient
} = require("../services/patientService");
const { validatePatient } = require("../validators/patientValidator");

async function listPatients(req, res, next) {
  try {
    const patients = await getAllPatients();
    res.json({ success: true, data: patients });
  } catch (error) {
    next(error);
  }
}

async function getPatient(req, res, next) {
  try {
    const patient = await getPatientById(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, error: { message: "Patient not found" } });
    }
    res.json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
}

async function createNewPatient(req, res, next) {
  try {
    const errors = validatePatient(req.body);
    if (errors.length) {
      return res.status(400).json({ success: false, error: { message: "Validation failed", details: errors } });
    }

    const patient = await createPatient(req.body);
    res.status(201).json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
}

async function updateExistingPatient(req, res, next) {
  try {
    const errors = validatePatient(req.body);
    if (errors.length) {
      return res.status(400).json({ success: false, error: { message: "Validation failed", details: errors } });
    }

    const patient = await updatePatient(req.params.id, req.body);
    if (!patient) {
      return res.status(404).json({ success: false, error: { message: "Patient not found" } });
    }

    res.json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
}

async function deleteExistingPatient(req, res, next) {
  try {
    const patient = await deletePatient(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, error: { message: "Patient not found" } });
    }

    res.json({ success: true, data: { message: "Patient deleted successfully" } });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listPatients,
  getPatient,
  createNewPatient,
  updateExistingPatient,
  deleteExistingPatient
};
