const {
  getAllMedicalRecords,
  getMedicalRecordById,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord
} = require("../services/medicalRecordService");
const { validateMedicalRecord } = require("../validators/medicalRecordValidator");

async function listMedicalRecords(req, res, next) {
  try {
    const records = await getAllMedicalRecords();
    res.json({ success: true, data: records });
  } catch (error) {
    next(error);
  }
}

async function getMedicalRecord(req, res, next) {
  try {
    const record = await getMedicalRecordById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, error: { message: "Medical record not found" } });
    }
    res.json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
}

async function createNewMedicalRecord(req, res, next) {
  try {
    const errors = validateMedicalRecord(req.body);
    if (errors.length) {
      return res.status(400).json({ success: false, error: { message: "Validation failed", details: errors } });
    }

    const record = await createMedicalRecord(req.body);
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
}

async function updateExistingMedicalRecord(req, res, next) {
  try {
    const errors = validateMedicalRecord(req.body);
    if (errors.length) {
      return res.status(400).json({ success: false, error: { message: "Validation failed", details: errors } });
    }

    const record = await updateMedicalRecord(req.params.id, req.body);
    if (!record) {
      return res.status(404).json({ success: false, error: { message: "Medical record not found" } });
    }
    res.json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
}

async function deleteExistingMedicalRecord(req, res, next) {
  try {
    const record = await deleteMedicalRecord(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, error: { message: "Medical record not found" } });
    }
    res.json({ success: true, data: { message: "Medical record deleted successfully" } });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listMedicalRecords,
  getMedicalRecord,
  createNewMedicalRecord,
  updateExistingMedicalRecord,
  deleteExistingMedicalRecord
};
