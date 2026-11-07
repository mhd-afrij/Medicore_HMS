const sql = require("mssql");

async function getAllNurses() {
  const result = await sql.query(`
    SELECT n.ID,
           n.NurseID,
           n.FirstName,
           n.LastName,
           n.DepartmentID,
           d.Name AS DepartmentName,
           n.Email,
           n.ContactNo,
           n.Address
    FROM NURSE n
    LEFT JOIN DEPARTMENT d ON d.ID = n.DepartmentID
  `);

  return result.recordset.map((row) => ({
    id: row.ID,
    nurseId: row.NurseID,
    firstName: row.FirstName,
    lastName: row.LastName,
    email: row.Email,
    contactNo: row.ContactNo,
    address: row.Address,
    department: {
      id: row.DepartmentID,
      name: row.DepartmentName
    }
  }));
}

async function getNurseById(id) {
  const request = new sql.Request();
  request.input("id", sql.Int, id);
  const result = await request.query(`
    SELECT n.ID,
           n.NurseID,
           n.FirstName,
           n.LastName,
           n.DepartmentID,
           d.Name AS DepartmentName,
           n.Email,
           n.ContactNo,
           n.Address
    FROM NURSE n
    LEFT JOIN DEPARTMENT d ON d.ID = n.DepartmentID
    WHERE n.ID = @id
  `);

  const row = result.recordset[0];
  if (!row) {
    return null;
  }

  return {
    id: row.ID,
    nurseId: row.NurseID,
    firstName: row.FirstName,
    lastName: row.LastName,
    email: row.Email,
    contactNo: row.ContactNo,
    address: row.Address,
    department: {
      id: row.DepartmentID,
      name: row.DepartmentName
    }
  };
}

async function createNurse(data) {
  const request = new sql.Request();
  request.input("NurseID", sql.NVarChar, data.NurseID);
  request.input("FirstName", sql.NVarChar, data.FirstName);
  request.input("LastName", sql.NVarChar, data.LastName);
  request.input("DepartmentID", sql.Int, data.DepartmentID);
  request.input("Email", sql.NVarChar, data.Email || null);
  request.input("ContactNo", sql.NVarChar, data.ContactNo);
  request.input("Address", sql.NVarChar, data.Address || null);

  const result = await request.query(`
    INSERT INTO NURSE (NurseID, FirstName, LastName, DepartmentID, Email, ContactNo, Address)
    OUTPUT inserted.ID
    VALUES (@NurseID, @FirstName, @LastName, @DepartmentID, @Email, @ContactNo, @Address)
  `);

  return getNurseById(result.recordset[0].ID);
}

async function updateNurse(id, data) {
  const request = new sql.Request();
  request.input("id", sql.Int, id);
  request.input("NurseID", sql.NVarChar, data.NurseID);
  request.input("FirstName", sql.NVarChar, data.FirstName);
  request.input("LastName", sql.NVarChar, data.LastName);
  request.input("DepartmentID", sql.Int, data.DepartmentID);
  request.input("Email", sql.NVarChar, data.Email || null);
  request.input("ContactNo", sql.NVarChar, data.ContactNo);
  request.input("Address", sql.NVarChar, data.Address || null);

  const result = await request.query(`
    UPDATE NURSE
    SET NurseID = @NurseID,
        FirstName = @FirstName,
        LastName = @LastName,
        DepartmentID = @DepartmentID,
        Email = @Email,
        ContactNo = @ContactNo,
        Address = @Address
    OUTPUT inserted.ID
    WHERE ID = @id
  `);

  const row = result.recordset[0];
  if (!row) {
    return null;
  }

  return getNurseById(row.ID);
}

async function deleteNurse(id) {
  const request = new sql.Request();
  request.input("id", sql.Int, id);
  const result = await request.query(`
    DELETE FROM NURSE
    OUTPUT deleted.ID, deleted.NurseID
    WHERE ID = @id
  `);
  return result.recordset[0] || null;
}

module.exports = {
  getAllNurses,
  getNurseById,
  createNurse,
  updateNurse,
  deleteNurse
};
