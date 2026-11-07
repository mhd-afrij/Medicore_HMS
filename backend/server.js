const path = require('path');
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

require("dotenv").config({ path: path.resolve(__dirname, '.env') });

const app = express();

console.log('server.js loaded JWT_SECRET present:', typeof process.env.JWT_SECRET === 'string' && process.env.JWT_SECRET.length > 0);
console.log('server.js env path:', path.resolve(__dirname, '.env'));
const allowedOrigins = [process.env.CLIENT_ORIGIN || "http://localhost:5173", "http://localhost:3000"];
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

connectDB();

// Import Routes
const authRoutes = require("./routes/authRoutes");
const patientRoutes = require("./routes/patientRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const staffRoutes = require("./routes/staffRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const medicalRecordRoutes = require("./routes/medicalRecordRoutes");
const prescriptionRoutes = require("./routes/prescriptionRoutes");
const medicineRoutes = require("./routes/medicineRoutes");
const pharmacyRoutes = require("./routes/pharmacyRoutes");
const labTestRoutes = require("./routes/labTestRoutes");
const billRoutes = require("./routes/billRoutes");
const roomRoutes = require("./routes/roomRoutes");
const bedRoutes = require("./routes/bedRoutes");
const roomAllocationRoutes = require("./routes/roomAllocationRoutes");
const ambulanceRoutes = require("./routes/ambulanceRoutes");
const bloodBankRoutes = require("./routes/bloodBankRoutes");
const bloodTransfusionRoutes = require("./routes/bloodTransfusionRoutes");

// Route Mapping
app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/medical-records", medicalRecordRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/pharmacies", pharmacyRoutes);
app.use("/api/lab-tests", labTestRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/blood-bank", bloodBankRoutes);
app.use("/api/blood-transfusions", bloodTransfusionRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/beds", bedRoutes);
app.use("/api/room-allocations", roomAllocationRoutes);
app.use("/api/ambulance", ambulanceRoutes);

app.get("/", (req, res) => {
  res.send("Hospital Management Backend Running");
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});