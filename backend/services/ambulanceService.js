const sql = require("mssql");

async function getAllAmbulances() {
  const result = await sql.query(`
    SELECT AmbulanceID, VehicleNumber, DriverName, Status
    FROM AMBULANCE
    ORDER BY AmbulanceID
  `);
  return result.recordset;
}

async function updateAmbulanceStatus(ambulanceId, status) {
  const request = new sql.Request();
  request.input("ambulanceId", sql.NVarChar, String(ambulanceId));
  request.input("status", sql.NVarChar, status);
  const result = await request.query(`
    UPDATE AMBULANCE
    SET Status = @status
    OUTPUT inserted.AmbulanceID, inserted.VehicleNumber, inserted.DriverName, inserted.Status
    WHERE AmbulanceID = @ambulanceId
  `);
  return result.recordset[0] || null;
}

async function getNextAmbulanceId() {
  const result = await sql.query(`SELECT COUNT(1) AS cnt FROM AMBULANCE`);
  const cnt = result.recordset[0]?.cnt || 0;
  return `AMB-${String(cnt + 1).padStart(3, '0')}`;
}

async function createAmbulance(data) {
  const request = new sql.Request();
  request.input("AmbulanceID", sql.NVarChar, data.AmbulanceID);
  request.input("VehicleNumber", sql.NVarChar, data.VehicleNumber);
  request.input("DriverName", sql.NVarChar, data.DriverName);
  request.input("Status", sql.NVarChar, data.Status || 'Available');

  const result = await request.query(`
    INSERT INTO AMBULANCE (AmbulanceID, VehicleNumber, DriverName, Status)
    OUTPUT inserted.AmbulanceID, inserted.VehicleNumber, inserted.DriverName, inserted.Status
    VALUES (@AmbulanceID, @VehicleNumber, @DriverName, @Status)
  `);
  return result.recordset[0];
}

module.exports = {
  getAllAmbulances,
  updateAmbulanceStatus,
  createAmbulance,
  getNextAmbulanceId
};
