function validateBill(data) {
  const errors = [];

  if (!data.BillID || typeof data.BillID !== "string" || !data.BillID.trim()) {
    errors.push("BillID is required");
  }

  if (!data.PatientID || typeof data.PatientID !== "number" || !Number.isInteger(data.PatientID)) {
    errors.push("PatientID is required and must be an integer");
  }

  if (!data.Amount || typeof data.Amount !== "number" || Number.isNaN(data.Amount)) {
    errors.push("Amount is required and must be a number");
  }

  if (!data.BillDate || Number.isNaN(Date.parse(data.BillDate))) {
    errors.push("BillDate is required and must be a valid datetime");
  }

  if (!data.Status || typeof data.Status !== "string" || !data.Status.trim()) {
    errors.push("Status is required");
  }

  if (data.Description !== undefined && typeof data.Description !== "string") {
    errors.push("Description must be a string");
  }

  return errors;
}

module.exports = {
  validateBill
};
