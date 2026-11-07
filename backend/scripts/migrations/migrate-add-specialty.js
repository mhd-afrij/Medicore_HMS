const sql = require('mssql');
require('dotenv').config();

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

async function addSpecialtyColumn() {
  try {
    console.log('Connecting to database...');
    await sql.connect(config);
    console.log('✅ Connected\n');

    // Check if Specialty column exists
    console.log('Checking for Specialty column...');
    const checkResult = await sql.query(`
      SELECT COUNT(*) as count
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'DOCTOR' AND COLUMN_NAME = 'Specialty'
    `);

    if (checkResult.recordset[0].count > 0) {
      console.log('✅ Specialty column already exists');
      await sql.close();
      return;
    }

    console.log('❌ Specialty column missing - adding it now...\n');

    // Add Specialty column
    await sql.query(`
      ALTER TABLE DOCTOR
      ADD Specialty NVARCHAR(100) NULL
    `);

    console.log('✅ Successfully added Specialty column to DOCTOR table');

    // Verify it was added
    const result = await sql.query(`
      SELECT COLUMN_NAME, DATA_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'DOCTOR'
      ORDER BY ORDINAL_POSITION
    `);

    console.log('\n=== Updated DOCTOR Table Schema ===\n');
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

addSpecialtyColumn();
