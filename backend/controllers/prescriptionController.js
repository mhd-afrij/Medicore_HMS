const {
  getAllPrescriptions,
  getPrescriptionById,
  createPrescription,
  updatePrescription,
  deletePrescription
} = require("../services/prescriptionService");
const { validatePrescription } = require("../validators/prescriptionValidator");

function normalizePrescription(prescription) {
  if (!prescription) return null;
  return {
    ...prescription,
    PrescriptionsID: prescription.PrescriptionID,
    PrescriptionID: prescription.PrescriptionID,
    RecordID: prescription.RecordID || prescription.MedicalRecordID || null,
    MedicalRecordID: prescription.RecordID || prescription.MedicalRecordID || null
  };
}

async function listPrescriptions(req, res, next) {
  try {
    const prescriptions = await getAllPrescriptions();
    res.json({ success: true, data: prescriptions.map(normalizePrescription) });
  } catch (error) {
    next(error);
  }
}

async function getPrescription(req, res, next) {
  try {
    const prescription = await getPrescriptionById(req.params.id);
    if (!prescription) {
      return res.status(404).json({ success: false, error: { message: "Prescription not found" } });
    }
    res.json({ success: true, data: normalizePrescription(prescription) });
  } catch (error) {
    next(error);
  }
}

async function createNewPrescription(req, res, next) {
  try {
    const payload = { ...req.body };
    payload.PrescriptionID = payload.PrescriptionsID || payload.PrescriptionID || payload.id || payload.PrescriptionsId;
    payload.RecordID = payload.RecordID || payload.MedicalRecordID || payload.RecordId || null;
    payload.PatientID = payload.PatientID || payload.patientID || payload.patient || null;
    payload.DoctorID = payload.DoctorID || payload.doctorID || payload.Doctor || payload.doctor;
    payload.PrescriptionDate = payload.PrescriptionDate || payload.prescriptionDate || payload.Date || payload.date;

    const errors = validatePrescription(payload);
    if (errors.length) {
      return res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
    }

    const prescription = await createPrescription(payload);
    res.status(201).json({ success: true, data: normalizePrescription(prescription) });
  } catch (error) {
    next(error);
  }
}

async function updateExistingPrescription(req, res, next) {
  try {
    const payload = { ...req.body };
    payload.PrescriptionID = payload.PrescriptionsID || payload.PrescriptionID || payload.id || payload.PrescriptionsId;
    payload.RecordID = payload.RecordID || payload.MedicalRecordID || payload.RecordId || null;
    payload.PatientID = payload.PatientID || payload.patientID || payload.patient || null;
    payload.DoctorID = payload.DoctorID || payload.doctorID || payload.Doctor || payload.doctor;
    payload.PrescriptionDate = payload.PrescriptionDate || payload.prescriptionDate || payload.Date || payload.date;

    const errors = validatePrescription(payload);
    if (errors.length) {
      return res.status(400).json({ success: false, error: { message: 'Validation failed', details: errors } });
    }

    const prescription = await updatePrescription(req.params.id, payload);
    if (!prescription) {
      return res.status(404).json({ success: false, error: { message: "Prescription not found" } });
    }
    res.json({ success: true, data: normalizePrescription(prescription) });
  } catch (error) {
    next(error);
  }
}

async function deleteExistingPrescription(req, res, next) {
  try {
    const prescription = await deletePrescription(req.params.id);
    if (!prescription) {
      return res.status(404).json({ success: false, error: { message: "Prescription not found" } });
    }
    res.json({ success: true, data: { message: "Prescription deleted successfully" } });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listPrescriptions,
  getPrescription,
  createNewPrescription,
  updateExistingPrescription,
  deleteExistingPrescription
};
