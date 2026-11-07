const sql = require("mssql");

// Use exact schema fields: RecordID, PatientID, DoctorID, Diagnosis, Notes, RecordDate
async function getAllMedicalRecords() {
  const result = await sql.query(`
    SELECT RecordID, PatientID, Diagnosis, Notes, RecordDate
    FROM MEDICAL_RECORD
    ORDER BY RecordID DESC
  `);

  return result.recordset.map((row) => ({
    RecordID: row.RecordID,
    PatientID: row.PatientID,
    Diagnosis: row.Diagnosis,
    Notes: row.Notes,
    RecordDate: row.RecordDate
  }));
}

async function getMedicalRecordById(recordId) {
  const request = new sql.Request();
  request.input("recordId", sql.NVarChar, recordId);
  const result = await request.query(`
    SELECT RecordID, PatientID, Diagnosis, Notes, RecordDate
    FROM MEDICAL_RECORD
    WHERE RecordID = @recordId
  `);

  const row = result.recordset[0];
  if (!row) return null;

  return {
    RecordID: row.RecordID,
    PatientID: row.PatientID,
    Diagnosis: row.Diagnosis,
    Notes: row.Notes,
    RecordDate: row.RecordDate
  };
}

async function createMedicalRecord(data) {
  const request = new sql.Request();
  request.input("RecordID", sql.NVarChar, data.RecordID);
  request.input("PatientID", sql.NVarChar, data.PatientID);
  request.input("Diagnosis", sql.NVarChar(sql.MAX), data.Diagnosis);
  request.input("Notes", sql.NVarChar(sql.MAX), data.Notes ?? data.TreatmentDetails ?? null);
  request.input("RecordDate", sql.Date, data.RecordDate ?? null);

  const result = await request.query(`
    INSERT INTO MEDICAL_RECORD (RecordID, PatientID, Diagnosis, Notes, RecordDate)
    OUTPUT inserted.RecordID
    VALUES (@RecordID, @PatientID, @Diagnosis, @Notes, @RecordDate)
  `);

  const newId = result.recordset[0] && result.recordset[0].RecordID;
  return getMedicalRecordById(newId || data.RecordID);
}

async function updateMedicalRecord(recordId, data) {
  const request = new sql.Request();
  request.input("recordId", sql.NVarChar, recordId);
  request.input("PatientID", sql.NVarChar, data.PatientID);
  request.input("Diagnosis", sql.NVarChar(sql.MAX), data.Diagnosis);
  request.input("Notes", sql.NVarChar(sql.MAX), data.Notes ?? data.TreatmentDetails ?? null);
  request.input("RecordDate", sql.Date, data.RecordDate ?? null);

  const result = await request.query(`
    UPDATE MEDICAL_RECORD
    SET PatientID = @PatientID,
        Diagnosis = @Diagnosis,
        Notes = @Notes,
         RecordDate = @RecordDate
    OUTPUT inserted.RecordID
    WHERE RecordID = @recordId
  `);

  const row = result.recordset[0];
  if (!row) return null;
  return getMedicalRecordById(row.RecordID);
}

async function deleteMedicalRecord(recordId) {
  const request = new sql.Request();
  request.input("recordId", sql.NVarChar, recordId);
  const result = await request.query(`
    DELETE FROM MEDICAL_RECORD
    OUTPUT deleted.RecordID
    WHERE RecordID = @recordId
  `);
  return result.recordset[0] || null;
}

module.exports = {
  getAllMedicalRecords,
  getMedicalRecordById,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord
};
