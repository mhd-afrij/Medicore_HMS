const sql = require("mssql");

function mapAppointmentRow(row) {
  const appointmentTime = row.AppointmentTime;

  const doctorName =
    row.DoctorName ||
    `${row.DoctorFirstName || ""} ${row.DoctorLastName || ""}`.trim();

  return {
    appointmentId: row.AppointmentID,
    appointmentDate: row.AppointmentDate,
    appointmentTime,


    status: row.Status,
    patient: {
      id: row.PatientID,
      firstName: row.PatientFirstName || "",
      lastName: row.PatientLastName || ""
    },
    doctor: {
      id: row.DoctorID,
      name: doctorName
    }
  };
}

async function getAllAppointments() {
  const result = await sql.query(`
    SELECT a.AppointmentID,
           a.PatientID,
           p.FirstName AS PatientFirstName,
           p.LastName AS PatientLastName,
           a.DoctorID,
           d.DoctorName AS DoctorName,
           d.Specialization AS DoctorSpecialization,
           a.AppointmentDate,
           a.AppointmentTime AS AppointmentTime,
           a.Status
    FROM APPOINTMENT a
    LEFT JOIN PATIENT p ON p.PatientID = a.PatientID
    LEFT JOIN DOCTOR d ON d.DoctorID = a.DoctorID
  `);


  return result.recordset.map(mapAppointmentRow);
}

async function getAppointmentById(appointmentId) {
  const request = new sql.Request();
  request.input("appointmentId", sql.NVarChar, appointmentId);

  const result = await request.query(`
    SELECT a.AppointmentID,
           a.PatientID,
           p.FirstName AS PatientFirstName,
           p.LastName AS PatientLastName,
           a.DoctorID,
           d.DoctorName AS DoctorName,
           d.Specialization AS DoctorSpecialization,
           a.AppointmentDate,
           a.AppointmentTime AS AppointmentTime,
           a.Status
    FROM APPOINTMENT a
    LEFT JOIN PATIENT p ON p.PatientID = a.PatientID
    LEFT JOIN DOCTOR d ON d.DoctorID = a.DoctorID
    WHERE a.AppointmentID = @appointmentId
  `);


  const row = result.recordset[0];
  if (!row) return null;
  return mapAppointmentRow(row);
}

async function createAppointment(data) {
  const request = new sql.Request();

  request.input("AppointmentID", sql.NVarChar, data.AppointmentID);
  request.input("PatientID", sql.NVarChar, data.PatientID);
  request.input("DoctorID", sql.NVarChar, data.DoctorID);
  request.input("AppointmentDate", sql.Date, data.AppointmentDate);
  request.input("AppointmentTime", sql.NVarChar, data.AppointmentTime);

  const allowedStatuses = ["Cancelled", "Completed", "Pending"];

  const statusValue =
    data.Status === "Scheduled"
      ? "Pending"
      : allowedStatuses.includes(data.Status)
        ? data.Status
        : "Pending";

  request.input("Status", sql.NVarChar, statusValue);

  await request.query(`
    INSERT INTO APPOINTMENT (AppointmentID, PatientID, DoctorID, AppointmentDate, AppointmentTime, Status)
    VALUES (@AppointmentID, @PatientID, @DoctorID, @AppointmentDate, @AppointmentTime, @Status)
  `);


  return getAppointmentById(data.AppointmentID);
}

async function updateAppointment(appointmentId, data) {
  const request = new sql.Request();

  request.input("appointmentId", sql.NVarChar, appointmentId);
  request.input("PatientID", sql.NVarChar, data.PatientID);
  request.input("DoctorID", sql.NVarChar, data.DoctorID);
  request.input("AppointmentDate", sql.Date, data.AppointmentDate);
  request.input("AppointmentTime", sql.NVarChar, data.AppointmentTime);

  const allowedStatuses = ["Cancelled", "Completed", "Pending"];
  const statusValue =
    data.Status === "Scheduled"
      ? "Pending"
      : allowedStatuses.includes(data.Status)
        ? data.Status
        : "Pending";

  request.input("Status", sql.NVarChar, statusValue);

  await request.query(`
    UPDATE APPOINTMENT
    SET PatientID = @PatientID,
        DoctorID = @DoctorID,
        AppointmentDate = @AppointmentDate,
        AppointmentTime = @AppointmentTime,
        Status = @Status
    WHERE AppointmentID = @appointmentId
  `);

  return getAppointmentById(appointmentId);
}

async function deleteAppointment(appointmentId) {
  const request = new sql.Request();
  request.input("appointmentId", sql.NVarChar, appointmentId);

  const existing = await getAppointmentById(appointmentId);
  if (!existing) return null;

  await request.query(`DELETE FROM APPOINTMENT WHERE AppointmentID = @appointmentId`);
  return existing;
}

module.exports = {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment
};

