const sql = require("mssql");

async function getAllDepartments() {
  const result = await sql.query(`
    SELECT DepartmentID, DepartmentName, Location
    FROM DEPARTMENT
  `);
  return result.recordset;
}

async function getDepartmentById(id) {
  const request = new sql.Request();
  request.input("id", sql.Int, id);
  const result = await request.query(`
    SELECT DepartmentID, DepartmentName, Location
    FROM DEPARTMENT
    WHERE DepartmentID = @id
  `);
  return result.recordset[0] || null;
}

async function createDepartment(data) {
  const request = new sql.Request();
  request.input("DepartmentName", sql.NVarChar, data.DepartmentName);
  request.input("Location", sql.NVarChar, data.Location || null);

  const result = await request.query(`
    INSERT INTO DEPARTMENT (DepartmentName, Location)
    OUTPUT inserted.DepartmentID, inserted.DepartmentName, inserted.Location
    VALUES (@DepartmentName, @Location)
  `);

  return result.recordset[0];
}

async function updateDepartment(id, data) {
  const request = new sql.Request();
  request.input("id", sql.Int, id);
  request.input("DepartmentName", sql.NVarChar, data.DepartmentName);
  request.input("Location", sql.NVarChar, data.Location || null);

  const result = await request.query(`
    UPDATE DEPARTMENT
    SET DepartmentName = @DepartmentName,
        Location = @Location
    OUTPUT inserted.DepartmentID, inserted.DepartmentName, inserted.Location
    WHERE DepartmentID = @id
  `);

  return result.recordset[0] || null;
}

async function deleteDepartment(id) {
  const request = new sql.Request();
  request.input("id", sql.Int, id);
  const result = await request.query(`
    DELETE FROM DEPARTMENT
    OUTPUT deleted.DepartmentID, deleted.DepartmentName, deleted.Location
    WHERE DepartmentID = @id
  `);
  return result.recordset[0] || null;
}

module.exports = {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
};
