const sql = require("mssql");

async function getAllRooms() {
  const result = await sql.query(`
    SELECT RoomID, RoomNumber, RoomType, DailyCharge
    FROM ROOM
  `);
  return result.recordset;
}

async function getRoomById(roomId) {
  const request = new sql.Request();
  request.input("roomId", sql.NVarChar, roomId);
  const result = await request.query(`
    SELECT RoomID, RoomNumber, RoomType, DailyCharge
    FROM ROOM
    WHERE RoomID = @roomId
  `);
  return result.recordset[0] || null;
}

async function createRoom(data) {
  const request = new sql.Request();
  request.input("RoomID", sql.NVarChar, data.RoomID);
  request.input("RoomNumber", sql.NVarChar, data.RoomNumber);
  request.input("RoomType", sql.NVarChar, data.RoomType);
  request.input("DailyCharge", sql.NVarChar, data.DailyCharge || null);

  const result = await request.query(`
    INSERT INTO ROOM (RoomID, RoomNumber, RoomType, DailyCharge)
    OUTPUT inserted.RoomID, inserted.RoomNumber, inserted.RoomType, inserted.DailyCharge
    VALUES (@RoomID, @RoomNumber, @RoomType, @DailyCharge)
  `);
  return result.recordset[0];
}

async function updateRoom(roomId, data) {
  const request = new sql.Request();
  request.input("roomId", sql.NVarChar, roomId);
  request.input("RoomID", sql.NVarChar, data.RoomID);
  request.input("RoomNumber", sql.NVarChar, data.RoomNumber);
  request.input("RoomType", sql.NVarChar, data.RoomType);
  request.input("DailyCharge", sql.NVarChar, data.DailyCharge || null);

  const result = await request.query(`
    UPDATE ROOM
    SET RoomID = @RoomID,
        RoomNumber = @RoomNumber,
        RoomType = @RoomType,
        DailyCharge = @DailyCharge
    OUTPUT inserted.RoomID, inserted.RoomNumber, inserted.RoomType, inserted.DailyCharge
    WHERE RoomID = @roomId
  `);
  return result.recordset[0] || null;
}

async function deleteRoom(roomId) {
  const request = new sql.Request();
  request.input("roomId", sql.NVarChar, roomId);
  const result = await request.query(`
    DELETE FROM ROOM
    OUTPUT deleted.RoomID, deleted.RoomNumber, deleted.RoomType, deleted.DailyCharge
    WHERE RoomID = @roomId
  `);
  return result.recordset[0] || null;
}

module.exports = {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom
};
