function validateNurse(data) {
  const errors = [];

  if (!data.NurseID || typeof data.NurseID !== "string" || !data.NurseID.trim()) {
    errors.push("NurseID is required");
  }

  if (!data.FirstName || typeof data.FirstName !== "string" || !data.FirstName.trim()) {
    errors.push("FirstName is required");
  }

  if (!data.LastName || typeof data.LastName !== "string" || !data.LastName.trim()) {
    errors.push("LastName is required");
  }

  if (!data.DepartmentID || typeof data.DepartmentID !== "number" || !Number.isInteger(data.DepartmentID)) {
    errors.push("DepartmentID is required and must be an integer");
  }

  if (!data.ContactNo || typeof data.ContactNo !== "string" || !data.ContactNo.trim()) {
    errors.push("ContactNo is required");
  }

  if (data.Email !== undefined && typeof data.Email !== "string") {
    errors.push("Email must be a string");
  }

  return errors;
}

module.exports = {
  validateNurse
};
