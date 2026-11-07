const sql = require("mssql");

async function getAllRoomAllocations() {
  const result = await sql.query(`
    SELECT ra.ID,
           ra.RoomAllocationID,
           ra.RoomID,
           r.Name AS RoomName,
           ra.BedID,
           b.BedID AS BedCode,
           ra.PatientID,
           p.FirstName AS PatientFirstName,
           p.LastName AS PatientLastName,
           ra.AllocationDate,
           ra.ReleaseDate,
           ra.Status,
           ra.Notes
    FROM ROOM_ALLOCATION ra
    LEFT JOIN ROOM r ON r.ID = ra.RoomID
    LEFT JOIN BED b ON b.ID = ra.BedID
    LEFT JOIN PATIENT p ON p.ID = ra.PatientID
  `);

  return result.recordset.map((row) => ({
    id: row.ID,
    roomAllocationId: row.RoomAllocationID,
    allocationDate: row.AllocationDate,
    releaseDate: row.ReleaseDate,
    status: row.Status,
    notes: row.Notes,
    room: {
      id: row.RoomID,
      name: row.RoomName
    },
    bed: {
      id: row.BedID,
      bedId: row.BedCode
    },
    patient: {
      id: row.PatientID,
      firstName: row.PatientFirstName,
      lastName: row.PatientLastName
    }
  }));
}

async function getRoomAllocationById(id) {
  const request = new sql.Request();
  request.input("id", sql.Int, id);
  const result = await request.query(`
    SELECT ra.ID,
           ra.RoomAllocationID,
           ra.RoomID,
           r.Name AS RoomName,
           ra.BedID,
           b.BedID AS BedCode,
           ra.PatientID,
           p.FirstName AS PatientFirstName,
           p.LastName AS PatientLastName,
           ra.AllocationDate,
           ra.ReleaseDate,
           ra.Status,
           ra.Notes
    FROM ROOM_ALLOCATION ra
    LEFT JOIN ROOM r ON r.ID = ra.RoomID
    LEFT JOIN BED b ON b.ID = ra.BedID
    LEFT JOIN PATIENT p ON p.ID = ra.PatientID
    WHERE ra.ID = @id
  `);

  const row = result.recordset[0];
  if (!row) {
    return null;
  }

  return {
    id: row.ID,
    roomAllocationId: row.RoomAllocationID,
    allocationDate: row.AllocationDate,
    releaseDate: row.ReleaseDate,
    status: row.Status,
    notes: row.Notes,
    room: {
      id: row.RoomID,
      name: row.RoomName
    },
    bed: {
      id: row.BedID,
      bedId: row.BedCode
    },
    patient: {
      id: row.PatientID,
      firstName: row.PatientFirstName,
      lastName: row.PatientLastName
    }
  };
}

async function createRoomAllocation(data) {
  const request = new sql.Request();
  request.input("RoomAllocationID", sql.NVarChar, data.RoomAllocationID);
  request.input("RoomID", sql.Int, data.RoomID);
  request.input("BedID", sql.Int, data.BedID);
  request.input("PatientID", sql.Int, data.PatientID);
  request.input("AllocationDate", sql.DateTime, data.AllocationDate);
  request.input("ReleaseDate", sql.DateTime, data.ReleaseDate || null);
  request.input("Status", sql.NVarChar, data.Status || "Active");
  request.input("Notes", sql.NVarChar, data.Notes || null);

  const result = await request.query(`
    INSERT INTO ROOM_ALLOCATION (RoomAllocationID, RoomID, BedID, PatientID, AllocationDate, ReleaseDate, Status, Notes)
    OUTPUT inserted.ID
    VALUES (@RoomAllocationID, @RoomID, @BedID, @PatientID, @AllocationDate, @ReleaseDate, @Status, @Notes)
  `);

  return getRoomAllocationById(result.recordset[0].ID);
}

async function updateRoomAllocation(id, data) {
  const request = new sql.Request();
  request.input("id", sql.Int, id);
  request.input("RoomAllocationID", sql.NVarChar, data.RoomAllocationID);
  request.input("RoomID", sql.Int, data.RoomID);
  request.input("BedID", sql.Int, data.BedID);
  request.input("PatientID", sql.Int, data.PatientID);
  request.input("AllocationDate", sql.DateTime, data.AllocationDate);
  request.input("ReleaseDate", sql.DateTime, data.ReleaseDate || null);
  request.input("Status", sql.NVarChar, data.Status || "Active");
  request.input("Notes", sql.NVarChar, data.Notes || null);

  const result = await request.query(`
    UPDATE ROOM_ALLOCATION
    SET RoomAllocationID = @RoomAllocationID,
        RoomID = @RoomID,
        BedID = @BedID,
        PatientID = @PatientID,
        AllocationDate = @AllocationDate,
        ReleaseDate = @ReleaseDate,
        Status = @Status,
        Notes = @Notes
    OUTPUT inserted.ID
    WHERE ID = @id
  `);

  const row = result.recordset[0];
  if (!row) {
    return null;
  }

  return getRoomAllocationById(row.ID);
}

async function deleteRoomAllocation(id) {
  const request = new sql.Request();
  request.input("id", sql.Int, id);
  const result = await request.query(`
    DELETE FROM ROOM_ALLOCATION
    OUTPUT deleted.ID, deleted.RoomAllocationID
    WHERE ID = @id
  `);
  return result.recordset[0] || null;
}

module.exports = {
  getAllRoomAllocations,
  getRoomAllocationById,
  createRoomAllocation,
  updateRoomAllocation,
  deleteRoomAllocation
};
