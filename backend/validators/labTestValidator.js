function validateLabTest(data) {
  const errors = [];

  // Accept either TestID or legacy LabTestID
  const testId = data.TestID || data.LabTestID;
  if (!testId || typeof testId !== "string" || !testId.trim()) {
    errors.push("TestID is required");
  }

  // Accept PatientID (string code) or MedicalRecordID (integer)
  const patientId = data.PatientID;
  const medicalRecordId = data.MedicalRecordID;
  const hasValidPatient = (typeof patientId === 'string' && patientId.trim());
  const hasValidMedRec = (typeof medicalRecordId === 'number' && Number.isInteger(medicalRecordId));
  if (!hasValidPatient && !hasValidMedRec) {
    errors.push("PatientID is required (string) or MedicalRecordID is required and must be an integer");
  }

  // Accept DoctorID or RequestedBy (legacy field)
  const doctorId = data.DoctorID || data.RequestedBy;
  if (!doctorId || typeof doctorId !== "string" || !doctorId.trim()) {
    errors.push("DoctorID (or RequestedBy) is required");
  }

  // Accept TestType or legacy TestName
  const testType = data.TestType || data.TestName;
  if (!testType || typeof testType !== "string" || !testType.trim()) {
    errors.push("TestType (or TestName) is required");
  }

  if (!data.RequestDate || Number.isNaN(Date.parse(data.RequestDate))) {
    errors.push("RequestDate is required and must be a valid date");
  }

  if (data.ResultDate !== undefined && data.ResultDate !== null && Number.isNaN(Date.parse(data.ResultDate))) {
    errors.push("ResultDate must be a valid date");
  }

  if (data.ResultValue !== undefined && data.ResultValue !== null && typeof data.ResultValue !== "string") {
    errors.push("ResultValue must be a string");
  }

  if (data.ReferenceRange !== undefined && data.ReferenceRange !== null && typeof data.ReferenceRange !== "string") {
    errors.push("ReferenceRange must be a string");
  }

  if (data.ResultFlag !== undefined && data.ResultFlag !== null && typeof data.ResultFlag !== "string") {
    errors.push("ResultFlag must be a string");
  }

  if (data.Priority !== undefined && data.Priority !== null && typeof data.Priority !== "string") {
    errors.push("Priority must be a string");
  }

  if (data.Status !== undefined && data.Status !== null && typeof data.Status !== "string") {
    errors.push("Status must be a string");
  }

  if (data.TechnicianName !== undefined && data.TechnicianName !== null && typeof data.TechnicianName !== "string") {
    errors.push("TechnicianName must be a string");
  }

  if (data.Notes !== undefined && data.Notes !== null && typeof data.Notes !== "string") {
    errors.push("Notes must be a string");
  }

  return errors;
}

module.exports = {
  validateLabTest
};
