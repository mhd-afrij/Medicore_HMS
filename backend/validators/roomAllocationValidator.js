function validateRoomAllocation(data) {
  const errors = [];

  if (!data.RoomAllocationID || typeof data.RoomAllocationID !== "string" || !data.RoomAllocationID.trim()) {
    errors.push("RoomAllocationID is required");
  }

  if (!data.RoomID || typeof data.RoomID !== "number" || !Number.isInteger(data.RoomID)) {
    errors.push("RoomID is required and must be an integer");
  }

  if (!data.BedID || typeof data.BedID !== "number" || !Number.isInteger(data.BedID)) {
    errors.push("BedID is required and must be an integer");
  }

  if (!data.PatientID || typeof data.PatientID !== "number" || !Number.isInteger(data.PatientID)) {
    errors.push("PatientID is required and must be an integer");
  }

  if (!data.AllocationDate || Number.isNaN(Date.parse(data.AllocationDate))) {
    errors.push("AllocationDate is required and must be a valid datetime");
  }

  if (data.ReleaseDate !== undefined && Number.isNaN(Date.parse(data.ReleaseDate))) {
    errors.push("ReleaseDate must be a valid datetime");
  }

  if (data.Status !== undefined && typeof data.Status !== "string") {
    errors.push("Status must be a string");
  }

  return errors;
}

module.exports = {
  validateRoomAllocation
};
