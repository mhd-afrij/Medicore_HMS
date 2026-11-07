function validateStaff(data) {
  const errors = [];

  if (!data.StaffID || typeof data.StaffID !== "string" || !data.StaffID.trim()) {
    errors.push("StaffID is required");
  }

  // Accept either `Staffname` (existing DB field) or `StaffName` from frontend
  const staffNameValue = data.Staffname || data.StaffName || '';
  if (!staffNameValue || typeof staffNameValue !== "string" || !staffNameValue.trim()) {
    errors.push("StaffName is required");
  }

  if (!data.Role || typeof data.Role !== "string" || !data.Role.trim()) {
    errors.push("Role is required");
  }

  if (!data.ContactNo || typeof data.ContactNo !== "string" || !data.ContactNo.trim()) {
    errors.push("ContactNo is required");
  }

  if (data.Salary !== undefined) {
    const num = Number(data.Salary);
    if (Number.isNaN(num) || num < 0) {
      errors.push("Salary must be a non-negative number");
    }
  }

  return errors;
}

module.exports = {
  validateStaff
};
