const sql = require("mssql");

async function getAllPharmacies() {
  const result = await sql.query(`
    SELECT ID, PharmacyID, Name, Location, ContactNo, Description
    FROM PHARMACY
  `);
  return result.recordset;
}

async function getPharmacyById(id) {
  const request = new sql.Request();
  request.input("id", sql.Int, id);
  const result = await request.query(`
    SELECT ID, PharmacyID, Name, Location, ContactNo, Description
    FROM PHARMACY
    WHERE ID = @id
  `);
  return result.recordset[0] || null;
}

async function createPharmacy(data) {
  const request = new sql.Request();
  request.input("PharmacyID", sql.NVarChar, data.PharmacyID);
  request.input("Name", sql.NVarChar, data.Name);
  request.input("Location", sql.NVarChar, data.Location);
  request.input("ContactNo", sql.NVarChar, data.ContactNo || null);
  request.input("Description", sql.NVarChar, data.Description || null);

  const result = await request.query(`
    INSERT INTO PHARMACY (PharmacyID, Name, Location, ContactNo, Description)
    OUTPUT inserted.ID, inserted.PharmacyID, inserted.Name, inserted.Location, inserted.ContactNo, inserted.Description
    VALUES (@PharmacyID, @Name, @Location, @ContactNo, @Description)
  `);
  return result.recordset[0];
}

async function updatePharmacy(id, data) {
  const request = new sql.Request();
  request.input("id", sql.Int, id);
  request.input("PharmacyID", sql.NVarChar, data.PharmacyID);
  request.input("Name", sql.NVarChar, data.Name);
  request.input("Location", sql.NVarChar, data.Location);
  request.input("ContactNo", sql.NVarChar, data.ContactNo || null);
  request.input("Description", sql.NVarChar, data.Description || null);

  const result = await request.query(`
    UPDATE PHARMACY
    SET PharmacyID = @PharmacyID,
        Name = @Name,
        Location = @Location,
        ContactNo = @ContactNo,
        Description = @Description
    OUTPUT inserted.ID, inserted.PharmacyID, inserted.Name, inserted.Location, inserted.ContactNo, inserted.Description
    WHERE ID = @id
  `);
  return result.recordset[0] || null;
}

async function deletePharmacy(id) {
  const request = new sql.Request();
  request.input("id", sql.Int, id);
  const result = await request.query(`
    DELETE FROM PHARMACY
    OUTPUT deleted.ID, deleted.PharmacyID, deleted.Name
    WHERE ID = @id
  `);
  return result.recordset[0] || null;
}

module.exports = {
  getAllPharmacies,
  getPharmacyById,
  createPharmacy,
  updatePharmacy,
  deletePharmacy
};
