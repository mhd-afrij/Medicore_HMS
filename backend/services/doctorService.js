const sql = require('mssql');

// Service for DOCTOR table using exact DB fields:
// DoctorID, DoctorName, Specialization, Qualification, Email

function mapDoctorRecord(record) {
  const doctorName = record.DoctorName || '';
  const [firstName, ...lastNameParts] = doctorName.split(' ');
  return {
    ID: record.DoctorID,
    DoctorID: record.DoctorID,
    DoctorName: doctorName,
    FirstName: firstName || '',
    LastName: lastNameParts.join(' ') || '',
    Specialization: record.Specialization || '',
    Email: record.Email || '',
    Description: record.Qualification || ''
  };
}

async function getAllDoctors() {
  const result = await sql.query(`
    SELECT DoctorID, DoctorName, Specialization, Qualification, Email
    FROM DOCTOR
  `);
  return result.recordset.map(mapDoctorRecord);
}

async function getDoctorById(id) {
  const request = new sql.Request();
  request.input('id', sql.NVarChar, String(id));
  const result = await request.query(`
    SELECT DoctorID, DoctorName, Specialization, Qualification, Email
    FROM DOCTOR
    WHERE DoctorID = @id
  `);
  const record = result.recordset[0];
  if (!record) return null;
  return mapDoctorRecord(record);
}

function normalizeDoctorPayload(data = {}) {
  return {
    DoctorID: data.DoctorID || data.doctorId || data.doctorID || '',
    DoctorName: data.DoctorName || data.doctorName || '',
    Specialization: data.Specialization || data.specialization || null,
    Qualification: data.Qualification || data.Description || data.description || null,
    Email: data.Email || data.email || null
  };
}

async function createDoctor(data) {
  const payload = normalizeDoctorPayload(data);
  const request = new sql.Request();
  const doctorName = String(payload.DoctorName).trim();

  request.input('DoctorID', sql.NVarChar, payload.DoctorID);
  request.input('DoctorName', sql.NVarChar, doctorName);
  request.input('Specialization', sql.NVarChar, payload.Specialization);
  request.input('Qualification', sql.NVarChar, payload.Qualification);
  request.input('Email', sql.NVarChar, payload.Email);

  await request.query(`
    INSERT INTO DOCTOR (DoctorID, DoctorName, Specialization, Qualification, Email)
    VALUES (@DoctorID, @DoctorName, @Specialization, @Qualification, @Email)
  `);

  const selectRequest = new sql.Request();
  selectRequest.input('DoctorID', sql.NVarChar, payload.DoctorID);
  const select = await selectRequest.query(`
    SELECT DoctorID, DoctorName, Specialization, Qualification, Email
    FROM DOCTOR
    WHERE DoctorID = @DoctorID
  `);
  return mapDoctorRecord(select.recordset[0]);
}

async function updateDoctor(id, data) {
  const payload = normalizeDoctorPayload(data);
  const request = new sql.Request();
  const doctorName = String(payload.DoctorName).trim();

  request.input('id', sql.NVarChar(10), String(id));
  request.input('DoctorID', sql.NVarChar(10), payload.DoctorID);
  request.input('DoctorName', sql.NVarChar(100), doctorName);
  request.input('Specialization', sql.NVarChar(100), payload.Specialization);
  request.input('Qualification', sql.NVarChar(255), payload.Qualification);
  request.input('Email', sql.NVarChar(100), payload.Email);

  const result = await request.query(`
    UPDATE DOCTOR
    SET DoctorID = @DoctorID,
        DoctorName = @DoctorName,
        Specialization = @Specialization,
        Qualification = @Qualification,
        Email = @Email
    WHERE DoctorID = @id
  `);

  if (!result.rowsAffected || !result.rowsAffected[0]) return null;

  const selectRequest = new sql.Request();
  selectRequest.input('DoctorID', sql.NVarChar, payload.DoctorID);
  const select = await selectRequest.query(`
    SELECT DoctorID, DoctorName, Specialization, Qualification, Email
    FROM DOCTOR
    WHERE DoctorID = @DoctorID
  `);
  return mapDoctorRecord(select.recordset[0]);
}

async function deleteDoctor(id) {
  const request = new sql.Request();
  request.input('id', sql.NVarChar, String(id));

  // read first, then delete to return the deleted record without relying on OUTPUT
  const existing = await request.query(`
    SELECT DoctorID, DoctorName, Specialization, Qualification, Email
    FROM DOCTOR
    WHERE DoctorID = @id
  `);
  const record = existing.recordset[0];
  if (!record) return null;

  await request.query(`DELETE FROM DOCTOR WHERE DoctorID = @id`);
  return mapDoctorRecord(record);
}

module.exports = {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor
};
