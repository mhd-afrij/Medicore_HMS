const sql = require("mssql");

async function getAllPatients() {
  const result = await sql.query("SELECT * FROM PATIENT");
  return result.recordset;
}

async function getPatientById(id) {
  const request = new sql.Request();
  request.input("id", sql.NVarChar, String(id));
  const result = await request.query("SELECT * FROM PATIENT WHERE PatientID = @id");
  return result.recordset[0];
}

async function createPatient(data) {
  const query = `
    INSERT INTO PATIENT (PatientID, FirstName, LastName, Gender, DateOfBirth, ContactNo, Address, BloodGroup)
    OUTPUT inserted.*
    VALUES (@PatientID, @FirstName, @LastName, @Gender, @DateOfBirth, @ContactNo, @Address, @BloodGroup)
  `;

  const request = new sql.Request();
  request.input("PatientID", sql.NVarChar, data.PatientID);
  request.input("FirstName", sql.NVarChar, data.FirstName);
  request.input("LastName", sql.NVarChar, data.LastName);
  request.input("Gender", sql.NVarChar, data.Gender);
  request.input("DateOfBirth", sql.Date, data.DateOfBirth);
  request.input("ContactNo", sql.NVarChar, data.ContactNo);
  request.input("Address", sql.NVarChar, data.Address || null);
  request.input("BloodGroup", sql.NVarChar, data.BloodGroup);

  const result = await request.query(query);
  return result.recordset[0];
}


async function updatePatient(id, data) {
  const query = `
    UPDATE PATIENT
    SET PatientID = @PatientID,
        FirstName = @FirstName,
        LastName = @LastName,
        Gender = @Gender,
        DateOfBirth = @DateOfBirth,
        ContactNo = @ContactNo,
        Address = @Address,
        BloodGroup = @BloodGroup
    OUTPUT inserted.*
    WHERE PatientID = @id
  `;

  const request = new sql.Request();
  request.input("id", sql.NVarChar, String(id));
  request.input("PatientID", sql.NVarChar, data.PatientID);
  request.input("FirstName", sql.NVarChar, data.FirstName);
  request.input("LastName", sql.NVarChar, data.LastName);
  request.input("Gender", sql.NVarChar, data.Gender);
  request.input("DateOfBirth", sql.Date, data.DateOfBirth);
  request.input("ContactNo", sql.NVarChar, data.ContactNo);
  request.input("Address", sql.NVarChar, data.Address || null);
  request.input("BloodGroup", sql.NVarChar, data.BloodGroup);

  const result = await request.query(query);
  return result.recordset[0];
}


async function deletePatient(id) {
  const request = new sql.Request();
  request.input("id", sql.NVarChar, String(id));
  const result = await request.query("DELETE FROM PATIENT OUTPUT deleted.* WHERE PatientID = @id");
  return result.recordset[0];
}

module.exports = {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient
};
