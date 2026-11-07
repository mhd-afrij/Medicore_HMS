const {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor
} = require("../services/doctorService");
const { normalizeDoctorData, validateDoctor } = require("../validators/doctorValidator");

async function listDoctors(req, res, next) {
  try {
    const doctors = await getAllDoctors();
    res.json({ success: true, data: doctors });
  } catch (error) {
    next(error);
  }
}

async function getDoctor(req, res, next) {
  try {
    const doctor = await getDoctorById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, error: { message: "Doctor not found" } });
    }
    res.json({ success: true, data: doctor });
  } catch (error) {
    next(error);
  }
}

async function createNewDoctor(req, res, next) {
  try {
    const doctorPayload = normalizeDoctorData(req.body);
    const errors = validateDoctor(doctorPayload);
    if (errors.length) {
      return res.status(400).json({ success: false, error: { message: "Validation failed", details: errors } });
    }

    const doctor = await createDoctor(doctorPayload);
    res.status(201).json({ success: true, data: doctor });
  } catch (error) {
    next(error);
  }
}

async function updateExistingDoctor(req, res, next) {
  try {
    const doctorPayload = normalizeDoctorData(req.body);
    const errors = validateDoctor(doctorPayload);
    if (errors.length) {
      return res.status(400).json({ success: false, error: { message: "Validation failed", details: errors } });
    }

    const doctor = await updateDoctor(req.params.id, doctorPayload);
    if (!doctor) {
      return res.status(404).json({ success: false, error: { message: "Doctor not found" } });
    }
    res.json({ success: true, data: doctor });
  } catch (error) {
    next(error);
  }
}

async function deleteExistingDoctor(req, res, next) {
  try {
    const doctor = await deleteDoctor(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, error: { message: "Doctor not found" } });
    }
    res.json({ success: true, data: { message: "Doctor deleted successfully" } });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listDoctors,
  getDoctor,
  createNewDoctor,
  updateExistingDoctor,
  deleteExistingDoctor
};
