const { createLabTest } = require('../services/labTestService');
const connectDB = require('../config/db');

(async () => {
  try {
    await connectDB();
    const payload = {
      TestID: `LT-${Math.floor(1000 + Math.random()*9000)}`,
      PatientID: 'PT-0001',
      DoctorID: 'DR-0001',
      TestType: 'CBC',
      RequestDate: new Date().toISOString().slice(0,10),
      ResultDate: null,
      ResultValue: null,
      ReferenceRange: null,
      ResultFlag: null,
      Priority: 'Routine',
      Status: 'Pending',
      TechnicianName: null,
      Notes: null
    };

    const res = await createLabTest(payload);
    console.log('Created:', res);
    process.exit(0);
  } catch (err) {
    console.error('ERROR:', err && err.message ? err.message : err);
    if (err && err.originalError) {
      console.error('Original Error:', err.originalError);
    }
    process.exit(1);
  }
})();
