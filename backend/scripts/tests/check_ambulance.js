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

    // Check if AMBULANCE table exists
    const tablesResult = await sql.query(`
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'AMBULANCE'
    `);

    if (tablesResult.recordset.length === 0) {
      console.log('❌ AMBULANCE table does NOT exist');
      console.log('\nCreating AMBULANCE table...');
      
      await sql.query(`
        CREATE TABLE AMBULANCE (
          AmbulanceID NVARCHAR(20) PRIMARY KEY,
          VehicleNumber NVARCHAR(50) UNIQUE NOT NULL,
          DriverName NVARCHAR(100) NOT NULL,
          Status NVARCHAR(20) DEFAULT 'Available' CHECK (Status IN ('Available', 'On Call', 'Maintenance'))
        )
      `);
      console.log('✅ AMBULANCE table created');

      // Insert sample data
      console.log('\nInserting sample data...');
      await sql.query(`
        INSERT INTO AMBULANCE (AmbulanceID, VehicleNumber, DriverName, Status)
        VALUES 
          ('AMB-001', 'LK-2024-001', 'John Silva', 'Available'),
          ('AMB-002', 'LK-2024-002', 'Maria Santos', 'Available'),
          ('AMB-003', 'LK-2024-003', 'Ravi Kumar', 'Available')
      `);
      console.log('✅ Sample data inserted');
    } else {
      console.log('✅ AMBULANCE table exists');
    }

    // Check ambulance_log table
    const logTableResult = await sql.query(`
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'ambulance_log'
    `);

    if (logTableResult.recordset.length === 0) {
      console.log('❌ ambulance_log table does NOT exist');
      console.log('\nCreating ambulance_log table...');
      
      await sql.query(`
        CREATE TABLE ambulance_log (
          LogID NVARCHAR(50) PRIMARY KEY,
          AmbulanceID NVARCHAR(20) NOT NULL FOREIGN KEY REFERENCES AMBULANCE(AmbulanceID),
          PatientID NVARCHAR(20),
          LogDateTime DATETIME DEFAULT GETDATE(),
          Destination NVARCHAR(200),
          Remarks NVARCHAR(500)
        )
      `);
      console.log('✅ ambulance_log table created');
    } else {
      console.log('✅ ambulance_log table exists');
    }

    // Display current data
    console.log('\n=== AMBULANCE TABLE DATA ===');
    const ambulancesResult = await sql.query('SELECT * FROM AMBULANCE');
    console.log(ambulancesResult.recordset);

    console.log('\n=== AMBULANCE_LOG TABLE DATA ===');
    const logsResult = await sql.query('SELECT * FROM ambulance_log ORDER BY LogDateTime DESC');
    console.log(logsResult.recordset);

    await sql.close();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
