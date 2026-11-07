const sql = require("mssql");

async function getAllBloodTransfusions() {
  const result = await sql.query(`
    SELECT
      t.TransfusionID,
      t.PatientID,
      t.BloodID,
      t.TransfusionDate,
      t.UnitsGiven,
      t.DoctorName,
      p.FirstName AS PatientFirstName,
      p.LastName AS PatientLastName,
      b.BloodGroup
    FROM BLOOD_TRANSFUSION t
    LEFT JOIN PATIENT p ON t.PatientID = p.PatientID
    LEFT JOIN BLOOD_BANK b ON t.BloodID = b.BloodID
    ORDER BY t.TransfusionDate DESC
  `);
  return result.recordset;
}

async function createBloodTransfusion(data) {
  const request = new sql.Request();

  request.input("TransfusionID", sql.NVarChar, data.TransfusionID);
  request.input("PatientID", sql.NVarChar, data.PatientID);
  request.input("BloodID", sql.NVarChar, data.BloodID || null);
  request.input("TransfusionDate", sql.Date, data.TransfusionDate);
  request.input("UnitsGiven", sql.Int, data.UnitsGiven);
  request.input("DoctorName", sql.NVarChar, data.DoctorName || null);

  await request.query(`
    INSERT INTO BLOOD_TRANSFUSION
    (TransfusionID, PatientID, BloodID, TransfusionDate, UnitsGiven, DoctorName)
    VALUES
    (@TransfusionID, @PatientID, @BloodID, @TransfusionDate, @UnitsGiven, @DoctorName)
  `);

  // Re-fetch with JOINs to return patient name and blood group
  const fetchRequest = new sql.Request();
  fetchRequest.input("tid", sql.NVarChar, data.TransfusionID);
  const fetchResult = await fetchRequest.query(`
    SELECT
      t.TransfusionID,
      t.PatientID,
      t.BloodID,
      t.TransfusionDate,
      t.UnitsGiven,
      t.DoctorName,
      p.FirstName AS PatientFirstName,
      p.LastName AS PatientLastName,
      b.BloodGroup
    FROM BLOOD_TRANSFUSION t
    LEFT JOIN PATIENT p ON t.PatientID = p.PatientID
    LEFT JOIN BLOOD_BANK b ON t.BloodID = b.BloodID
    WHERE t.TransfusionID = @tid
  `);

  return fetchResult.recordset[0];
}

async function getBloodIdByGroup(bloodGroup) {
  const request = new sql.Request();
  request.input("BloodGroup", sql.NVarChar, bloodGroup);
  const result = await request.query(`
    SELECT TOP 1 BloodID
    FROM BLOOD_BANK
    WHERE BloodGroup = @BloodGroup AND AvailableUnits > 0
    ORDER BY ExpiryDate ASC
  `);
  return result.recordset.length > 0 ? result.recordset[0].BloodID : null;
}

module.exports = {
  getAllBloodTransfusions,
  createBloodTransfusion,
  getBloodIdByGroup
};
