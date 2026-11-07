const sql = require("mssql");

async function getAllBeds() {
  const result = await sql.query(`
    SELECT b.ID,
           b.BedID,
           b.RoomID,
           r.Name AS RoomName,
           b.Type,
           b.Status,
           b.Description
    FROM BED b
    LEFT JOIN ROOM r ON r.ID = b.RoomID
  `);

  return result.recordset.map((row) => ({
    id: row.ID,
    bedId: row.BedID,
    type: row.Type,
    status: row.Status,
    description: row.Description,
    room: {
      id: row.RoomID,
      name: row.RoomName
    }
  }));
}

async function getBedById(id) {
  const request = new sql.Request();
  request.input("id", sql.Int, id);
  const result = await request.query(`
    SELECT b.ID,
           b.BedID,
           b.RoomID,
           r.Name AS RoomName,
           b.Type,
           b.Status,
           b.Description
    FROM BED b
    LEFT JOIN ROOM r ON r.ID = b.RoomID
    WHERE b.ID = @id
  `);

  const row = result.recordset[0];
  if (!row) {
    return null;
  }

  return {
    id: row.ID,
    bedId: row.BedID,
    type: row.Type,
    status: row.Status,
    description: row.Description,
    room: {
      id: row.RoomID,
      name: row.RoomName
    }
  };
}

async function createBed(data) {
  const request = new sql.Request();
  request.input("BedID", sql.NVarChar, data.BedID);
  request.input("RoomID", sql.Int, data.RoomID);
  request.input("Type", sql.NVarChar, data.Type);
  request.input("Status", sql.NVarChar, data.Status);
  request.input("Description", sql.NVarChar, data.Description || null);

  const result = await request.query(`
    INSERT INTO BED (BedID, RoomID, Type, Status, Description)
    OUTPUT inserted.ID
    VALUES (@BedID, @RoomID, @Type, @Status, @Description)
  `);

  return getBedById(result.recordset[0].ID);
}

async function updateBed(id, data) {
  const request = new sql.Request();
  request.input("id", sql.Int, id);
  request.input("BedID", sql.NVarChar, data.BedID);
  request.input("RoomID", sql.Int, data.RoomID);
  request.input("Type", sql.NVarChar, data.Type);
  request.input("Status", sql.NVarChar, data.Status);
  request.input("Description", sql.NVarChar, data.Description || null);

  const result = await request.query(`
    UPDATE BED
    SET BedID = @BedID,
        RoomID = @RoomID,
        Type = @Type,
        Status = @Status,
        Description = @Description
    OUTPUT inserted.ID
    WHERE ID = @id
  `);

  const row = result.recordset[0];
  if (!row) {
    return null;
  }

  return getBedById(row.ID);
}

async function deleteBed(id) {
  const request = new sql.Request();
  request.input("id", sql.Int, id);
  const result = await request.query(`
    DELETE FROM BED
    OUTPUT deleted.ID, deleted.BedID
    WHERE ID = @id
  `);
  return result.recordset[0] || null;
}

module.exports = {
  getAllBeds,
  getBedById,
  createBed,
  updateBed,
  deleteBed
};
