const path = require('path');
const sql = require('mssql');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,

  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

async function connectDB() {
  try {
    await sql.connect(config);
    console.log("✅ SQL Server Connected");
  } catch (err) {
    console.error("❌ Database Connection Error");
    console.error(err);
  }
}

module.exports = connectDB;