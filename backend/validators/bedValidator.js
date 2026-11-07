function validateBed(data) {
  const errors = [];

  if (!data.BedID || typeof data.BedID !== "string" || !data.BedID.trim()) {
    errors.push("BedID is required");
  }

  if (!data.RoomID || typeof data.RoomID !== "number" || !Number.isInteger(data.RoomID)) {
    errors.push("RoomID is required and must be an integer");
  }

  if (!data.Type || typeof data.Type !== "string" || !data.Type.trim()) {
    errors.push("Type is required");
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
  validateBed
};
