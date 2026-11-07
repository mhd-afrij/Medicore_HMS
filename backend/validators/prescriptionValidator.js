function validatePrescription(data) {
  const errors = [];

  const id = data.PrescriptionID || data.PrescriptionsID || data.PrescriptionsId || data.id;
  if (!id || typeof id !== 'string' || !id.trim()) {
    errors.push('PrescriptionID is required');
  }

  const record = data.MedicalRecordID || data.RecordID || data.recordID || data.RecordId || data.Record || data.PatientID;
  if (!record || (typeof record !== 'string' && typeof record !== 'number')) {
    errors.push('MedicalRecordID is required');
  }

  const doctor = data.DoctorID || data.doctorID || data.Doctor || data.doctor;
  if (!doctor || typeof doctor !== 'string') {
    errors.push('DoctorID is required');
  }

  const date = data.PrescriptionDate || data.prescriptionDate || data.Date;
  if (!date || isNaN(new Date(date).getTime())) {
    errors.push('PrescriptionDate is required and must be a valid date');
  }

  // Medicine column is optional — the PRESCRIPTION table may not have it

  return errors;
}

module.exports = {
  validatePrescription
};
