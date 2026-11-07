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

async function tableExists(tableName) {
  const r = await sql.query(`
    SELECT 1 AS existsFlag
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_NAME = @tableName
  `, { tableName });
  return r.recordset.length > 0;
}

async function columnExists(tableName, columnName) {
  const r = await sql.query(`
    SELECT 1 AS existsFlag
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = @tableName
      AND COLUMN_NAME = @columnName
  `, { tableName, columnName });
  return r.recordset.length > 0;
}

async function ensureColumn(tableName, columnName, definitionSql) {
  if (await columnExists(tableName, columnName)) {
    console.log(`ℹ️  ${tableName}.${columnName} already exists`);
    return;
  }
  console.log(`✅ Adding ${tableName}.${columnName} ...`);
  await sql.query(`ALTER TABLE ${tableName} ADD ${definitionSql}`);
}

(async () => {
  try {
    await sql.connect(config);
    console.log('Connected to database');

    // 1) Ensure AMBULANCE table
    if (!(await tableExists('AMBULANCE'))) {
      console.log('❌ AMBULANCE table does NOT exist');
      console.log('Creating AMBULANCE table...');

      await sql.query(`
        CREATE TABLE AMBULANCE (
          AmbulanceID NVARCHAR(20) PRIMARY KEY,
          VehicleNumber NVARCHAR(50) UNIQUE NOT NULL,
          DriverName NVARCHAR(100) NOT NULL,
          Status NVARCHAR(20) DEFAULT 'Available' CHECK (Status IN ('Available', 'On Call', 'Maintenance'))
        )
      `);

      await sql.query(`
        INSERT INTO AMBULANCE (AmbulanceID, VehicleNumber, DriverName, Status)
        VALUES
          ('AMB-001', 'LK-2024-001', 'John Silva', 'Available'),
          ('AMB-002', 'LK-2024-002', 'Maria Santos', 'Available'),
          ('AMB-003', 'LK-2024-003', 'Ravi Kumar', 'Available')
      `);

      console.log('✅ AMBULANCE table created + sample data inserted');
    } else {
      // Seed AMBULANCE sample data if empty
      const countR = await sql.query(`SELECT COUNT(1) AS cnt FROM AMBULANCE`);
      const cnt = countR.recordset[0]?.cnt || 0;
      if (cnt === 0) {
        console.log('ℹ️  AMBULANCE is empty; inserting sample rows...');
        await sql.query(`
          INSERT INTO AMBULANCE (AmbulanceID, VehicleNumber, DriverName, Status)
          VALUES
            ('AMB-001', 'LK-2024-001', 'John Silva', 'Available'),
            ('AMB-002', 'LK-2024-002', 'Maria Santos', 'Available'),
            ('AMB-003', 'LK-2024-003', 'Ravi Kumar', 'Available')
        `);
        console.log('✅ Sample ambulances inserted');
      } else {
        console.log('✅ AMBULANCE table exists (non-empty)');
      }
    }

    // 2) Ensure ambulance_log table (full schema expected by UI/API)
    if (!(await tableExists('ambulance_log'))) {
      console.log('❌ ambulance_log table does NOT exist');
      console.log('Creating ambulance_log table...');

      await sql.query(`
        CREATE TABLE ambulance_log (
          LogID NVARCHAR(50) PRIMARY KEY,
          AmbulanceID NVARCHAR(20) NOT NULL,
          PatientID NVARCHAR(20) NULL,
          LogDateTime DATETIME DEFAULT GETDATE(),
          DispatchType NVARCHAR(50) NULL,
          PickupLocation NVARCHAR(200) NULL,
          DropoffLocation NVARCHAR(200) NULL,
          Destination NVARCHAR(200) NULL,
          Remarks NVARCHAR(500) NULL,
          CONSTRAINT FK_ambulance_log_ambulance FOREIGN KEY (AmbulanceID) REFERENCES AMBULANCE(AmbulanceID)
        )
      `);

      console.log('✅ ambulance_log table created');
    } else {
      // Add missing columns idempotently
      await ensureColumn('ambulance_log', 'DispatchType', 'DispatchType NVARCHAR(50) NULL');
      await ensureColumn('ambulance_log', 'PickupLocation', 'PickupLocation NVARCHAR(200) NULL');
      await ensureColumn('ambulance_log', 'DropoffLocation', 'DropoffLocation NVARCHAR(200) NULL');

      // These are required by the existing SELECT/INSERT in ambulanceLogService
      await ensureColumn('ambulance_log', 'Destination', 'Destination NVARCHAR(200) NULL');
      await ensureColumn('ambulance_log', 'Remarks', 'Remarks NVARCHAR(500) NULL');
      await ensureColumn('ambulance_log', 'PatientID', 'PatientID NVARCHAR(20) NULL');
      await ensureColumn('ambulance_log', 'LogDateTime', 'LogDateTime DATETIME DEFAULT GETDATE()');
      await ensureColumn('ambulance_log', 'AmbulanceID', 'AmbulanceID NVARCHAR(20) NOT NULL');
      await ensureColumn('ambulance_log', 'LogID', 'LogID NVARCHAR(50) NOT NULL');
    }

    // 3) Seed ambulance_log sample rows if empty
    const logsCountR = await sql.query(`SELECT COUNT(1) AS cnt FROM ambulance_log`);
    const logsCnt = logsCountR.recordset[0]?.cnt || 0;

    if (logsCnt === 0) {
      console.log('ℹ️  ambulance_log is empty; inserting sample dispatch logs...');

      await sql.query(`
        INSERT INTO ambulance_log
          (LogID, AmbulanceID, PatientID, LogDateTime, DispatchType, PickupLocation, DropoffLocation, Destination, Remarks)
        VALUES
          (
            'AL-10000001',
            'AMB-001',
            NULL,
            DATEADD(MINUTE, -180, GETDATE()),
            'Emergency Pickup',
            'Colombo 05',
            'ICU Wing A',
            'ICU Wing A',
            'Arrived on time. Patient stabilized.'
          ),
          (
            'AL-10000002',
            'AMB-002',
            NULL,
            DATEADD(MINUTE, -90, GETDATE()),
            'Patient Transfer',
            'Ward 12',
            'Radiology',
            'Radiology',
            'Transfer completed without incidents.'
          ),
          (
            'AL-10000003',
            'AMB-003',
            NULL,
            DATEADD(MINUTE, -30, GETDATE()),
            'Routine Transport',
            'Maternity Unit',
            'Post-Op Recovery',
            'Post-Op Recovery',
            'Routine transport logged.'
          )
      `);

      console.log('✅ Sample dispatch logs inserted');
    } else {
      console.log('✅ ambulance_log already has data; skipping seed');
    }

    const result = await sql.query(`
      SELECT COLUMN_NAME, DATA_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'ambulance_log'
      ORDER BY ORDINAL_POSITION
    `);

    console.log('\n=== ambulance_log columns ===');
    console.log(JSON.stringify(result.recordset, null, 2));

    await sql.close();
    console.log('\n✅ Migration + seed complete');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();

