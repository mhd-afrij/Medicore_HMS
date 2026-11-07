const sql = require('mssql');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

(async () => {
  try {
    const config = {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      server: process.env.DB_SERVER,
      database: process.env.DB_NAME,
      port: parseInt(process.env.DB_PORT, 10),
      options: { encrypt: false, trustServerCertificate: true },
      requestTimeout: 60000,
      connectionTimeout: 60000
    };

    const pool = await sql.connect(config);
    const result = await pool.request().query(
      "SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'PRESCRIPTION' ORDER BY ORDINAL_POSITION;"
    );
    console.log(JSON.stringify(result.recordset, null, 2));
    await pool.close();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
