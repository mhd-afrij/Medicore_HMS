function validatePatient(data) {
  const errors = [];

  if (!data.PatientID || typeof data.PatientID !== "string" || !data.PatientID.trim()) {
    errors.push("PatientID is required");
  }

  if (!data.FirstName || typeof data.FirstName !== "string" || !data.FirstName.trim()) {
    errors.push("FirstName is required");
  }

  if (!data.LastName || typeof data.LastName !== "string" || !data.LastName.trim()) {
    errors.push("LastName is required");
  }

  if (!data.Gender || typeof data.Gender !== "string" || !["Male", "Female", "Other"].includes(data.Gender)) {
    errors.push("Gender is required and must be 'Male', 'Female', or 'Other'");
  }

  if (!data.DateOfBirth || isNaN(Date.parse(data.DateOfBirth))) {
    errors.push("DateOfBirth is required and must be a valid date");
  }

  if (!data.ContactNo || typeof data.ContactNo !== "string" || !data.ContactNo.trim()) {
    errors.push("ContactNo is required");
  }

  if (
    !data.BloodGroup ||
    typeof data.BloodGroup !== "string" ||
    !data.BloodGroup.trim() ||
    ![
      "A+",
      "A-",
      "B+",
      "B-",
      "AB+",
      "AB-",
      "O+",
      "O-"
    ].includes(data.BloodGroup)
  ) {
    errors.push("BloodGroup is required and must be one of: A+, A-, B+, B-, AB+, AB-, O+, O-");
  }

  return errors;
}

module.exports = {
  validatePatient
};

