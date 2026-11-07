const sql = require("mssql");

async function getAllAmbulanceLogs() {
  const result = await sql.query(`
    SELECT l.LogID, l.AmbulanceID, l.PatientID, l.LogDateTime, l.Destination, l.Remarks,
      l.DispatchType, l.PickupLocation, l.DropoffLocation,
      a.VehicleNumber,
      a.DriverName,
      a.Status AS AmbulanceStatus
    FROM ambulance_log l
    LEFT JOIN AMBULANCE a ON l.AmbulanceID = a.AmbulanceID
    ORDER BY l.LogDateTime DESC
  `);
  return result.recordset;
}

async function createAmbulanceLog(data) {
  const request = new sql.Request();
  request.input("LogID", sql.NVarChar, data.LogID);
  request.input("AmbulanceID", sql.NVarChar, data.AmbulanceID);
  request.input("PatientID", sql.NVarChar, data.PatientID || null);
  request.input("LogDateTime", sql.DateTime, data.LogDateTime);
  request.input("Destination", sql.NVarChar, data.Destination || null);
  request.input("Remarks", sql.NVarChar, data.Remarks || null);
  request.input("DispatchType", sql.NVarChar, data.DispatchType || null);
  request.input("PickupLocation", sql.NVarChar, data.PickupLocation || null);
  request.input("DropoffLocation", sql.NVarChar, data.DropoffLocation || null);

  const result = await request.query(`
    INSERT INTO ambulance_log (LogID, AmbulanceID, PatientID, LogDateTime, Destination, Remarks, DispatchType, PickupLocation, DropoffLocation)
    OUTPUT inserted.LogID, inserted.AmbulanceID, inserted.PatientID, inserted.LogDateTime, inserted.Destination, inserted.Remarks, inserted.DispatchType, inserted.PickupLocation, inserted.DropoffLocation
    VALUES (@LogID, @AmbulanceID, @PatientID, @LogDateTime, @Destination, @Remarks, @DispatchType, @PickupLocation, @DropoffLocation)
  `);

  return result.recordset[0];
}

module.exports = {
  getAllAmbulanceLogs,
  createAmbulanceLog
};
