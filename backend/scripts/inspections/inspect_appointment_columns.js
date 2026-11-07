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
    const r = await sql.query(`SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'APPOINTMENT' ORDER BY ORDINAL_POSITION`);
    console.log(JSON.stringify(r.recordset, null, 2));
    await sql.close();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
