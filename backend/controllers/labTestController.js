const {
  getAllLabTests,
  getLabTestById,
  createLabTest,
  updateLabTest,
  deleteLabTest
} = require("../services/labTestService");
const { validateLabTest } = require("../validators/labTestValidator");

async function listLabTests(req, res, next) {
  try {
    const labTests = await getAllLabTests();
    res.json({ success: true, data: labTests });
  } catch (error) {
    next(error);
  }
}

async function getLabTest(req, res, next) {
  try {
    const labTest = await getLabTestById(req.params.id);
    if (!labTest) {
      return res.status(404).json({ success: false, error: { message: "Lab test not found" } });
    }
    res.json({ success: true, data: labTest });
  } catch (error) {
    next(error);
  }
}

async function createNewLabTest(req, res, next) {
  try {
    // Normalize legacy/alternate field names onto expected keys
    const payload = Object.assign({}, req.body);
    if (!payload.TestID && payload.LabTestID) payload.TestID = payload.LabTestID;
    if (!payload.PatientID && payload.MedicalRecordID) payload.PatientID = String(payload.MedicalRecordID);
    if (!payload.DoctorID && payload.RequestedBy) payload.DoctorID = payload.RequestedBy;
    if (!payload.TestType && payload.TestName) payload.TestType = payload.TestName;

    const errors = validateLabTest(payload);
    if (errors.length) {
      return res.status(400).json({ success: false, error: { message: "Validation failed", details: errors } });
    }
    const labTest = await createLabTest(payload);
    res.status(201).json({ success: true, data: labTest });
  } catch (error) {
    next(error);
  }
}

async function updateExistingLabTest(req, res, next) {
  try {
    const payload = Object.assign({}, req.body);
    if (!payload.TestID && payload.LabTestID) payload.TestID = payload.LabTestID;
    if (!payload.PatientID && payload.MedicalRecordID) payload.PatientID = String(payload.MedicalRecordID);
    if (!payload.DoctorID && payload.RequestedBy) payload.DoctorID = payload.RequestedBy;
    if (!payload.TestType && payload.TestName) payload.TestType = payload.TestName;

    const errors = validateLabTest(payload);
    if (errors.length) {
      return res.status(400).json({ success: false, error: { message: "Validation failed", details: errors } });
    }

    const labTest = await updateLabTest(req.params.id, payload);
    if (!labTest) {
      return res.status(404).json({ success: false, error: { message: "Lab test not found" } });
    }
    res.json({ success: true, data: labTest });
  } catch (error) {
    next(error);
  }
}

async function deleteExistingLabTest(req, res, next) {
  try {
    const labTest = await deleteLabTest(req.params.id);
    if (!labTest) {
      return res.status(404).json({ success: false, error: { message: "Lab test not found" } });
    }
    res.json({ success: true, data: { message: "Lab test deleted successfully" } });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listLabTests,
  getLabTest,
  createNewLabTest,
  updateExistingLabTest,
  deleteExistingLabTest
};
