const sql = require('mssql');

async function getAllPrescriptions() {
  const result = await sql.query(`
    SELECT PrescriptionID, PatientID, DoctorID, PrescriptionDate, RecordID, Medicine
    FROM PRESCRIPTION
    ORDER BY PrescriptionDate DESC
  `);
  return result.recordset;
}

async function getPrescriptionById(id) {
  const request = new sql.Request();
  request.input('id', sql.NVarChar(10), id);
  const result = await request.query(`
    SELECT PrescriptionID, PatientID, DoctorID, PrescriptionDate, RecordID, Medicine
    FROM PRESCRIPTION
    WHERE PrescriptionID = @id
  `);
  return result.recordset[0] || null;
}

async function createPrescription(data) {
  const request = new sql.Request();
  request.input('PrescriptionID', sql.NVarChar(10), data.PrescriptionID);
  request.input('PatientID', sql.NVarChar(10), data.PatientID || data.MedicalRecordID || data.RecordID);
  request.input('DoctorID', sql.NVarChar(10), data.DoctorID);
  request.input('PrescriptionDate', sql.Date, data.PrescriptionDate);
  request.input('RecordID', sql.NVarChar(10), data.RecordID || data.MedicalRecordID || null);

  // Convert Medicine array to comma-separated string if provided
  let medicineStr = null;
  if (data.Medicine) {
    if (Array.isArray(data.Medicine)) {
      medicineStr = data.Medicine.join(',');
    } else {
      medicineStr = String(data.Medicine);
    }
  }
  request.input('Medicine', sql.NVarChar(sql.MAX), medicineStr);

  const result = await request.query(`
    INSERT INTO PRESCRIPTION (PrescriptionID, PatientID, DoctorID, PrescriptionDate, RecordID, Medicine)
    OUTPUT inserted.PrescriptionID, inserted.PatientID, inserted.DoctorID, inserted.PrescriptionDate, inserted.RecordID, inserted.Medicine
    VALUES (@PrescriptionID, @PatientID, @DoctorID, @PrescriptionDate, @RecordID, @Medicine)
  `);

  return result.recordset[0];
}

async function updatePrescription(id, data) {
  const request = new sql.Request();
  request.input('id', sql.NVarChar(10), id);
  request.input('PrescriptionID', sql.NVarChar(10), data.PrescriptionID);
  request.input('PatientID', sql.NVarChar(10), data.PatientID || data.MedicalRecordID || data.RecordID);
  request.input('DoctorID', sql.NVarChar(10), data.DoctorID);
  request.input('PrescriptionDate', sql.Date, data.PrescriptionDate);
  request.input('RecordID', sql.NVarChar(10), data.RecordID || data.MedicalRecordID || null);

  // Convert Medicine array to comma-separated string if provided
  let medicineStr = null;
  if (data.Medicine) {
    if (Array.isArray(data.Medicine)) {
      medicineStr = data.Medicine.join(',');
    } else {
      medicineStr = String(data.Medicine);
    }
  }
  request.input('Medicine', sql.NVarChar(sql.MAX), medicineStr);

  const result = await request.query(`
    UPDATE PRESCRIPTION
    SET PatientID = @PatientID,
        DoctorID = @DoctorID,
        PrescriptionDate = @PrescriptionDate,
        RecordID = @RecordID,
        Medicine = @Medicine
    OUTPUT inserted.PrescriptionID, inserted.PatientID, inserted.DoctorID, inserted.PrescriptionDate, inserted.RecordID, inserted.Medicine
    WHERE PrescriptionID = @id
  `);

  return result.recordset[0] || null;
}

async function deletePrescription(id) {
  const request = new sql.Request();
  request.input('id', sql.NVarChar(10), id);
  const result = await request.query(`
    DELETE FROM PRESCRIPTION
    OUTPUT deleted.PrescriptionID, deleted.PatientID
    WHERE PrescriptionID = @id
  `);
  return result.recordset[0] || null;
}

module.exports = {
  getAllPrescriptions,
  getPrescriptionById,
  createPrescription,
  updatePrescription,
  deletePrescription
};
