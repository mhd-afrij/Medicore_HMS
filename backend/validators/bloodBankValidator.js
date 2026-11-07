function validateBloodBank(data) {
  const errors = [];

//   if (!data.BloodID || typeof data.BloodID !== "string" || !data.BloodID.trim()) {
//     errors.push("BloodID is required");
//   }

  if (!data.BloodGroup || typeof data.BloodGroup !== "string" || !data.BloodGroup.trim()) {
    errors.push("BloodGroup is required");
  }

  const availableUnits = Number(data.AvailableUnits);
  if (!Number.isInteger(availableUnits) || availableUnits < 0) {
    errors.push("AvailableUnits is required and must be a non-negative integer");
  }

  if (!data.DonorName || typeof data.DonorName !== "string" || !data.DonorName.trim()) {
    errors.push("DonorName is required");
  }

  if (!data.CollectionDate || isNaN(Date.parse(data.CollectionDate))) {
    errors.push("CollectionDate is required and must be a valid date");
  }

  if (!data.ExpiryDate || isNaN(Date.parse(data.ExpiryDate))) {
    errors.push("ExpiryDate is required and must be a valid date");
  }

  if (
    data.CollectionDate &&
    data.ExpiryDate &&
    !isNaN(Date.parse(data.CollectionDate)) &&
    !isNaN(Date.parse(data.ExpiryDate)) &&
    new Date(data.ExpiryDate) < new Date(data.CollectionDate)
  ) {
    errors.push("ExpiryDate must be the same or after CollectionDate");
  }

  return errors;
}

module.exports = {
  validateBloodBank
};
