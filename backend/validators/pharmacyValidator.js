function validatePharmacy(data) {
  const errors = [];

  if (!data.PharmacyID || typeof data.PharmacyID !== "string" || !data.PharmacyID.trim()) {
    errors.push("PharmacyID is required");
  }

  if (!data.Name || typeof data.Name !== "string" || !data.Name.trim()) {
    errors.push("Name is required");
  }

  if (!data.Location || typeof data.Location !== "string" || !data.Location.trim()) {
    errors.push("Location is required");
  }

  if (data.ContactNo !== undefined && typeof data.ContactNo !== "string") {
    errors.push("ContactNo must be a string");
  }

  return errors;
}

module.exports = {
  validatePharmacy
};
