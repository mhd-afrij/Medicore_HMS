const sql = require("mssql");

async function getAllMedicines() {
  const result = await sql.query(`
    SELECT MedicineID, MedicineName, StockQuantity, UnitPrice, ExpiryDate, Category
    FROM MEDICINE
  `);
  return result.recordset;
}

async function getMedicineById(id) {
  const request = new sql.Request();
  request.input("MedicineID", sql.NVarChar, id);
  const result = await request.query(`
    SELECT MedicineID, MedicineName, StockQuantity, UnitPrice, ExpiryDate, Category
    FROM MEDICINE
    WHERE MedicineID = @MedicineID
  `);
  return result.recordset[0] || null;
}

async function createMedicine(data) {
  const request = new sql.Request();
  request.input("MedicineID", sql.NVarChar, data.MedicineID);
  request.input("MedicineName", sql.NVarChar, data.MedicineName);
  request.input("StockQuantity", sql.Int, data.StockQuantity);
  request.input("UnitPrice", sql.Decimal(18, 2), data.UnitPrice);
  request.input("ExpiryDate", sql.Date, data.ExpiryDate);
  request.input("Category", sql.NVarChar, data.Category);

  const result = await request.query(`
    INSERT INTO MEDICINE (MedicineID, MedicineName, StockQuantity, UnitPrice, ExpiryDate, Category)
    OUTPUT inserted.MedicineID, inserted.MedicineName, inserted.StockQuantity, inserted.UnitPrice, inserted.ExpiryDate, inserted.Category
    VALUES (@MedicineID, @MedicineName, @StockQuantity, @UnitPrice, @ExpiryDate, @Category)
  `);

  return result.recordset[0];
}

async function updateMedicine(id, data) {
  const request = new sql.Request();
  request.input("MedicineID", sql.NVarChar, id);
  request.input("MedicineName", sql.NVarChar, data.MedicineName);
  request.input("StockQuantity", sql.Int, data.StockQuantity);
  request.input("UnitPrice", sql.Decimal(18, 2), data.UnitPrice);
  request.input("ExpiryDate", sql.Date, data.ExpiryDate);
  request.input("Category", sql.NVarChar, data.Category);

  const result = await request.query(`
    UPDATE MEDICINE
    SET MedicineName = @MedicineName,
      StockQuantity = @StockQuantity,
      UnitPrice = @UnitPrice,
      ExpiryDate = @ExpiryDate,
      Category = @Category
    OUTPUT inserted.MedicineID, inserted.MedicineName, inserted.StockQuantity, inserted.UnitPrice, inserted.ExpiryDate, inserted.Category
    WHERE MedicineID = @MedicineID
  `);

  return result.recordset[0] || null;
}

async function deleteMedicine(id) {
  const request = new sql.Request();
  request.input("MedicineID", sql.NVarChar, id);
  const result = await request.query(`
    DELETE FROM MEDICINE
    OUTPUT deleted.MedicineID, deleted.MedicineName, deleted.StockQuantity, deleted.UnitPrice, deleted.ExpiryDate, deleted.Category
    WHERE MedicineID = @MedicineID
  `);
  return result.recordset[0] || null;
}

module.exports = {
  getAllMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine
};
