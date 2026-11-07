(async () => {
  const API = 'http://localhost:3000';
  try {
    // login
    const loginResp = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin26' })
    });
    const loginData = await loginResp.json();
    if (!loginData?.success) {
      console.error('Login failed', loginData);
      process.exit(1);
    }
    const token = loginData.data.token;

    const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

    // fetch lists
    const [pResp, dResp, mResp, mrResp] = await Promise.all([
      fetch(`${API}/api/patients`, { headers }),
      fetch(`${API}/api/doctors`, { headers }),
      fetch(`${API}/api/medicines`, { headers }),
      fetch(`${API}/api/medical-records`, { headers })
    ]);
    const patients = (await pResp.json())?.data || [];
    const doctors = (await dResp.json())?.data || [];
    const medicines = (await mResp.json())?.data || [];
    const medicalRecords = (await mrResp.json())?.data || [];

    if (!patients.length || !doctors.length || !medicines.length || !medicalRecords.length) {
      console.error('Missing necessary reference data', { patients: patients.length, doctors: doctors.length, medicines: medicines.length, medicalRecords: medicalRecords.length });
      process.exit(1);
    }

    const record = medicalRecords[0];
    const payload = {
      PrescriptionID: `PR-${Math.floor(2000 + Math.random() * 1000)}`,
      MedicalRecordID: record.RecordID,
      DoctorID: doctors[0].DoctorID || doctors[0].ID || doctors[0].id,
      PrescriptionDate: new Date().toISOString(),
      Medicine: [medicines[0].MedicineID || medicines[0].ID || medicines[0].id]
    };

    const createResp = await fetch(`${API}/api/prescriptions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    const createData = await createResp.json();
    console.log('Create response status', createResp.status);
    console.log(JSON.stringify(createData, null, 2));
  } catch (err) {
    console.error('Error', err);
    process.exit(1);
  }
})();
