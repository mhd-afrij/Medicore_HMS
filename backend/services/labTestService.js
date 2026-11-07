const sql = require("mssql");

async function getAllLabTests() {
  const result = await sql.query(`
    SELECT TestID,
           PatientID,
           DoctorID,
           TestType,
           RequestDate,
           ResultDate,
           ResultValue,
           ReferenceRange,
           ResultFlag,
           Priority,
           Status,
           TechnicianName,
           Notes
    FROM LAB_TEST
    ORDER BY TestID DESC
  `);

  return result.recordset;
}

async function getLabTestById(id) {
  const request = new sql.Request();
  request.input("TestID", sql.NVarChar(10), id);
  const result = await request.query(`
    SELECT TestID,
           PatientID,
           DoctorID,
           TestType,
           RequestDate,
           ResultDate,
           ResultValue,
           ReferenceRange,
           ResultFlag,
           Priority,
           Status,
           TechnicianName,
           Notes
    FROM LAB_TEST
    WHERE TestID = @TestID
  `);

  return result.recordset[0] || null;
}

async function createLabTest(data) {
  const request = new sql.Request();
  request.input("TestID", sql.VarChar(10), data.TestID);
  request.input("PatientID", sql.VarChar(10), data.PatientID);
  request.input("DoctorID", sql.VarChar(10), data.DoctorID);
  request.input("TestType", sql.VarChar(100), data.TestType);
  request.input("RequestDate", sql.Date, data.RequestDate);
  request.input("ResultDate", sql.Date, data.ResultDate || null);
  request.input("ResultValue", sql.VarChar(255), data.ResultValue || null);
  request.input("ReferenceRange", sql.VarChar(100), data.ReferenceRange || null);
  request.input("ResultFlag", sql.VarChar(20), data.ResultFlag || null);
  request.input("Priority", sql.VarChar(20), data.Priority || 'Routine');
  request.input("Status", sql.VarChar(20), data.Status || 'Pending');
  request.input("TechnicianName", sql.VarChar(100), data.TechnicianName || null);
  request.input("Notes", sql.VarChar(255), data.Notes || null);

  const result = await request.query(`
    INSERT INTO LAB_TEST (TestID, PatientID, DoctorID, TestType, RequestDate, ResultDate, ResultValue, ReferenceRange, ResultFlag, Priority, Status, TechnicianName, Notes)
    OUTPUT inserted.TestID
    VALUES (@TestID, @PatientID, @DoctorID, @TestType, @RequestDate, @ResultDate, @ResultValue, @ReferenceRange, @ResultFlag, @Priority, @Status, @TechnicianName, @Notes)
  `);

  return getLabTestById(result.recordset[0].TestID);
}

async function updateLabTest(id, data) {
  const request = new sql.Request();
  request.input("TestID", sql.VarChar(10), id);
  request.input("PatientID", sql.VarChar(10), data.PatientID);
  request.input("DoctorID", sql.VarChar(10), data.DoctorID);
  request.input("TestType", sql.VarChar(100), data.TestType);
  request.input("RequestDate", sql.Date, data.RequestDate);
  request.input("ResultDate", sql.Date, data.ResultDate || null);
  request.input("ResultValue", sql.VarChar(255), data.ResultValue || null);
  request.input("ReferenceRange", sql.VarChar(100), data.ReferenceRange || null);
  request.input("ResultFlag", sql.VarChar(20), data.ResultFlag || null);
  request.input("Priority", sql.VarChar(20), data.Priority || 'Routine');
  request.input("Status", sql.VarChar(20), data.Status || 'Pending');
  request.input("TechnicianName", sql.VarChar(100), data.TechnicianName || null);
  request.input("Notes", sql.VarChar(255), data.Notes || null);

  const result = await request.query(`
    UPDATE LAB_TEST
    SET PatientID = @PatientID,
        DoctorID = @DoctorID,
        TestType = @TestType,
        RequestDate = @RequestDate,
        ResultDate = @ResultDate,
        ResultValue = @ResultValue,
        ReferenceRange = @ReferenceRange,
        ResultFlag = @ResultFlag,
        Priority = @Priority,
        Status = @Status,
        TechnicianName = @TechnicianName,
        Notes = @Notes
    OUTPUT inserted.TestID
    WHERE TestID = @TestID
  `);

  const row = result.recordset[0];
  if (!row) {
    return null;
  }

  return getLabTestById(row.TestID);
}

async function deleteLabTest(id) {
  const request = new sql.Request();
  request.input("TestID", sql.NVarChar(10), id);
  const result = await request.query(`
    DELETE FROM LAB_TEST
    OUTPUT deleted.TestID
    WHERE TestID = @TestID
  `);

  return result.recordset[0] || null;
}

module.exports = {
  getAllLabTests,
  getLabTestById,
  createLabTest,
  updateLabTest,
  deleteLabTest
};
