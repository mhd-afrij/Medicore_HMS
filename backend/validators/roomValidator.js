function validateRoom(data) {
  const errors = [];

  if (!data.RoomID || typeof data.RoomID !== "string" || !data.RoomID.trim()) {
    errors.push("RoomID is required");
  }

  const roomNumber = data.RoomNumber || data.RoomNumber || data.Name;
  if (!roomNumber || typeof roomNumber !== "string" || !roomNumber.trim()) {
    errors.push("RoomNumber is required");
  }

  const roomType = data.RoomType || data.RoomType || data.Type;
  if (!roomType || typeof roomType !== "string" || !roomType.trim()) {
    errors.push("RoomType is required");
  }

  if (data.DailyCharge !== undefined && data.DailyCharge !== null && typeof data.DailyCharge !== "string" && typeof data.DailyCharge !== "number") {
    errors.push("DailyCharge must be a number or string");
  }

  return errors;
}

module.exports = {
  validateRoom
};
