const path = require('path');
const sql = require('mssql');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT, 10),
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

async function addMedicineColumn() {
  try {
    console.log('Connecting to database...');
    await sql.connect(config);
    console.log('✅ Connected\n');

    const checkResult = await sql.query(`
      SELECT COUNT(*) as count
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'PRESCRIPTION' AND COLUMN_NAME = 'Medicine'
    `);

    if (checkResult.recordset[0].count > 0) {
      console.log('✅ Medicine column already exists in PRESCRIPTION table');
      await sql.close();
      return;
    }

    console.log('❌ Medicine column missing - adding it now...\n');

    await sql.query(`
      ALTER TABLE PRESCRIPTION
      ADD Medicine NVARCHAR(MAX) NULL
    `);

    console.log('✅ Successfully added Medicine column to PRESCRIPTION table');

    const result = await sql.query(`
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'PRESCRIPTION'
      ORDER BY ORDINAL_POSITION
    `);

    console.log('\n=== Updated PRESCRIPTION Table Schema ===\n');
    result.recordset.forEach(col => {
      console.log(`  ${col.COLUMN_NAME} (${col.DATA_TYPE}${col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH})` : ''})`);
    });

    await sql.close();
    console.log('\n✅ Migration complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

addMedicineColumn();
