const sql = require("mssql");

async function getAllBloodBanks() {
  const result = await sql.query(`
    SELECT BloodID, BloodGroup, AvailableUnits, DonorName, CollectionDate, ExpiryDate
    FROM BLOOD_BANK
  `);
  return result.recordset;
}

async function createBloodBank(data) {

  // Generate next BloodID
  const idResult = await new sql.Request().query(`
    SELECT TOP 1 BloodID
    FROM BLOOD_BANK
    ORDER BY BloodID DESC
  `);

  let bloodID = "B001";

  if (idResult.recordset.length > 0) {
    const lastId = idResult.recordset[0].BloodID;
    const nextNumber = parseInt(lastId.substring(1)) + 1;
    bloodID = `B${nextNumber.toString().padStart(3, "0")}`;
  }

  const request = new sql.Request();

  request.input("BloodID", sql.NVarChar, bloodID);
  request.input("BloodGroup", sql.NVarChar, data.BloodGroup);
  request.input("AvailableUnits", sql.Int, data.AvailableUnits);
  request.input("DonorName", sql.NVarChar, data.DonorName);
  request.input("CollectionDate", sql.Date, data.CollectionDate);
  request.input("ExpiryDate", sql.Date, data.ExpiryDate);

  const result = await request.query(`
    INSERT INTO BLOOD_BANK
    (
      BloodID,
      BloodGroup,
      AvailableUnits,
      DonorName,
      CollectionDate,
      ExpiryDate
    )
    OUTPUT
      inserted.BloodID,
      inserted.BloodGroup,
      inserted.AvailableUnits,
      inserted.DonorName,
      inserted.CollectionDate,
      inserted.ExpiryDate
    VALUES
    (
      @BloodID,
      @BloodGroup,
      @AvailableUnits,
      @DonorName,
      @CollectionDate,
      @ExpiryDate
    )
  `);

  return result.recordset[0];
}

module.exports = {
  getAllBloodBanks,
  createBloodBank
};
