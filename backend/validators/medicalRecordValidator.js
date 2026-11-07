function validateMedicalRecord(data) {
  const errors = [];

  if (!data.RecordID || typeof data.RecordID !== "string" || !data.RecordID.trim()) {
    errors.push("RecordID is required");
  }

  // Accept either a string patient code (e.g. 'MC-2024-8840') or a numeric patient ID
  const patientId = data.PatientID;
  const isValidPatientId = (typeof patientId === 'string' && patientId.trim()) || (typeof patientId === 'number' && Number.isInteger(patientId));
  if (!isValidPatientId) {
    errors.push("PatientID is required (string code or integer)");
  }

  if (!data.Diagnosis || typeof data.Diagnosis !== "string" || !data.Diagnosis.trim()) {
    errors.push("Diagnosis is required");
  }

  if (data.TreatmentDetails !== undefined && typeof data.TreatmentDetails !== "string") {
    errors.push("TreatmentDetails must be a string");
  }

  if (data.RecordDate !== undefined && data.RecordDate !== null) {
    const date = new Date(data.RecordDate);
    if (Number.isNaN(date.getTime())) {
      errors.push("RecordDate must be a valid date");
    }
  }

  return errors;
}

module.exports = {
  validateMedicalRecord
};
