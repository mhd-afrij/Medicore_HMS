const sql = require('mssql');
require('dotenv').config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT),
  options: { encrypt: false, trustServerCertificate: true }
};

(async () => {
  try {
    await sql.connect(config);
    const res = await sql.query(`
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'LAB_TEST'
      ORDER BY ORDINAL_POSITION
    `);
    console.log(JSON.stringify(res.recordset, null, 2));
    await sql.close();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
