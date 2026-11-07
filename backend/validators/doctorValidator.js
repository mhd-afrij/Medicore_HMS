const MAX_DOCTOR_ID_LENGTH = 10;
const MAX_DOCTOR_NAME_LENGTH = 100;
const MAX_SPECIALIZATION_LENGTH = 100;
const MAX_EMAIL_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 255;

function normalizeDoctorData(data = {}) {
  return {
    DoctorID: data.DoctorID || data.doctorId || data.doctorID || '',
    DoctorName: data.DoctorName || data.doctorName || '',
    Specialization: data.Specialization || data.specialization || '',
    Email: data.Email || data.email || '',
    Description: data.Description || data.description || ''
  };
}

function validateDoctor(data) {
  const normalized = normalizeDoctorData(data);
  const errors = [];

  if (!normalized.DoctorID || typeof normalized.DoctorID !== 'string' || !normalized.DoctorID.trim()) {
    errors.push('DoctorID is required');
  } else if (normalized.DoctorID.length > MAX_DOCTOR_ID_LENGTH) {
    errors.push(`DoctorID must be ${MAX_DOCTOR_ID_LENGTH} characters or fewer`);
  }

  if (!normalized.DoctorName || typeof normalized.DoctorName !== 'string' || !normalized.DoctorName.trim()) {
    errors.push('DoctorName is required');
  } else if (normalized.DoctorName.length > MAX_DOCTOR_NAME_LENGTH) {
    errors.push(`DoctorName must be ${MAX_DOCTOR_NAME_LENGTH} characters or fewer`);
  }

  const specializationValue = normalized.Specialization;
  if (!specializationValue || typeof specializationValue !== 'string' || !specializationValue.trim()) {
    errors.push('Specialization is required');
  } else if (specializationValue.length > MAX_SPECIALIZATION_LENGTH) {
    errors.push(`Specialization must be ${MAX_SPECIALIZATION_LENGTH} characters or fewer`);
  }

  if (!normalized.Email || typeof normalized.Email !== 'string' || !normalized.Email.trim()) {
    errors.push('Email is required');
  } else if (normalized.Email.length > MAX_EMAIL_LENGTH) {
    errors.push(`Email must be ${MAX_EMAIL_LENGTH} characters or fewer`);
  }

  if (normalized.Description && normalized.Description.length > MAX_DESCRIPTION_LENGTH) {
    errors.push(`Profile notes must be ${MAX_DESCRIPTION_LENGTH} characters or fewer`);
  }

  return errors;
}

module.exports = {
  normalizeDoctorData,
  validateDoctor
};
