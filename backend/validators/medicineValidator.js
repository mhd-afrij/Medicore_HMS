function validateMedicine(data) {
  const errors = [];

  if (!data.MedicineID || typeof data.MedicineID !== "string" || !data.MedicineID.trim()) {
    errors.push("MedicineID is required");
  }
  // Enforce DB constraint: MedicineID max length 10
  if (data.MedicineID && typeof data.MedicineID === 'string' && data.MedicineID.trim().length > 10) {
    errors.push('MedicineID must be at most 10 characters');
  }

  if (!data.MedicineName || typeof data.MedicineName !== "string" || !data.MedicineName.trim()) {
    errors.push("MedicineName is required");
  }

  if (data.StockQuantity === undefined || data.StockQuantity === null || typeof data.StockQuantity !== "number" || !Number.isInteger(data.StockQuantity) || data.StockQuantity < 0) {
    errors.push("StockQuantity is required and must be a non-negative integer");
  }

  if (data.UnitPrice === undefined || data.UnitPrice === null || typeof data.UnitPrice !== "number" || Number.isNaN(data.UnitPrice) || data.UnitPrice < 0) {
    errors.push("UnitPrice is required and must be a non-negative number");
  }

  if (!data.ExpiryDate || isNaN(Date.parse(data.ExpiryDate))) {
    errors.push("ExpiryDate is required and must be a valid date");
  }
  if (!data.Category || typeof data.Category !== "string" || !data.Category.trim()) {
    errors.push("Category is required");
  }

  return errors;
}

module.exports = {
  validateMedicine
};
