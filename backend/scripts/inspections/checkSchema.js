const sql = require('mssql');
require('dotenv').config();

console.log('Loaded DB env:');
console.log('DB_SERVER=', process.env.DB_SERVER);
console.log('DB_PORT=', process.env.DB_PORT);
console.log('DB_NAME=', process.env.DB_NAME);
console.log('DB_USER=', process.env.DB_USER ? 'set' : 'unset');
console.log('DB_PASSWORD=', process.env.DB_PASSWORD ? 'set' : 'unset');

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT),
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

(async () => {
  try {
    await sql.connect(config);
    const result = await sql.query(`
      SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME IN ('APPOINTMENT','PATIENT','DOCTOR')
      ORDER BY TABLE_NAME, ORDINAL_POSITION
    `);
    
    console.log('\n=== SCHEMA ===\n');
    result.recordset.forEach(col => {
      console.log(`${col.TABLE_NAME}: ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
    });
    
    await sql.close();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
