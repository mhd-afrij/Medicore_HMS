const sql = require("mssql");

async function getAllStaff() {
  const result = await sql.query(`
    SELECT StaffID, Staffname, Gender, Role, ContactNo, Salary
    FROM STAFF
  `);
  return result.recordset;
}

async function getStaffById(id) {
  const request = new sql.Request();
  request.input("id", sql.NVarChar, id);
  const result = await request.query(`
    SELECT StaffID, Staffname, Gender, Role, ContactNo, Salary
    FROM STAFF
    WHERE StaffID = @id
  `);
  return result.recordset[0] || null;
}

async function createStaff(data) {
  const request = new sql.Request();
  request.input("StaffID", sql.NVarChar, data.StaffID);
  request.input("Staffname", sql.NVarChar, data.Staffname);
  request.input("Gender", sql.NVarChar, data.Gender || null);
  request.input("Role", sql.NVarChar, data.Role);
  request.input("ContactNo", sql.NVarChar, data.ContactNo);
  request.input("Salary", sql.Decimal(18,2), data.Salary || 0);

  const result = await request.query(`
    INSERT INTO STAFF (StaffID, Staffname, Gender, Role, ContactNo, Salary)
    OUTPUT inserted.StaffID, inserted.Staffname, inserted.Gender, inserted.Role, inserted.ContactNo, inserted.Salary
    VALUES (@StaffID, @Staffname, @Gender, @Role, @ContactNo, @Salary)
  `);
  return result.recordset[0];
}

async function updateStaff(id, data) {
  const request = new sql.Request();
  request.input("id", sql.NVarChar, id);
  request.input("StaffID", sql.NVarChar, data.StaffID);
  request.input("Staffname", sql.NVarChar, data.Staffname);
  request.input("Gender", sql.NVarChar, data.Gender || null);
  request.input("Role", sql.NVarChar, data.Role);
  request.input("ContactNo", sql.NVarChar, data.ContactNo);
  request.input("Salary", sql.Decimal(18,2), data.Salary || 0);

  const result = await request.query(`
    UPDATE STAFF
    SET StaffID = @StaffID,
        Staffname = @Staffname,
        Gender = @Gender,
        Role = @Role,
        ContactNo = @ContactNo,
        Salary = @Salary
    OUTPUT inserted.StaffID, inserted.Staffname, inserted.Gender, inserted.Role, inserted.ContactNo, inserted.Salary
    WHERE StaffID = @id
  `);
  return result.recordset[0] || null;
}

async function deleteStaff(id) {
  const request = new sql.Request();
  request.input("id", sql.NVarChar, id);
  const result = await request.query(`
    DELETE FROM STAFF
    OUTPUT deleted.StaffID
    WHERE StaffID = @id
  `);
  return result.recordset[0] || null;
}

module.exports = {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff
};
