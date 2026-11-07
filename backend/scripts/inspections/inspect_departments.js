require('dotenv').config();
const sql = require('mssql');

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
    const r = await sql.query(`SELECT TABLE_NAME, COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME IN ('DEPARTMENT','DOCTOR_DEPARTMENT') ORDER BY TABLE_NAME, ORDINAL_POSITION`);
    console.log(JSON.stringify(r.recordset, null, 2));
    const dep = await sql.query('SELECT TOP 5 * FROM DEPARTMENT');
    console.log('DEPARTMENT SAMPLE', JSON.stringify(dep.recordset, null, 2));
    const dd = await sql.query('SELECT TOP 5 * FROM DOCTOR_DEPARTMENT');
    console.log('DOCTOR_DEPARTMENT SAMPLE', JSON.stringify(dd.recordset, null, 2));
    await sql.close();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
