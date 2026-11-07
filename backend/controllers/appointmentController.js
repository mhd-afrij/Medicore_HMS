const {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment
} = require("../services/appointmentService");

function isValidTime(value) {
  if (!value || typeof value !== "string") return false;
  return /^\d{2}:\d{2}(?::\d{2})?(\s?(AM|PM))?$/i.test(value.trim());
}

function validateAppointment(data) {
  const errors = [];

  if (!data.PatientID || typeof data.PatientID !== "string" || !data.PatientID.trim()) {
    errors.push("PatientID is required");
  }

  if (!data.DoctorID || typeof data.DoctorID !== "string" || !data.DoctorID.trim()) {
    errors.push("DoctorID is required");
  }

  if (!data.AppointmentDate || Number.isNaN(Date.parse(data.AppointmentDate))) {
    errors.push("AppointmentDate is required and must be a valid date");
  }

  if (!data.AppointmentTime || !isValidTime(data.AppointmentTime)) {
    errors.push("AppointmentTime is required and must be a valid time");
  }

  // Backwards compat: DB uses AppointmentTIme (capital I) but API/UI uses AppointmentTime


  if (data.Status && typeof data.Status !== "string") {
    errors.push("Status must be a string");
  }

  return errors;
}

async function listAppointments(req, res, next) {
  try {
    const appointments = await getAllAppointments();
    res.json({ success: true, data: appointments });
  } catch (error) {
    next(error);
  }
}

async function getAppointment(req, res, next) {
  try {
    const appointment = await getAppointmentById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, error: { message: "Appointment not found" } });
    }
    res.json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
}

async function createNewAppointment(req, res, next) {
  try {
    const errors = validateAppointment(req.body);
    if (errors.length) {
      return res.status(400).json({ success: false, error: { message: "Validation failed", details: errors } });
    }

    const appointment = await createAppointment(req.body);
    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
}

async function updateExistingAppointment(req, res, next) {
  try {
    const errors = validateAppointment(req.body);
    if (errors.length) {
      return res.status(400).json({ success: false, error: { message: "Validation failed", details: errors } });
    }

    const appointment = await updateAppointment(req.params.id, req.body);
    if (!appointment) {
      return res.status(404).json({ success: false, error: { message: "Appointment not found" } });
    }
    res.json({ success: true, data: appointment });
  } catch (error) {
    next(error);
  }
}

async function deleteExistingAppointment(req, res, next) {
  try {
    const appointment = await deleteAppointment(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, error: { message: "Appointment not found" } });
    }
    res.json({ success: true, data: { message: "Appointment deleted successfully" } });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listAppointments,
  getAppointment,
  createNewAppointment,
  updateExistingAppointment,
  deleteExistingAppointment
};
