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

(async () => {
  try {
    await sql.connect(config);
    console.log('Connected to database');

    // Check existing columns
    const checkResult = await sql.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'BLOOD_BANK'
    `);
    const existingColumns = checkResult.recordset.map(r => r.COLUMN_NAME);
    console.log('Existing columns:', existingColumns);

    // Add missing columns
    if (!existingColumns.includes('DonorName')) {
      await sql.query(`ALTER TABLE BLOOD_BANK ADD DonorName NVARCHAR(100) NULL`);
      console.log('✅ Added DonorName column');
    } else {
      console.log('⏭️  DonorName already exists');
    }

    if (!existingColumns.includes('CollectionDate')) {
      await sql.query(`ALTER TABLE BLOOD_BANK ADD CollectionDate DATE NULL`);
      console.log('✅ Added CollectionDate column');
    } else {
      console.log('⏭️  CollectionDate already exists');
    }

    if (!existingColumns.includes('ExpiryDate')) {
      await sql.query(`ALTER TABLE BLOOD_BANK ADD ExpiryDate DATE NULL`);
      console.log('✅ Added ExpiryDate column');
    } else {
      console.log('⏭️  ExpiryDate already exists');
    }

    // Verify final schema
    const finalResult = await sql.query(`
      SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'BLOOD_BANK' ORDER BY ORDINAL_POSITION
    `);
    console.log('\nFinal BLOOD_BANK schema:');
    console.log(JSON.stringify(finalResult.recordset, null, 2));

    await sql.close();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
