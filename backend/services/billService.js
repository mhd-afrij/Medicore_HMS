const sql = require("mssql");

async function getAllBills() {
  const result = await sql.query(`
      SELECT *
      FROM BILL
      ORDER BY BillDate DESC
  `);

  return result.recordset;
}

async function createBill(data) {
  const request = new sql.Request();

  request.input("BillID", sql.VarChar, data.BillID);
  request.input("PatientID", sql.VarChar, data.PatientID);
  request.input("AppointmentID", sql.VarChar, data.AppointmentID);
  request.input("TotalAmount", sql.Decimal(10,2), data.TotalAmount);
  request.input("PaymentStatus", sql.VarChar, data.PaymentStatus);
  request.input("BillDate", sql.Date, data.BillDate);

  // Insert without OUTPUT to avoid SQL Server trigger restriction.
  await request.query(`
    INSERT INTO BILL
    (
      BillID,
      PatientID,
      AppointmentID,
      TotalAmount,
      PaymentStatus,
      BillDate
    )
    VALUES
    (
      @BillID,
      @PatientID,
      @AppointmentID,
      @TotalAmount,
      @PaymentStatus,
      @BillDate
    )
  `);

  // Select the inserted row by BillID (assumes BillID is unique/primary key)
  const selectResult = await request.query(`
    SELECT *
    FROM BILL
    WHERE BillID = @BillID
  `);

  return selectResult.recordset[0];
}

async function updateBillStatus(id, status) {
  const request = new sql.Request();

  request.input("BillID", sql.VarChar, id);
  request.input("PaymentStatus", sql.VarChar, status);

  // Update without OUTPUT; then select the updated row.
  await request.query(`
      UPDATE BILL
      SET PaymentStatus = @PaymentStatus
      WHERE BillID = @BillID
  `);

  const selectResult = await request.query(`
      SELECT *
      FROM BILL
      WHERE BillID = @BillID
  `);

  return selectResult.recordset[0];
}

module.exports = {
  getAllBills,
  createBill,
  updateBillStatus
};