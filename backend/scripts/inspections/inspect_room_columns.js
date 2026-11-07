const sql = require('mssql');
const config = require('../config/db');

(async () => {
  try {
    await sql.connect(config);
    const result = await sql.query(`
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'ROOM'
      ORDER BY ORDINAL_POSITION
    `);
    console.log(JSON.stringify(result.recordset, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
