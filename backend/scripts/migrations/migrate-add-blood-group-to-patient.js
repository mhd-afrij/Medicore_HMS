const sql = require('mssql');
require('dotenv').config();

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

async function addBloodGroupColumn() {
  try {
    console.log('Connecting to database...');
    await sql.connect(config);
    console.log('✅ Connected\n');

    const checkResult = await sql.query(`
      SELECT COUNT(*) as count
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'PATIENT' AND COLUMN_NAME = 'BloodGroup'
    `);

    if (checkResult.recordset[0].count > 0) {
      console.log('✅ BloodGroup column already exists');
      await sql.close();
      return;
    }

    console.log('❌ BloodGroup column missing - adding it now...\n');

    await sql.query(`
      ALTER TABLE PATIENT
      ADD BloodGroup NVARCHAR(5) NULL
    `);

    console.log('✅ Successfully added BloodGroup column to PATIENT table');

    const result = await sql.query(`
      SELECT COLUMN_NAME, DATA_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'PATIENT'
      ORDER BY ORDINAL_POSITION
    `);

    console.log('\n=== Updated PATIENT Table Schema (columns) ===\n');
    result.recordset.forEach(col => {
      console.log(`  ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
    });

    await sql.close();
    console.log('\n✅ Migration complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

addBloodGroupColumn();

