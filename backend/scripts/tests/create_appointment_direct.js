require('dotenv').config();
const sql = require('mssql');
const { createAppointment } = require('../services/appointmentService');

(async () => {
  try {
    const config = {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      server: process.env.DB_SERVER,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT),
      options: { encrypt: false, trustServerCertificate: true }
    };

    await sql.connect(config);

    const appointment = {
      // AppointmentID limited to varchar(10) in DB
      AppointmentID: 'APT1000001',
      PatientID: 'PT-7230',
      DoctorID: 'DR-TEST-1',
      AppointmentDate: '2026-06-21',
      AppointmentTime: '08:00:00',
      Status: 'Scheduled'
    };

    const result = await createAppointment(appointment);
    console.log('CREATED', JSON.stringify(result, null, 2));
    await sql.close();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
